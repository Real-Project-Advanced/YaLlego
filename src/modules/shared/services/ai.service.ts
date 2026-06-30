export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const MOBILITY_SYSTEM_PROMPT = `Eres SmartOps Medellin, un asistente exclusivo de movilidad urbana del Valle de Aburra.

Solo puedes responder preguntas sobre rutas, transporte publico, caminatas, tiempos aproximados, estaciones, barrios, lugares de Medellin y opciones para moverse por la ciudad.

Si el usuario pregunta por otro tema, responde brevemente: "Solo puedo ayudarte con movilidad y rutas en Medellin. Dime desde donde sales y hacia donde vas." No expliques temas externos aunque el usuario insista.`;

export class AIService {
  private static endpoint = process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11434/api';
  private static model = process.env.OLLAMA_MODEL || 'smartops-bot';

  /**
   * Envía una pregunta al modelo y obtiene la respuesta completa.
   */
  static async chat(messages: Message[]) {
    try {
      const response = await fetch(`${this.endpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: MOBILITY_SYSTEM_PROMPT },
            ...messages.filter((message) => message.role !== 'system'),
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message.content;
    } catch (error) {
      console.error('Error in AIService.chat:', error);
      throw error;
    }
  }

  /**
   * Versión para streaming (para respuestas que se escriben en tiempo real)
   */
  static async streamChat(messages: Message[]) {
    try {
      const response = await fetch(`${this.endpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: MOBILITY_SYSTEM_PROMPT },
            ...messages.filter((message) => message.role !== 'system'),
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      return response.body; // Retorna el stream legible
    } catch (error) {
      console.error('Error in AIService.streamChat:', error);
      throw error;
    }
  }
}
