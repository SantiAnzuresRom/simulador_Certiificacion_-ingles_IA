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
    { text: "¡Hola! Soy tu asistente de X-Learning Online. ¿En qué puedo ayudarte?", isBot: true }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef(null); // Referencia para el área de arrastre

  // Scroll automático al último mensaje
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
    // El contenedor ocupa toda la pantalla con pointer-events-none para no bloquear el dashboard
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[100]">
      <div className="absolute bottom-6 right-6 pointer-events-auto font-sans flex flex-col items-end">
        
        {/* VENTANA DEL CHAT */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mb-4 w-[320px] md:w-[380px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
            >
              {/* Header con marca de agua */}
              <div className="bg-[#0f172a] p-5 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute right-[-10%] top-[-10%] opacity-10 rotate-12 pointer-events-none">
                  <Image src="/logo2.png" alt="" width={80} height={80} />
                </div>
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                    <Image src="/logo2.png" alt="X-Learning Logo" width={20} height={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Asistente AI</span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">En línea</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsOpen(false)} 
                  className="hover:bg-white/10 p-2 rounded-xl transition-colors"
                  aria-label="Cerrar chat"
                  title="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Caja de mensajes */}
              <div ref={scrollRef} className="h-80 md:h-96 p-6 overflow-y-auto flex flex-col gap-4 bg-[#f8fafc]">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.isBot ? "justify-start" : "justify-end"} items-end gap-2`}>
                    {m.isBot && (
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border border-slate-300">
                        <Image src="/logo2.png" alt="Avatar Bot" width={24} height={24} />
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl text-[13px] shadow-sm leading-relaxed ${
                      m.isBot 
                        ? "bg-white text-slate-800 rounded-bl-none border border-slate-100" 
                        : "bg-[#0f172a] text-white rounded-br-none border border-cyan-500/20 shadow-[0_5px_15px_rgba(6,182,212,0.1)]"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                       <Loader2 className="animate-spin text-cyan-500" size={14} />
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Escribiendo...</span>
                  </div>
                )}
              </div>

              {/* Área de Input */}
              <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
                  placeholder="Escribe un mensaje..." 
                  className="flex-1 text-sm px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 border border-slate-200 transition-all" 
                />
                <button 
                  onClick={sendMessage} 
                  disabled={isLoading || !input.trim()}
                  className="bg-[#0f172a] p-3 rounded-xl text-white hover:bg-cyan-600 disabled:opacity-50 transition-all shadow-lg active:scale-95 flex items-center justify-center"
                  aria-label="Enviar mensaje"
                >
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTÓN FLOTANTE (DRAGGABLE) */}
        <motion.button 
          drag
          dragConstraints={constraintsRef} 
          dragElastic={0.1}
          whileDrag={{ scale: 1.1, cursor: "grabbing" }}
          animate={{ 
            y: [0, -8, 0], 
          }}
          transition={{
            y: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)} 
          className="group bg-[#0f172a] text-white p-5 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-cyan-500/40 transition-shadow border-2 border-cyan-400/50 flex items-center justify-center relative overflow-hidden pointer-events-auto cursor-grab"
          aria-label="Chat de soporte"
        >
          {/* Brillo interno en hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <MessageCircle size={28} className="relative z-10 group-hover:rotate-12 transition-transform" />
          
          {/* Notificación parpadeante */}
          {!isOpen && (
            <span className="absolute top-4 right-4 w-3 h-3 bg-cyan-500 rounded-full border-2 border-[#0f172a] animate-pulse" />
          )}
        </motion.button>
      </div>
    </div>
  );
}