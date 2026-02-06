"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { text: "¡Hola! Soy tu asistente de X-Learning ONline. ¿En qué puedo ayudarte?", isBot: true }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

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
      setMessages(prev => [...prev, { text: "Error de conexión con el server, bro.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header con logo2 como marca de agua */}
            <div className="bg-[#0f172a] p-5 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-[-10%] top-[-10%] opacity-10 rotate-12 pointer-events-none">
                <Image src="/logo2.png" alt="" width={80} height={80} />
              </div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-sky-400/20 flex items-center justify-center border border-sky-400/30">
                  <Image src="/logo2.png" alt="Certifica AI Logo" width={20} height={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Asistente AI</span>
              </div>

              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-white/10 p-2 rounded-xl transition-colors"
                title="Cerrar chat"
                aria-label="Cerrar chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mensajes con Logo2 como Avatar */}
            <div ref={scrollRef} className="h-96 p-6 overflow-y-auto flex flex-col gap-4 bg-[#f8fafc]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.isBot ? "justify-start" : "justify-end"} items-end gap-2`}>
                  {m.isBot && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border border-slate-300">
                      <Image src="/logo2.png" alt="Avatar Bot" width={24} height={24} />
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl text-[13px] shadow-sm ${m.isBot ? "bg-white text-slate-800 rounded-bl-none" : "bg-[#0f172a] text-white rounded-br-none"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="animate-spin text-sky-500 mx-auto" size={20} />}
            </div>

            {/* Input - Corrección de accesibilidad */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
                placeholder="Escribe tu duda aquí..." 
                aria-label="Mensaje para el bot"
                className="flex-1 text-sm px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 text-slate-900 border border-slate-200" 
              />
              <button 
                onClick={sendMessage} 
                disabled={isLoading || !input.trim()}
                title="Enviar mensaje"
                aria-label="Enviar mensaje"
                className="bg-[#0f172a] p-3 rounded-xl text-white hover:bg-sky-500 disabled:opacity-50 transition-all shadow-lg active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante con Logo2 integrado */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        title="Abrir chat de soporte"
        aria-label="Abrir chat de soporte"
        className="group bg-[#0f172a] text-white p-5 rounded-3xl shadow-xl hover:shadow-sky-500/20 transition-all border-2 border-sky-400/50 flex items-center justify-center relative overflow-hidden"
      >
        <MessageCircle size={28} className="relative z-10" />
      </button>
    </div>
  );
}