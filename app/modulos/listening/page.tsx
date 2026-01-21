"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Headphones, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const OPTIONS = [
  "It is too expensive for most cities.",
  "It significantly impacts local air quality.",
  "It requires rare types of soil.",
  "It has been replaced by vertical farming."
];

export default function ProfessionalListeningPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/modulos" className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#87CEEB]">Listening Skills</span>
            <div className="flex items-center gap-2">
              <Headphones size={16} className="text-slate-400" /> 
              <h1 className="text-sm font-bold">Audio Section: Lecture 01</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 mb-10 text-center">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-[#87CEEB]/10 rounded-full flex items-center justify-center mb-6 relative">
              {isPlaying && (
                <motion.div 
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full bg-[#87CEEB]"
                />
              )}
              <Headphones size={32} className="text-[#87CEEB] relative z-10" />
            </div>

            <h2 className="text-lg font-bold">Environmental Science Lecture</h2>
            <p className="text-slate-400 text-[10px] uppercase font-bold mb-8 font-mono">02:45</p>
            
            <div className="w-full max-w-sm flex justify-center gap-6">
              {/* CORRECCIÓN: Añadido title para el error de discernible text */}
              <button type="button" title="Reiniciar audio" className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
                <RotateCcw size={20} />
              </button>
              
              <button 
                type="button" 
                title={isPlaying ? "Pausar" : "Reproducir"}
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>
              
              <button type="button" title="Ajustar volumen" className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
                <Volume2 size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-8 text-slate-800">
            What is the professor&apos;s main point about urban reforestation?
          </h3>
          <div className="grid gap-4">
            {OPTIONS.map((opt, i) => (
              <button 
                key={i} 
                type="button"
                onClick={() => setSelectedAnswer(i)}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left text-sm
                  ${selectedAnswer === i ? "border-[#87CEEB] bg-[#87CEEB]/5 ring-1 ring-[#87CEEB]" : "border-slate-100 hover:bg-slate-50"}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center border text-[10px] font-bold 
                  ${selectedAnswer === i ? "bg-[#87CEEB] text-white" : "bg-slate-100"}`}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}