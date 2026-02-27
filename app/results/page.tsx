"use client";

import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Sparkles,
  LayoutDashboard,
  Target
} from "lucide-react";
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
  const [activeLevel, setActiveLevel] = useState<string>("--");

  const fetchFinalReport = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, "user_progress", uid));
      if (!snap.exists()) throw new Error("No hay progreso");

      const progress = snap.data();
      const level = progress.currentLevel || "A1";
      setActiveLevel(level);

      const moduleKey = `modules_${level}`;
      const scores = progress[moduleKey] || {
        reading: 0, writing: 0, listening: 0, speaking: 0,
      };

      const res = await fetch("http://127.0.0.1:8000/api/v1/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scores, level: level }),
      });

      if (!res.ok) throw new Error("Backend Error");
      const data = await res.json();
      setReport({ ...data, scores: scores });
    } catch (e) {
      console.error("Error:", e);
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

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-sans">
        <div className="relative w-24 h-24 mb-6">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute inset-0 border-b-2 border-cyan-500 rounded-full"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-2 border-t-2 border-blue-500 rounded-full"
            />
        </div>
        <p className="text-cyan-400 font-medium text-[13px] tracking-[0.3em] animate-pulse italic">
          Sincronizando reporte {activeLevel}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 lg:p-12 overflow-x-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full" />
      </div>

      <nav className="max-w-[1400px] mx-auto flex items-center justify-between mb-12 relative z-20">
        <Link href="/modulos">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm"
          >
            <ArrowLeft size={16} />
            <span className="text-[13px] font-medium italic">Volver a módulos</span>
          </motion.button>
        </Link>
        
        <Link href="/dashboard">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
          >
            <LayoutDashboard size={18} />
            <span className="text-[13px] font-bold italic tracking-wide">Dashboard de niveles</span>
          </motion.button>
        </Link>
      </nav>

      <main className="max-w-[1400px] mx-auto relative z-10">
        <header className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="px-4 py-1.5 rounded-full bg-cyan-500/5 border border-cyan-500/10 mb-8 flex items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] font-bold text-cyan-400/80 italic">Análisis finalizado</span>
            </div>

            <div className="pb-4">
              <h1 className="flex items-baseline justify-center gap-4">
                <span className="text-6xl md:text-[110px] font-light italic text-slate-400 tracking-tighter leading-none">
                  Nivel {activeLevel}
                </span>
              </h1>
            </div>
            <p className="text-slate-500 font-medium tracking-[0.5em] text-[11px] italic opacity-60">
              Reporte integral de desempeño
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <section className="xl:col-span-4 space-y-4">
            <div className="flex items-center gap-3 mb-6 px-2">
                <Target size={18} className="text-cyan-500" />
                <h3 className="text-[11px] font-bold text-slate-400 tracking-widest italic">Métricas de dominio</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
              {[
                { name: "Reading", score: report?.scores.reading, icon: BookOpen, color: "from-blue-500/20 to-blue-600/5", stroke: "text-blue-400" },
                { name: "Listening", score: report?.scores.listening, icon: Headphones, color: "from-purple-500/20 to-purple-600/5", stroke: "text-purple-400" },
                { name: "Writing", score: report?.scores.writing, icon: PenTool, color: "from-emerald-500/20 to-emerald-600/5", stroke: "text-emerald-400" },
                { name: "Speaking", score: report?.scores.speaking, icon: Mic, color: "from-orange-500/20 to-orange-600/5", stroke: "text-orange-400" },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-5 rounded-3xl group hover:border-white/10 transition-all shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${m.color} border border-white/5 ${m.stroke}`}>
                        <m.icon size={18} />
                      </div>
                      <span className="font-bold text-[14px] text-slate-300 italic">{m.name}</span>
                    </div>
                    <span className="text-2xl font-black italic text-white/90">{m.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.score}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className={`h-full bg-gradient-to-r ${m.stroke.replace("text", "from")} to-transparent`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="xl:col-span-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-slate-900/60 to-slate-900/20 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={120} className="text-cyan-400" />
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                </div>
                <h2 className="text-xl font-bold italic tracking-tight text-white/80">Recomendación estratégica</h2>
              </div>

              <div className="relative z-10">
                <blockquote className="text-xl md:text-3xl font-medium italic text-slate-100 leading-tight mb-12 max-w-3xl">
                  &quot;{report?.ai_advice}&quot;
                </blockquote>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  {report?.steps.map((step, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5 }}
                      className="bg-white/5 border border-white/5 p-6 rounded-[28px] hover:bg-white/[0.08] transition-all"
                    >
                      <div className="text-cyan-500 font-bold text-[10px] tracking-widest mb-3 opacity-50 italic">
                        Fase 0{i + 1}
                      </div>
                      <p className="text-[14px] font-medium text-slate-300 leading-relaxed italic">
                        {step}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      <footer className="max-w-[1400px] mx-auto mt-20 pt-8 border-t border-white/5 text-center">
        <p className="text-[10px] font-medium text-slate-600 tracking-[0.3em] italic">Core Engine v3.0 // 2026</p>
      </footer>
    </div>
  );
}