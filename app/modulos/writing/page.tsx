"use client";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  LayoutGrid,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

interface EvaluationResult {
  score: number;
  feedback: string;
}

export default function ProfessionalWritingPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPrompt, setFetchingPrompt] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [prompt, setPrompt] = useState("loading your writing task...");
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const fetchPrompt = useCallback(async (level: string) => {
    try {
      setFetchingPrompt(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "writing", level: level || "A1" }),
      });
      if (!res.ok) throw new Error("server error");
      const data = await res.json();
      setPrompt(data.passage || data.title || "write about your daily professional routine.");
    } catch (e) {
      console.error("error fetching prompt", e);
      setPrompt("describe the benefits of teamwork in a global company.");
    } finally {
      setFetchingPrompt(false);
    }
  }, []);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserUid(user.uid);
        try {
          const snap = await getDoc(doc(db, "user_progress", user.uid));
          const level = snap.exists() ? snap.data().currentLevel : "A1";
          setSelectedLevel(level || "A1");
          fetchPrompt(level || "A1");
        } catch (err) {
          fetchPrompt("A1");
        }
      } else {
        router.replace("/login");
      }
    });
    return () => unsub();
  }, [fetchPrompt, router]);

  const updateFirebaseProgress = async (finalScore: number) => {
    if (!userUid) return;
    try {
      const progressRef = doc(db, "user_progress", userUid);
      const snap = await getDoc(progressRef);
      const currentData = snap.data() || {};
      const levelKey = `modules_${selectedLevel}`;

      const currentStats = currentData[levelKey] || {
        listening: 0, reading: 0, speaking: 0, writing: 0,
      };
      const newStats = { ...currentStats, writing: finalScore };

      const avg = Math.round(
        (newStats.reading + newStats.listening + newStats.writing + newStats.speaking) / 4
      );

      await updateDoc(progressRef, {
        [levelKey]: newStats,
        [`progress_${selectedLevel}`]: avg,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("error saving writing progress:", error);
    }
  };

  const handleSubmit = async () => {
    if (wordCount < 10) return alert("tu composición es muy corta.");
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/grade-writing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          level: selectedLevel,
          prompt: prompt,
        }),
      });
      if (!response.ok) throw new Error("evaluation failed");
      const data = await response.json();
      const evaluation: EvaluationResult = {
        score: Number(data.score) || 0,
        feedback: data.feedback || "keep practicing!",
      };
      setResult(evaluation);
      await updateFirebaseProgress(evaluation.score);
      setShowModal(true);
    } catch (error) {
      alert("hubo un error con la evaluación.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPrompt) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-sans">
        <div className="relative w-24 h-24 mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-0 border-b-2 border-emerald-500 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-2 border-t-2 border-cyan-500 rounded-full"
          />
        </div>
        <p className="text-emerald-400 font-medium text-[13px] tracking-[0.3em] animate-pulse italic ">
          Generando contenido para escribir en nivel {selectedLevel}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full opacity-50" />
      </div>

      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/modulos"
            className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-inner group"
          >
            <ArrowLeft size={18} className="text-slate-400 group-hover:text-white transition-colors" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-xl text-[#020617] shadow-lg shadow-emerald-500/20">
              W
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-500 italic tracking-[0.1em] mb-0.5 ">
                certifica ai
              </p>
              <h1 className="text-xl font-black italic tracking-tighter flex items-center gap-2 ">
                <FileText size={18} className="text-emerald-500" /> writing lab
              </h1>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="bg-slate-900 px-5 py-2.5 rounded-xl border border-white/5 shadow-inner text-right">
            <p className="text-[9px] font-bold text-slate-500 italic tracking-widest ">target_level</p>
            <p className="text-xs font-black text-emerald-400 italic">{selectedLevel}</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || text.length < 5}
            className="px-8 py-4 bg-white hover:bg-emerald-400 text-[#020617] text-[11px] font-black italic tracking-[0.2em] rounded-full transition-all disabled:opacity-20 flex items-center gap-3 active:scale-95 shadow-xl shadow-white/5 group"
          >
            {loading ? (
              <span className="flex items-center gap-2 italic">analizando...</span>
            ) : (
              <>
                analizar texto <Send size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-slate-950 to-slate-900/50 p-10 rounded-[45px] border border-white/10 shadow-3xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-500"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <h3 className="text-[10px] font-bold text-emerald-500 italic tracking-[0.4em] mb-6 flex items-center gap-2 ">
              neural_prompt_v2
            </h3>
            <p className="text-2xl font-black leading-tight text-white italic tracking-tight mb-8 ">
              &quot;{prompt}&quot;
            </p>
            <button
              onClick={() => fetchPrompt(selectedLevel)}
              className="p-3 text-slate-400 hover:text-emerald-400 transition-colors bg-white/5 rounded-xl border border-white/5"
            >
              <RotateCcw size={18} />
            </button>
          </motion.div>

          <div className="bg-emerald-500/5 p-10 rounded-[45px] border border-emerald-500/10 text-center shadow-inner">
            <span className="text-[10px] font-bold text-emerald-500 italic tracking-widest block mb-2 ">word_count</span>
            <span className="text-7xl font-black text-white italic tracking-tighter">
              {wordCount}
            </span>
          </div>
        </div>

        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/30 backdrop-blur-sm rounded-[45px] border border-white/5 overflow-hidden min-h-[600px] flex flex-col focus-within:border-emerald-500/30 transition-all shadow-2xl"
          >
            <div className="px-10 py-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold italic tracking-widest ">
                <Sparkles size={14} className="text-emerald-400 animate-pulse" /> 
                professional_editor_v3
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="start drafting your response here..."
              className="flex-1 w-full p-12 text-xl leading-[1.8] text-slate-200 outline-none resize-none bg-transparent custom-scrollbar font-light italic"
            />
          </motion.div>
        </div>
      </main>

      {/* MODAL HORIZONTAL Y RESPONSIVO */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-[#020617]/98 backdrop-blur-3xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slate-950 to-slate-900 border border-white/10 rounded-[40px] md:rounded-[60px] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-3xl relative flex flex-col lg:flex-row"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent z-20" />
              
              {/* Columna Izquierda: Score (Fijo en Desktop) */}
              <div className="lg:w-2/5 p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/5 bg-white/[0.02]">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-inner">
                  <CheckCircle2 size={40} strokeWidth={1.5} />
                </div>
                
                <p className="text-emerald-500/60 text-[14px] font-bold italic tracking-[0.5em] mb-2 ">
                  Análisis finalizado
                </p>

                <div className="flex items-baseline gap-2 mb-8">
                  <h2 className="text-8xl md:text-[11rem] font-black italic tracking-tighter text-white leading-none">
                    {result?.score}
                  </h2>
                  <span className="text-4xl md:text-6xl font-black text-emerald-500 italic">%</span>
                </div>

                <div className="hidden lg:grid grid-cols-1 gap-4 w-full">
                  <button
                    onClick={() => { setShowModal(false); setText(""); }}
                    className="w-full py-5 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-bold italic text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all "
                  >
                    <RotateCcw size={18} /> reintentar misión
                  </button>
                  <button
                    onClick={() => router.push("/modulos")}
                    className="w-full py-5 bg-emerald-600 text-[#020617] rounded-2xl font-black italic text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 "
                  >
                    <LayoutGrid size={18} /> volver a módulos
                  </button>
                </div>
              </div>

              {/* Columna Derecha: Feedback (Scrollable) */}
              <div className="lg:w-3/5 p-8 md:p-12 lg:p-16 flex flex-col overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-8 bg-emerald-500/50" />
                  <h3 className="text-[14px] font-bold text-emerald-500 italic tracking-[0.4em] ">
                    Retroalimentación del texto
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 mb-8">
                  <p className="text-lg md:text-xl text-slate-300 leading-[1.8] font-light italic  whitespace-pre-wrap">
                    &quot;{result?.feedback}&quot;
                  </p>
                </div>

                {/* Botones visibles solo en mobile/tablet dentro del flujo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
                  <button
                    onClick={() => { setShowModal(false); setText(""); }}
                    className="w-full py-5 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-bold italic text-[10px] tracking-widest flex items-center justify-center gap-3 "
                  >
                    <RotateCcw size={18} /> reintentar
                  </button>
                  <button
                    onClick={() => router.push("/modulos")}
                    className="w-full py-5 bg-emerald-600 text-[#020617] rounded-2xl font-black italic text-[10px] tracking-widest flex items-center justify-center gap-3 "
                  >
                    <LayoutGrid size={18} /> finalizar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.5); }
      `}</style>
    </div>
  );
}