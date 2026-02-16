"use client";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

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
  const [prompt, setPrompt] = useState("Loading your writing task...");
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // --- OBTENER TEMA ---
  const fetchPrompt = useCallback(async (level: string) => {
    try {
      setFetchingPrompt(true);
      const res = await fetch(
        "http://127.0.0.1:8000/api/v1/generate-questions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "writing", level: level || "A1" }),
        },
      );
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setPrompt(
        data.passage ||
          data.title ||
          "Write about your daily professional routine.",
      );
    } catch (e) {
      console.error("Critical: Error fetching prompt", e);
      setPrompt("Describe the benefits of teamwork in a global company.");
    } finally {
      setFetchingPrompt(false);
    }
  }, []);

  // --- LÓGICA DE AUTENTICACIÓN Y NIVEL ---
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

  // --- ACTUALIZAR PROGRESO (FIREBASE) ---
  const updateFirebaseProgress = async (finalScore: number) => {
    if (!userUid) return;
    try {
      const progressRef = doc(db, "user_progress", userUid);
      const snap = await getDoc(progressRef);
      const currentData = snap.data() || {};
      const levelKey = `modules_${selectedLevel}`;

      const currentStats = currentData[levelKey] || {
        listening: 0,
        reading: 0,
        speaking: 0,
        writing: 0,
      };
      const newStats = { ...currentStats, writing: finalScore };

      // Promedio del nivel
      const avg = Math.round(
        (newStats.reading +
          newStats.listening +
          newStats.writing +
          newStats.speaking) /
          4,
      );

      await updateDoc(progressRef, {
        [levelKey]: newStats,
        [`progress_${selectedLevel}`]: avg,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving writing progress:", error);
    }
  };

  // --- ENVIAR EVALUACIÓN ---
  const handleSubmit = async () => {
    if (wordCount < 10) return alert("Tu composición es muy corta.");
    setLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/grade-writing",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: text,
            level: selectedLevel,
            prompt: prompt,
          }),
        },
      );
      if (!response.ok) throw new Error("Evaluation failed");
      const data = await response.json();
      const evaluation: EvaluationResult = {
        score: Number(data.score) || 0,
        feedback: data.feedback || "Keep practicing!",
      };
      setResult(evaluation);
      await updateFirebaseProgress(evaluation.score);
      setShowModal(true);
    } catch (error) {
      alert("Hubo un error con la evaluación.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingPrompt)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-emerald-400 text-[11px] font-bold italic tracking-[0.4em] uppercase">
          Iniciando protocolo writing...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-emerald-500/30 font-sans">
      <header className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/modulos"
            className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5"
            title="Volver"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-lg flex items-center justify-center font-black text-[#020617] text-xl shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              W
            </div>
            <div>
              <span className="text-[9px] font-bold italic tracking-[0.3em] text-emerald-400 block leading-none mb-1">
                Certifica_AI
              </span>
              <h1 className="text-sm font-black italic uppercase tracking-tight text-white">
                Writing_Lab
              </h1>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[9px] font-bold text-slate-500 italic uppercase tracking-widest">
              Target_Level
            </span>
            <span className="text-xs font-black text-emerald-400 uppercase italic">
              {selectedLevel}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || text.length < 5}
            title="Analizar texto"
            className="px-8 py-3 bg-white hover:bg-emerald-400 text-[#020617] text-[11px] font-black italic uppercase tracking-widest rounded-full transition-all disabled:opacity-20 flex items-center gap-2 active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <>
                Analizar_Texto <Send size={14} />
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sparkles size={60} className="text-emerald-400" />
            </div>
            <h3 className="text-[10px] font-bold text-emerald-400 italic uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              Neural_Prompt_v2
            </h3>
            <p className="text-2xl font-black leading-tight text-white italic tracking-tight mb-8">
              &quot;{prompt}&quot;
            </p>
            <button
              onClick={() => fetchPrompt(selectedLevel)}
              title="Generar nuevo tema"
              aria-label="Recargar prompt"
              className="p-2 text-slate-400 hover:text-emerald-400 transition-colors bg-white/5 rounded-lg border border-white/5"
            >
              <RotateCcw size={16} />
            </button>
          </motion.div>

          <div className="bg-emerald-500/5 p-8 rounded-3xl border border-emerald-500/10 text-center">
            <span className="text-[10px] font-bold text-emerald-400 italic uppercase tracking-widest block mb-1">
              Word_Count
            </span>
            <span className="text-6xl font-black text-white italic tracking-tighter">
              {wordCount}
            </span>
          </div>
        </div>

        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 rounded-[3rem] border border-white/5 overflow-hidden min-h-[600px] flex flex-col focus-within:border-emerald-500/30 transition-all shadow-3xl"
          >
            <div className="px-10 py-5 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold italic tracking-widest uppercase">
                <FileText size={14} className="text-emerald-400" />{" "}
                Professional_Editor
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              title="Cuerpo del texto"
              placeholder="Start drafting your response here..."
              className="flex-1 w-full p-12 text-lg leading-relaxed text-slate-200 outline-none resize-none bg-transparent custom-scrollbar font-medium"
            />
          </motion.div>
        </div>
      </main>

      {/* MODAL DE RESULTADOS (Simplificado para brevedad) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0f172a] border border-emerald-500/20 rounded-[4rem] p-12 max-w-2xl w-full text-center relative shadow-3xl"
            >
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-[10px] font-bold text-emerald-400 italic uppercase tracking-[0.4em] mb-4">
                Análisis_Finalizado
              </h2>
              <div className="text-8xl font-black text-white italic tracking-tighter mb-8">
                {result?.score}
                <span className="text-3xl text-emerald-400">%</span>
              </div>
              <p className="text-base text-slate-300 leading-relaxed italic mb-10">
                &quot;{result?.feedback}&quot;
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => router.push("/modulos")}
                  className="flex-1 py-5 bg-emerald-600 text-[#020617] rounded-2xl font-black uppercase text-[11px] tracking-widest"
                >
                  Finalizar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
