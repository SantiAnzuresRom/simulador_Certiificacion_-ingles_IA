"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Headphones, Mic2, PenTool, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ModulosPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedLevel") || "A1";
    }
    return "A1";
  });

  const modules = [
    { id: "reading", title: "Reading", icon: <BookOpen size={28} />, progress: 75, color: "#10b981" },
    { id: "listening", title: "Listening", icon: <Headphones size={28} />, progress: 45, color: "#87CEEB" },
    { id: "writing", title: "Writing", icon: <PenTool size={28} />, progress: 30, color: "#64748b" },
    { id: "speaking", title: "Speaking", icon: <Mic2 size={28} />, progress: 10, color: "#0f172a" }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      <div className="bg-slate-900 text-white pt-16 pb-24 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-[#87CEEB] uppercase tracking-widest mb-8 hover:text-white transition-all">
            <ArrowLeft size={16} /> Volver al Dashboard
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Zap size={24} className="text-[#87CEEB] fill-[#87CEEB]" />
                <h1 className="text-4xl font-black italic uppercase">Módulos de Práctica</h1>
              </div>
              <p className="text-slate-400 text-sm">
                Nivel Seleccionado: <span className="text-[#87CEEB] font-black px-2 py-0.5 bg-white/10 rounded-md">{selectedLevel}</span>
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] w-full md:w-80 shadow-2xl">
              <div className="flex justify-between text-[10px] font-black uppercase mb-3 text-slate-400">
                <span>Progreso General</span>
                <span className="text-[#87CEEB]">40%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#87CEEB] w-[40%] shadow-[0_0_15px_#87CEEB]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl group hover:border-[#87CEEB] transition-all relative"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 mb-8 group-hover:bg-slate-900 group-hover:text-[#87CEEB] transition-all">
                {mod.icon}
              </div>
              <h3 className="text-lg font-black tracking-tight mb-4">{mod.title}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end text-[10px] font-black text-slate-400 uppercase">
                  <span>Progreso</span>
                  <span className="text-slate-900">{mod.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${mod.progress}%`, backgroundColor: mod.color }} />
                </div>
              </div>
              <button className="w-full mt-8 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                Entrar al Módulo
              </button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}