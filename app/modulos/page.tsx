"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Headphones, Home, Mic2, PenTool, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../src/firebase/config";

export default function ModulosPage() {
  const [percentages, setPercentages] = useState({ reading: 0, listening: 0, writing: 0, speaking: 0 });
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const progressRef = doc(db, "user_progress", user.uid);
        const snap = await getDoc(progressRef);
        if (snap.exists() && snap.data().modules) {
          const m = snap.data().modules;
          const scores = {
            reading: m.reading || 0,
            listening: m.listening || 0,
            writing: m.writing || 0,
            speaking: m.speaking || 0,
          };
          setPercentages(scores);
          const average = (scores.reading + scores.listening + scores.writing + scores.speaking) / 4;
          setOverallProgress(Math.round(average));
        }
      }
    });
    return () => unsub();
  }, []);

  const modulos = [
    { id: "reading", title: "Reading", icon: <BookOpen />, path: "/modulos/reading", color: "from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/20", p: percentages.reading },
    { id: "listening", title: "Listening", icon: <Headphones />, path: "/modulos/listening", color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20", p: percentages.listening },
    { id: "writing", title: "Writing", icon: <PenTool />, path: "/modulos/writing", color: "from-purple-500 to-pink-600", shadow: "shadow-purple-500/20", p: percentages.writing },
    { id: "speaking", title: "Speaking", icon: <Mic2 />, path: "/modulos/speaking", color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20", p: percentages.speaking },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 overflow-y-auto scrollbar-hide relative selection:bg-cyan-500/30">
      {/* OCULTAR SCROLLBAR */}
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        html { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-5xl mx-auto relative z-10">
        <header className="flex flex-col mb-20">
          <div className="flex justify-between items-center w-full mb-12">
            {/* LOGO3 GIGANTE */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Image 
                src="/logo3.png" 
                alt="Logo" 
                width={350} 
                height={110} 
                className="drop-shadow-[0_0_20px_rgba(6,182,212,0.3)] object-contain"
                priority 
              />
            </motion.div>
            
            <Link href="/dashboard" className="p-4 bg-white/5 border border-white/10 rounded-[24px] hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white group backdrop-blur-md">
              <Home size={28} className="group-hover:scale-110 transition-transform" />
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
            <div>
              <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-[0.8] mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                Módulos
              </h1>
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-cyan-400" />
                <p className="text-cyan-400/60 font-black uppercase text-[11px] tracking-[0.6em] italic">Hyper_Learning_Protocol</p>
              </div>
            </div>

            {/* OVERALL PROGRESS CARD */}
            <div className="bg-slate-900/40 backdrop-blur-2xl p-6 rounded-[32px] border border-white/5 min-w-[280px]">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Mastery</span>
                <span className="text-3xl font-black italic text-cyan-400">{overallProgress}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }} 
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]" 
                />
              </div>
            </div>
          </div>
        </header>

        {/* GRID DE CARDVIEWS ELEGANTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modulos.map((m, index) => (
            <Link href={m.path} key={m.id}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-48 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[40px] p-8 overflow-hidden transition-all hover:border-white/20"
              >
                {/* EFECTO DE LUZ AL PASAR EL MOUSE */}
                <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                
                <div className="flex h-full justify-between items-center relative z-10">
                  <div className="flex items-center gap-8">
                    {/* ICONO CON GRADIENTE */}
                    <div className={`w-20 h-20 rounded-[28px] bg-gradient-to-br ${m.color} flex items-center justify-center text-[#020617] shadow-2xl transition-transform group-hover:rotate-6`}>
                      {m.icon}
                    </div>
                    
                    <div>
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2 group-hover:text-white transition-colors">
                        {m.title}
                      </h2>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.p}% MASTERED</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white/5 p-3 rounded-full group-hover:bg-white/10 transition-colors">
                      <ChevronRight size={24} className="text-slate-600 group-hover:text-white" />
                    </div>
                  </div>
                </div>

                {/* BARRA DE PROGRESO INFERIOR MINI */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${m.p}%` }}
                    className={`h-full bg-gradient-to-r ${m.color}`}
                  />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* FOOTER DECOR */}
        <div className="mt-20 flex justify-center opacity-10 grayscale">
          <Image src="/logo2.png" alt="X" width={60} height={60} />
        </div>
      </main>
    </div>
  );
}