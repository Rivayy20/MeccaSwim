'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Halo Kak! 👋 Aku MeccaBot, asisten virtual dari Mecca Swim. Ada yang bisa aku bantu untuk mempermudah presensi kelas renang Kakak hari ini?' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    setIsCooldown(true);

    // Cooldown 3 detik untuk mencegah 429 TooManyRequests
    setTimeout(() => {
      setIsCooldown(false);
    }, 3000);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan jaringan');
      }

      setMessages((prev) => [...prev, { role: 'model', content: data.reply }]);
    } catch (error: unknown) {
      console.error('ChatWidget error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi gangguan jaringan sementara.';
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: errorMessage }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 md:bottom-28 md:right-10 z-[100] w-[calc(100vw-3rem)] max-w-[350px] bg-white dark:bg-[#0A1C3A] rounded-2xl shadow-2xl border border-border/50 dark:border-white/10 overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold leading-tight">MeccaBot</h3>
                  <p className="text-xs text-primary-foreground/80">Selalu Aktif (Online)</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[400px] bg-slate-50 dark:bg-black/20 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-primary/10 text-primary'}`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-white/5 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-3 rounded-2xl text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-white/5 rounded-tl-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Mengetik...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-[#0A1C3A] border-t border-border/50 dark:border-white/10 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isCooldown ? "Tunggu sebentar..." : "Tanya MeccaBot..."}
                disabled={isLoading || isCooldown}
                className="flex-1 bg-slate-100 dark:bg-black/50 text-slate-900 dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading || isCooldown || !input.trim()}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 -ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[90] w-14 h-14 rounded-full bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 flex items-center justify-center focus:outline-none group"
            aria-label="Buka Chat Asisten"
          >
            <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
            
            {/* Online Indicator Badge */}
            <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#0A1C3A] rounded-full"></span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
