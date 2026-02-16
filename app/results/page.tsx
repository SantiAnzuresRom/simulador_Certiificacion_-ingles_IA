"use client";

import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Sparkles,
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
        reading: 0,
        writing: 0,
        listening: 0,
        speaking: 0,
      };

      const res = await fetch("http://127.0.0.1:8000/api/v1/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...scores,
          level: level,
        }),
      });

      if (!res.ok) throw new Error("Backend Error");
      const data = await res.json();

      setReport({
        ...data,
        scores: scores,
      });
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

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="relative mb-8 w-20 h-20 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full"
        />
        <p className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">
          Compilando Reporte Nivel {activeLevel}...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 overflow-x-hidden selection:bg-cyan-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-6xl mx-auto space-y-12 relative z-10">
        <header className="text-center space-y-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Zap size={14} className="text-cyan-400 fill-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
                Intelligence Report
              </span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none mb-4 text-white">
              Results{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {activeLevel}
              </span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.6em] text-[10px]">
              Diagnóstico de Competencias AI
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SKILLS COLUMN */}
          <section className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-1 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">
                Score_Matrix_v1
              </h3>
            </div>

            {[
              {
                name: "Reading",
                score: report?.scores.reading,
                icon: BookOpen,
                color: "text-blue-400",
                border: "group-hover:border-blue-500/50",
              },
              {
                name: "Listening",
                score: report?.scores.listening,
                icon: Headphones,
                color: "text-purple-400",
                border: "group-hover:border-purple-500/50",
              },
              {
                name: "Writing",
                score: report?.scores.writing,
                icon: PenTool,
                color: "text-emerald-400",
                border: "group-hover:border-emerald-500/50",
              },
              {
                name: "Speaking",
                score: report?.scores.speaking,
                icon: Mic,
                color: "text-orange-400",
                border: "group-hover:border-orange-500/50",
              },
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-[30px] flex items-center justify-between group transition-all duration-500 ${m.border}`}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`p-4 rounded-2xl bg-slate-950 border border-white/5 transition-all group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] ${m.color}`}
                  >
                    <m.icon size={22} />
                  </div>
                  <div>
                    <span className="font-black uppercase text-[10px] tracking-widest text-slate-500 block mb-1">
                      {m.name}
                    </span>
                    <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${m.score}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className={`h-full ${m.color.replace("text", "bg")}`}
                      />
                    </div>
                  </div>
                </div>
                <span className="text-3xl font-black italic text-white group-hover:text-cyan-400 transition-colors">
                  {m.score}%
                </span>
              </motion.div>
            ))}
          </section>

          {/* AI FEEDBACK COLUMN */}
          <section className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-12 rounded-[50px] relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
              <Sparkles
                className="absolute -top-10 -right-10 text-cyan-500/5 group-hover:text-cyan-500/10 transition-colors rotate-12"
                size={250}
              />

              <h2 className="text-3xl font-black italic uppercase mb-8 flex items-center gap-4 text-white">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                  <Sparkles className="text-cyan-400" size={20} />
                </div>
                Diagnostic_Feedback
              </h2>

              <p className="text-slate-200 text-xl leading-relaxed font-medium mb-12 italic border-l-4 border-cyan-500/30 pl-8 bg-cyan-500/5 py-4 rounded-r-2xl">
                &quot;{report?.ai_advice}&quot;
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {report?.steps.map((step, i) => (
                  <div
                    key={i}
                    className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all group/step hover:bg-slate-950"
                  >
                    <div className="text-cyan-500 font-black mb-4 text-[10px] tracking-widest uppercase">
                      Step_0{i + 1}
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter italic">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ACTION CARD */}
            <Link href="/dashboard" className="block group">
              <motion.div
                whileHover={{ scale: 1.01, translateY: -5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full relative overflow-hidden p-8 rounded-[40px] bg-gradient-to-br from-[#132448] to-[#1e3a5f] text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-14 h-14 bg-slate-950/60 backdrop-blur-md rounded-[20px] text-white flex items-center justify-center border border-white/10 group-hover:border-cyan-400/50 transition-all">
                    <Award size={28} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400/70 mb-1">
                      Entrenamiento Finalizado
                    </p>
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter">
                      Volver al Centro de Mando
                    </h4>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-full border border-white/5 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all duration-300 shadow-xl">
                  <ArrowRight
                    size={24}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </div>
              </motion.div>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

function Zap({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
