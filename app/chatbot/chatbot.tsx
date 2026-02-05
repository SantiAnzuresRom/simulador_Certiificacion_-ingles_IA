"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { text: "¡Hola, bro! ¿Dudas con X-Learning?", isBot: true }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Error de conexión con el server.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
            // AUMENTÉ EL TAMAÑO AQUÍ: de w-80 a w-96 (más ancho)
            className="mb-4 w-96 bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#0f172a] p-4 text-white flex justify-between items-center">
              <span className="text-sm font-black uppercase tracking-widest">X-Learning Bot</span>
              <button onClick={() => setIsOpen(false)} title="Cerrar chat" aria-label="Cerrar chat">
                <X size={20} />
              </button>
            </div>

            {/* Mensajes - AUMENTÉ LA ALTURA AQUÍ: de h-64 a h-96 */}
            <div ref={scrollRef} className="h-96 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50">
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  // CAMBIO DE COLOR: text-black para ambos y bg-slate-200 para el usuario
                  className={`p-3 rounded-xl text-[12px] font-bold max-w-[85%] shadow-sm ${
                    m.isBot 
                      ? "bg-blue-100 text-black self-start" 
                      : "bg-slate-200 text-black self-end" // Antes era bg-slate-900 text-white
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {isLoading && <Loader2 className="animate-spin text-slate-400" size={16} />}
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-2 bg-white">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
                placeholder="Escribe aquí..." 
                className="flex-1 text-sm p-3 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-black font-medium" 
              />
              <button 
                onClick={sendMessage} 
                title="Enviar mensaje"
                disabled={isLoading}
                className="bg-blue-500 p-3 rounded-lg text-white hover:bg-blue-600 disabled:opacity-50 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-[#0f172a] text-white p-5 rounded-full shadow-lg hover:scale-110 transition-transform border-2 border-[#87CEEB] flex items-center justify-center"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
}