"use client";

import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { ArrowRight, Award, BookOpen, Headphones, Loader2, Mic, PenTool, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../src/firebase/config";

interface ReportData {
  scores: {
    reading: number;
    writing: number;
    listening: number;
    speaking: number;
  };
  ai_advice: string;
  steps: string[];
}

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportData | null>(null);

  const fetchFinalReport = async (uid: string) => {
    try {
      // 1. Traer scores de Firebase
      const snap = await getDoc(doc(db, "user_progress", uid));
      if (!snap.exists()) throw new Error("No hay progreso");
      
      const progress = snap.data();
      const scores = progress.modules || { reading: 0, writing: 0, listening: 0, speaking: 0 };
      const level = progress.currentLevel || "A1";

      // 2. Llamar a tu backend de Python para el reporte IA
      const res = await fetch("http://127.0.0.1:8000/api/v1/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...scores,
          level: level
        })
      });

      const data = await res.json();
      setReport(data);
    } catch (e) {
      console.error("Error generando reporte:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) fetchFinalReport(user.uid);
      else router.push("/login");
    });
    return () => unsub();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-cyan-500 mb-4" size={40} />
      <p className="text-cyan-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Compilando Reporte Final...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <main className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER */}
        <header className="text-center space-y-4">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="inline-block p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <Award className="text-cyan-400" size={40} />
            </div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter italic">Simulacro Completado</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.5em] text-[10px]">Certifica AI Intelligence Report</p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: SCORES */}
          <section className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-cyan-500/60 mb-6">Módulos Analizados</h3>
            {[
              { name: "Reading", score: report?.scores.reading, icon: BookOpen, color: "text-blue-400" },
              { name: "Listening", score: report?.scores.listening, icon: Headphones, color: "text-purple-400" },
              { name: "Writing", score: report?.scores.writing, icon: PenTool, color: "text-emerald-400" },
              { name: "Speaking", score: report?.scores.speaking, icon: Mic, color: "text-orange-400" },
            ].map((m, i) => (
              <motion.div 
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/40 border border-white/5 p-6 rounded-[30px] flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl bg-white/5 ${m.color}`}><m.icon size={20} /></div>
                  <span className="font-bold uppercase text-xs tracking-wider">{m.name}</span>
                </div>
                <span className="text-2xl font-black italic">{m.score}%</span>
              </motion.div>
            ))}
          </section>

          {/* COLUMNA DERECHA: AI FEEDBACK */}
          <section className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 p-10 rounded-[40px] relative overflow-hidden"
            >
              <Sparkles className="absolute top-6 right-6 text-cyan-500/20" size={100} />
              <h2 className="text-2xl font-black italic uppercase mb-6 flex items-center gap-3">
                <Sparkles className="text-cyan-400" size={24} /> AI Analysis
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed font-medium mb-8">
                {report?.ai_advice}
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                {report?.steps.map((step, i) => (
                  <div key={i} className="bg-[#020617]/50 p-5 rounded-2xl border border-white/5">
                    <div className="text-cyan-500 font-black mb-2 text-xs">PASO 0{i+1}</div>
                    <p className="text-xs font-bold text-slate-400 leading-tight">{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="flex gap-4">
              <Link href="/dashboard" className="flex-1 py-6 bg-white text-black rounded-[25px] font-black uppercase text-xs tracking-[0.2em] text-center hover:bg-cyan-400 transition-all flex items-center justify-center gap-2">
                Ir al Dashboard <ArrowRight size={18} />
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}