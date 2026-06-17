'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles, User } from 'lucide-react';

type Message = {
  role: 'assistant' | 'user';
  content: string;
};

const quickPrompts = [
  'Ruta mas rapida al Poblado',
  'Evitar caminatas largas',
  'Opciones desde Laureles',
];

export function UserChatbotPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Cuéntame desde dónde sales y hacia dónde vas. Te ayudo a comparar opciones.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content = input) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Chat unavailable');

      const data = await response.json();
      setMessages((current) => [...current, { role: 'assistant', content: data.content }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            'No pude conectar con el asistente ahora. Puedes revisar rutas sugeridas mientras vuelve.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="chatbot" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-700">Chatbot</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Asistente de movilidad</h2>
        </div>
        <span className="grid size-10 place-items-center rounded-lg bg-slate-950 text-white">
          <Bot size={20} />
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendMessage(prompt)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="mt-4 h-72 overflow-y-auto rounded-lg bg-slate-50 p-3">
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Sparkles size={16} />
                </span>
              )}
              <p
                className={`max-w-[82%] rounded-lg px-3 py-2 text-sm font-medium leading-6 ${
                  message.role === 'user'
                    ? 'bg-slate-950 text-white'
                    : 'border border-slate-200 bg-white text-slate-700'
                }`}
              >
                {message.content}
              </p>
              {message.role === 'user' && (
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-200 text-slate-700">
                  <User size={16} />
                </span>
              )}
            </div>
          ))}
          {isLoading && (
            <p className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-500">
              Consultando...
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex h-12 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-emerald-600">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') sendMessage();
          }}
          placeholder="Pregunta por una ruta o destino"
          className="w-full text-sm font-semibold outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={!input.trim() || isLoading}
          className="grid size-9 place-items-center rounded-lg bg-emerald-600 text-white transition disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Send size={17} />
        </button>
      </div>
    </section>
  );
}
