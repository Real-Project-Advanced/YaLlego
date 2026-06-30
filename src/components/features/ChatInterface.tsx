'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MapPin, Navigation } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hi! I am your SmartOps Medellin assistant. Where do you want to go today, or which route would you like to check?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Error connecting to AI');

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, there was an error processing your request. Make sure Ollama is running.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/50 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Navigation className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight">SmartOps Medellín</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Online Mobility AI
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full relative">
        <div
          ref={scrollRef}
          className="flex-1 space-y-5 overflow-y-auto p-4 scroll-smooth sm:space-y-6 sm:p-6"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg shrink-0',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground',
                )}
              >
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div
                className={cn(
                  'max-w-[min(82%,38rem)] break-words rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-card border border-border rounded-tl-none',
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-4 animate-pulse">
              <div className="p-2 rounded-lg bg-secondary">
                <Bot size={20} />
              </div>
              <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-t from-background to-transparent p-4 sm:p-6">
          <div className="relative glass rounded-2xl border border-border p-2 focus-within:ring-2 ring-primary/20 transition-all duration-300">
            <div className="flex items-center gap-2 px-2">
              <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ask me how to get somewhere..."
                className="min-w-0 flex-1 border-none bg-transparent py-3 text-sm focus:ring-0"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  'p-3 rounded-xl transition-all duration-300',
                  input.trim()
                    ? 'bg-primary text-primary-foreground scale-100'
                    : 'bg-muted text-muted-foreground scale-95 opacity-50',
                )}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-center text-muted-foreground uppercase tracking-widest">
            SmartOps Medellin - Smart Mobility for the City
          </p>
        </div>
      </main>
    </div>
  );
}
