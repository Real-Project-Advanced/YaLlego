import { NextRequest, NextResponse } from 'next/server';
import { AIService, Message } from '@/modules/shared/services/ai.service';
import clientPromise from '@/lib/mongodb';

const OUT_OF_SCOPE_RESPONSE =
  'Solo puedo ayudarte con movilidad y rutas en Medellin. Dime desde donde sales y hacia donde vas.';

const mobilityTerms = [
  'aeropuerto',
  'alimentador',
  'autobus',
  'barrio',
  'bus',
  'buseta',
  'cable',
  'calle',
  'caminar',
  'caminata',
  'carro',
  'comuna',
  'conductor',
  'destino',
  'direccion',
  'estacion',
  'integrado',
  'llegar',
  'llego',
  'medellin',
  'metro',
  'metroplus',
  'metrocable',
  'movilidad',
  'poblado',
  'ruta',
  'sitva',
  'taxi',
  'terminal',
  'tranvia',
  'transporte',
  'viaje',
];

const smallTalkTerms = ['hola', 'buenas', 'gracias', 'ayuda', 'buenos dias', 'buenas tardes'];

const mobilityIntentTerms = [
  'como voy',
  'como llego',
  'desde',
  'hacia',
  'hasta',
  'ir a',
  'llegar a',
  'me llevo',
  'para ir',
  'por donde',
];

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isMobilityQuestion(message: string) {
  const text = normalizeText(message);

  if (mobilityTerms.some((term) => text.includes(term))) return true;
  if (mobilityIntentTerms.some((term) => text.includes(term))) return true;

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 3 && smallTalkTerms.some((term) => text.includes(term))) {
    return true;
  }

  return false;
}

function getLastUserMessage(messages: Message[]) {
  return [...messages].reverse().find((message) => message.role === 'user');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages as Message[];

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const lastUserMessage = getLastUserMessage(messages);

    if (!lastUserMessage || !isMobilityQuestion(lastUserMessage.content)) {
      return NextResponse.json({
        role: 'assistant',
        content: OUT_OF_SCOPE_RESPONSE,
      });
    }

    // 1. Obtener respuesta de Ollama
    const aiResponse = await AIService.chat(messages);

    // 2. Loggear en MongoDB (No bloqueante)
    if (clientPromise) {
      clientPromise
        .then(async (client) => {
          const db = client.db('smartops-medellin');
          await db.collection('ai_logs').insertOne({
            timestamp: new Date(),
            conversation: messages,
            response: aiResponse,
            model: 'smartops-bot',
          });
        })
        .catch((dbError) => {
          console.error('Failed to log to MongoDB (Silent Error):', dbError);
        });
    }

    return NextResponse.json({
      role: 'assistant',
      content: aiResponse,
    });
  } catch (error) {
    console.error('API Chat Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
