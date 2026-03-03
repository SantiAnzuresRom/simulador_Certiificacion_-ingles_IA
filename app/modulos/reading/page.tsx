"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  LayoutGrid,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

// --- Interfaces ---
interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ReadingData {
  title: string;
  passage: string;
  questions: Question[];
}

export default function ReadingModule() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string>("--");
  const [data, setData] = useState<ReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const fetchReadingData = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      const progressRef = doc(db, "user_progress", uid);
      const snap = await getDoc(progressRef);
      const levelToUse = snap.exists() ? snap.data().currentLevel : "A1";
      setCurrentLevel(levelToUse);

      const res = await fetch(`${BACKEND_URL}/api/v1/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "reading", level: levelToUse }),
      });
      const json: ReadingData = await res.json();
      setData(json);
    } catch (e) {
      console.error("Error conectando con el backend:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid);
        fetchReadingData(user.uid);
      } else {
        router.replace("/login");
      }
    });
    return () => unsub();
  }, [router, fetchReadingData]);

  const updateFirebaseProgress = async (finalScore: number) => {
    if (!userUid) return;
    try {
      const progressRef = doc(db, "user_progress", userUid);
      const snap = await getDoc(progressRef);
      if (!snap.exists()) return;

      const pData = snap.data();
      const levelKey = `modules_${currentLevel}`;
      const currentStats = pData[levelKey] || {
        reading: 0,
        listening: 0,
        writing: 0,
        speaking: 0,
      };

      const updatedModuleStats = { ...currentStats, reading: finalScore };
      const newAvg = Math.round(
        (updatedModuleStats.reading +
          (updatedModuleStats.listening || 0) +
          (updatedModuleStats.writing || 0) +
          (updatedModuleStats.speaking || 0)) / 4
      );

      await updateDoc(progressRef, {
        [levelKey]: updatedModuleStats,
        [`progress_${currentLevel}`]: newAvg,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleNext = async () => {
    if (selectedAnswer === null || !data || !data.questions) return;

    const isCorrect =
      data.questions[currentQuestion].options[selectedAnswer] ===
      data.questions[currentQuestion].correctAnswer;

    const updatedCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    if (currentQuestion < data.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      const finalPercentage = Math.round((updatedCorrectCount / data.questions.length) * 100);
      await updateFirebaseProgress(finalPercentage);
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setData(null);
    setCurrentQuestion(0);
    setCorrectCount(0);
    setShowResult(false);
    setSelectedAnswer(null);
    if (userUid) fetchReadingData(userUid);
  };

  // --- Pantalla de Carga Unificada ---
  if (loading) {
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
          analizando fuentes {currentLevel}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-cyan-500/30 font-sans overflow-x-hidden">
      {/* Luces Ambientales */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full opacity-50" />
      </div>

      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NextLink
            href="/modulos"
            className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-inner group"
          >
            <ArrowLeft size={18} className="text-slate-400 group-hover:text-white transition-colors" />
          </NextLink>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-cyan-500 rounded-xl flex items-center justify-center font-black text-xl text-[#020617] shadow-lg shadow-cyan-500/20">
              R
            </div>
            <div>
              <p className="text-[10px] font-bold text-cyan-500 italic tracking-[0.1em] mb-0.5">
                Certifica AI
              </p>
              <h1 className="text-xl font-black italic tracking-tighter flex items-center gap-2">
                <BookOpen size={18} className="text-cyan-500" /> Reading Lab
              </h1>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 px-5 py-2.5 rounded-xl border border-white/5 shadow-inner">
          <span className="text-[11px] font-bold text-slate-400 italic tracking-wide">
            tarea {currentQuestion + 1} de {data?.questions?.length || 0}
          </span>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Sección del Texto (Lectura) */}
        <div className="lg:col-span-7 h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-950 to-slate-900/50 p-10 md:p-14 rounded-[45px] border border-white/10 shadow-3xl h-[75vh] flex flex-col relative overflow-hidden group transition-all duration-500 hover:border-cyan-500/20"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="h-[1px] w-8 bg-cyan-500/50" />
              <h2 className="text-[10px] font-bold text-cyan-500 italic tracking-[0.4em]">
                Neural Source Text
              </h2>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white italic  mb-10 tracking-tighter leading-[1.1]">
              {data?.title}
            </h1>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 text-lg md:text-xl leading-[1.9] text-slate-300/90 font-light italic">
              {data?.passage.split('\n').map((para, i) => (
                <p key={i} className="mb-6 last:mb-0">{para}</p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sección de Preguntas */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/30 backdrop-blur-sm rounded-[45px] border border-white/5 p-10 flex flex-col gap-10 sticky top-32 shadow-2xl"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Sparkles size={22} className="text-cyan-400 mt-1 shrink-0 animate-pulse" />
                <h3 className="text-2xl md:text-3xl font-extrabold italic tracking-tighter text-white leading-tight">
                  {data?.questions[currentQuestion]?.question}
                </h3>
              </div>

              <div className="grid gap-4">
                {data?.questions[currentQuestion]?.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAnswer(i)}
                    className={`w-full p-6 rounded-3xl border transition-all duration-300 flex items-center gap-5 group ${
                      selectedAnswer === i
                        ? "border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_25px_rgba(6,182,212,0.1)] scale-[1.02]"
                        : "border-white/5 bg-slate-900/60 hover:bg-slate-800/80 hover:border-white/10"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selectedAnswer === i
                          ? "border-cyan-500 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                          : "border-slate-700 group-hover:border-slate-500"
                      }`}
                    >
                      {selectedAnswer === i && (
                        <div className="w-2.5 h-2.5 bg-[#020617] rounded-full" />
                      )}
                    </div>
                    <span
                      className={`font-medium text-base md:text-lg tracking-tight transition-colors ${
                        selectedAnswer === i ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      {opt}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={selectedAnswer === null}
              onClick={handleNext}
              className="w-full py-7 bg-white text-[#020617] rounded-3xl font-black italic  tracking-[0.2em] text-xs disabled:opacity-10 hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 shadow-xl group"
            >
              <span className="group-hover:translate-x-[-2px] transition-transform">
                {currentQuestion === (data?.questions?.length ?? 0) - 1
                  ? "Finalizar Protocolo"
                  : "Siguiente Fase"}
              </span>
              <Send size={16} className="group-hover:translate-x-1 group-hover:translate-y-[-1px] transition-transform" />
            </button>
          </motion.div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto py-12 border-t border-white/5 text-center mt-auto opacity-50">
        <p className="text-[10px] font-medium text-slate-500 tracking-[0.4em] italic">
          ai core engine v3.0 // reading_lab_v1
        </p>
      </footer>

      {/* Modal de Resultados */}
      <AnimatePresence>
        {showResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/98 backdrop-blur-3xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-slate-950 to-slate-900 border border-white/10 p-12 md:p-16 rounded-[60px] text-center max-w-xl w-full shadow-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              
              <div className="w-24 h-24 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-10 border border-cyan-500/20 shadow-inner shadow-cyan-500/10">
                <CheckCircle2 size={45} strokeWidth={1.5} />
              </div>
              
              <p className="text-cyan-500/60 text-[11px] font-bold italic tracking-[0.5em] mb-4">
                Análisis Finalizado
              </p>

              <div className="flex items-center justify-center gap-4 mb-14">
                <h2 className="text-9xl font-black italic tracking-tighter text-white">
                  {Math.round((correctCount / (data?.questions?.length || 1)) * 100)}
                </h2>
                <span className="text-5xl font-black text-cyan-500 italic">%</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                <button
                  onClick={handleRetry}
                  className="w-full py-6 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-bold italic  text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                >
                  <RotateCcw size={18} /> Reintentar Misión
                </button>
                <button
                  onClick={() => router.push("/modulos")}
                  className="w-full py-6 bg-cyan-600 text-white rounded-2xl font-black italic text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-cyan-500 transition-all shadow-[0_15px_30px_-5px_rgba(6,182,212,0.4)]"
                >
                  <LayoutGrid size={18} /> Volver a Módulos
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
}
