"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Headphones, Home, Mic2, PenTool, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cloneElement, useEffect, useState } from "react";
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
    { id: "reading", title: "Reading", icon: <BookOpen size={32} />, path: "/modulos/reading", color: "from-sky-400 to-blue-600", accent: "text-sky-400", glow: "shadow-sky-500/20", p: percentages.reading },
    { id: "listening", title: "Listening", icon: <Headphones size={32} />, path: "/modulos/listening", color: "from-blue-500 to-indigo-600", accent: "text-blue-400", glow: "shadow-blue-500/20", p: percentages.listening },
    { id: "writing", title: "Writing", icon: <PenTool size={32} />, path: "/modulos/writing", color: "from-emerald-400 to-teal-600", accent: "text-emerald-400", glow: "shadow-emerald-500/20", p: percentages.writing },
    { id: "speaking", title: "Speaking", icon: <Mic2 size={32} />, path: "/modulos/speaking", color: "from-orange-400 to-red-600", accent: "text-orange-400", glow: "shadow-orange-500/20", p: percentages.speaking },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 overflow-x-hidden selection:bg-sky-500/30 font-sans">
      {/* OCULTAR SCROLLBAR */}
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { scrollbar-width: none; }
      `}</style>

      {/* BACKGROUND DECOR - NEURAL NETWORK STYLE */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <main className="max-w-6xl mx-auto relative z-10">
        <header className="mb-24">
          <div className="flex justify-between items-center w-full mb-16">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                 <Image src="/logo2.png" alt="X" width={32} height={32} />
              </div>
              <div className="h-10 w-[1px] bg-white/10 mx-2" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Certifica_AI / Labs</h2>
            </motion.div>
            
            <Link href="/dashboard" className="group flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all backdrop-blur-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Volver_al_Panel</span>
              <Home size={18} className="text-slate-400 group-hover:text-white transition-transform group-hover:scale-110" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20"
              >
                Módulos
              </motion.h1>
              <div className="flex items-center gap-3 bg-sky-400/10 w-fit px-4 py-2 rounded-full border border-sky-400/20">
                <Zap size={14} className="text-sky-400 fill-sky-400" />
                <p className="text-sky-400 font-black uppercase text-[10px] tracking-[0.4em]">Protocolo de Entrenamiento Activo</p>
              </div>
            </div>

            {/* PROGRESS CARD V.2 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <Sparkles size={80} />
              </div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-1">Global_Mastery_Index</span>
                  <span className="text-5xl font-black italic text-white leading-none">{overallProgress}%</span>
                </div>
                <div className="text-right">
                   <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-md">Status: Optimal</span>
                </div>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }} 
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]" 
                />
              </div>
            </motion.div>
          </div>
        </header>

        {/* GRID DE MODULOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modulos.map((m, index) => (
            <Link href={m.path} key={m.id} className="block group">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[3rem] p-10 transition-all duration-500 hover:border-white/20 group-hover:bg-slate-900/60 overflow-hidden"
              >
                {/* GLOW EFFECT ON HOVER */}
                <div className={`absolute -inset-px bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-10 transition-opacity blur-xl rounded-[3rem]`} />
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-8">
                    {/* ICON CON CONTENEDOR DE DISEÑO */}
                    <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${m.color} flex items-center justify-center text-slate-950 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      {cloneElement(m.icon as React.ReactElement, { strokeWidth: 2.5 })}
                    </div>
                    
                    <div>
                      <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-3 text-white">
                        {m.title}
                      </h2>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full animate-ping ${m.accent.replace('text', 'bg')}`} />
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{m.p}% COMPLETADO</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-slate-950 transition-all duration-500 group-hover:translate-x-2">
                    <ChevronRight size={28} />
                  </div>
                </div>

                {/* BARRA DE PROGRESO INFERIOR */}
                <div className="mt-10">
                   <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      <span>Progreso_Fase</span>
                      <span className={m.accent}>{m.p}%</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${m.p}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full bg-gradient-to-r ${m.color}`}
                      />
                   </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* FOOTER: CERTIFICA AI BRANDING */}
        <footer className="mt-32 pb-12 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-4 opacity-20 group cursor-default">
            <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-white" />
            <Image src="/logo3.png" alt="Certifica AI" width={180} height={60} className="grayscale brightness-200" />
            <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-white" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-[1em] text-slate-600">Engineered by Express Learning</p>
        </footer>
      </main>
    </div>
  );
}