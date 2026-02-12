"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  LayoutGrid,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

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
  const [currentLevel, setCurrentLevel] = useState<string>("A1");
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

      const res = await fetch(
        "http://127.0.0.1:8000/api/v1/generate-questions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "reading", level: levelToUse }),
        },
      );
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

      const updatedModuleStats = {
        ...currentStats,
        reading: finalScore,
      };

      // Cálculo de promedio basado en la nueva estructura
      const newAvg = Math.round(
        (updatedModuleStats.reading +
          (updatedModuleStats.listening || 0) +
          (updatedModuleStats.writing || 0) +
          (updatedModuleStats.speaking || 0)) /
          4,
      );

      await updateDoc(progressRef, {
        [levelKey]: updatedModuleStats,
        [`progress_${currentLevel}`]: newAvg, // Aseguramos que la gráfica general se actualice
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleNext = async () => {
    // Blindaje de data
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
      const finalPercentage = Math.round(
        (updatedCorrectCount / data.questions.length) * 100,
      );
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

  // --- RENDERING GUARDS ---
  if (loading || !data || !data.questions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Image
            src="/logo2.png"
            alt="Logo"
            width={80}
            height={80}
            className="mb-6"
          />
        </motion.div>
        <Loader2 className="animate-spin text-cyan-500 mb-4" size={30} />
        <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.5em]">
          Iniciando Protocolo Reading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-cyan-500/30 font-sans">
      <header className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/modulos"
            className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-indigo-500 rounded-lg flex items-center justify-center font-black text-[#020617] text-xl shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              R
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400 block leading-none mb-1">
                Certifica_AI
              </span>
              <h1 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-white">
                <BookOpen size={14} className="text-indigo-400" /> READING_LAB
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-cyan-500/10 px-5 py-2 rounded-full border border-cyan-500/30">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic">
            {/* USO DE OPTIONAL CHAINING AQUÍ POR SI ACASO */}
            Task {currentQuestion + 1} / {data?.questions?.length || 0}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl h-[70vh] flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles size={80} className="text-cyan-400" />
            </div>
            <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              Neural_Source_Text
            </h2>
            <h1 className="text-3xl font-black text-white italic uppercase mb-8 tracking-tighter leading-none border-l-4 border-cyan-500 pl-6">
              {data.title}
            </h1>
            <div className="flex-1 overflow-y-auto custom-scrollbar text-xl leading-[1.8] text-slate-300 font-medium pr-4">
              {data.passage}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-5">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-slate-900/40 rounded-[3rem] shadow-2xl border border-white/5 p-10 flex flex-col gap-8"
          >
            <h3 className="text-2xl font-black text-white italic uppercase leading-tight tracking-tight">
              {data.questions[currentQuestion]?.question}
            </h3>
            <div className="space-y-4">
              {data.questions[currentQuestion]?.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAnswer(i)}
                  className={`w-full p-6 rounded-[30px] border-2 text-left flex items-center gap-4 transition-all ${
                    selectedAnswer === i
                      ? "border-cyan-500 bg-cyan-500/5"
                      : "border-white/5 bg-slate-900/40 hover:border-white/10"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                      selectedAnswer === i
                        ? "bg-cyan-500 border-cyan-500"
                        : "border-slate-700"
                    }`}
                  >
                    {selectedAnswer === i && (
                      <CheckCircle2
                        size={14}
                        className="text-[#020617] stroke-[3]"
                      />
                    )}
                  </div>
                  <span
                    className={`font-bold uppercase text-sm tracking-tight ${
                      selectedAnswer === i ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {opt}
                  </span>
                </button>
              ))}
            </div>
            <button
              disabled={selectedAnswer === null}
              onClick={handleNext}
              className="w-full py-6 bg-white text-[#020617] rounded-[30px] font-black uppercase text-[11px] tracking-[0.3em] disabled:opacity-20 hover:bg-cyan-400 transition-all flex items-center justify-center gap-3"
            >
              {currentQuestion === data.questions.length - 1
                ? "Finalizar Protocolo"
                : "Siguiente Pregunta"}{" "}
              <Send size={16} />
            </button>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0f172a] border border-cyan-500/20 rounded-[4rem] p-12 max-w-xl w-full text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-4 italic">
                Reading_Analysis_Complete
              </h2>
              <div className="text-8xl font-black text-white italic tracking-tighter mb-8">
                {Math.round(
                  (correctCount / (data?.questions?.length || 1)) * 100,
                )}
                <span className="text-3xl text-emerald-400">%</span>
              </div>
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleRetry}
                  className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 flex items-center justify-center gap-3"
                >
                  <RotateCcw size={16} /> Reintentar Misión
                </button>
                <button
                  onClick={() => router.push("/modulos")}
                  className="w-full py-6 bg-cyan-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-cyan-500 shadow-lg flex items-center justify-center gap-3"
                >
                  <LayoutGrid size={16} /> Regresar al Menú
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
