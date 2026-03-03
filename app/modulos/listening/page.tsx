"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Headset,
  LayoutGrid,
  Play,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ListeningTask {
  passage: string;
  questions: Question[];
}

export default function ListeningModule() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string>("--");
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<ListeningTask | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchTask = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      const progressRef = doc(db, "user_progress", uid);
      const snap = await getDoc(progressRef);
      const levelToUse = snap.exists() ? snap.data().currentLevel : "A1";
      setCurrentLevel(levelToUse);

      const res = await fetch(`${BACKEND_URL}/api/v1/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "listening", level: levelToUse }),
      });

      const data = await res.json();
      setTask(data);
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
        fetchTask(user.uid);
      } else {
        router.replace("/login");
      }
    });
    return () => {
      unsub();
      window.speechSynthesis.cancel();
    };
  }, [router, fetchTask]);

  const updateFirebaseProgress = async (finalScore: number) => {
    if (!userUid) return;
    try {
      const progressRef = doc(db, "user_progress", userUid);
      const snap = await getDoc(progressRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const moduleKey = `modules_${currentLevel}`;
      const currentModuleData = data[moduleKey] || {};

      const reading = currentModuleData.reading || 0;
      const writing = currentModuleData.writing || 0;
      const speaking = currentModuleData.speaking || 0;

      const levelAverage = Math.round(
        (reading + finalScore + writing + speaking) / 4,
      );

      await updateDoc(progressRef, {
        [`${moduleKey}.listening`]: finalScore,
        [`progress_${currentLevel}`]: levelAverage,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Error al guardar en Firebase:", error);
    }
  };

  const handleAnswer = async () => {
    if (selectedAnswer === null || !task) return;

    const isCorrect =
      task.questions[currentStep].options[selectedAnswer] ===
      task.questions[currentStep].correctAnswer;
    const updatedCorrectCount = isCorrect ? correctCount + 1 : correctCount;

    if (isCorrect) setCorrectCount((prev) => prev + 1);

    if (currentStep < task.questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setSelectedAnswer(null);
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const finalScore = Math.round(
        (updatedCorrectCount / task.questions.length) * 100,
      );
      await updateFirebaseProgress(finalScore);
      setShowResult(true);
    }
  };

  const playMainAudio = () => {
    if (!task || !task.passage) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(task.passage);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleRetry = () => {
    setTask(null);
    setCurrentStep(0);
    setSelectedAnswer(null);
    setCorrectCount(0);
    setShowResult(false);
    if (userUid) fetchTask(userUid);
  };

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
        <p className="text-cyan-400 font-medium text-[13px] tracking-[0.3em] animate-pulse italic uppercase">
          configurando entorno de {currentLevel}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Luces Ambientales sutiles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full" />
      </div>

      <nav className="p-8 flex justify-between items-center bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-6">
          <Link
            href="/modulos"
            className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-inner"
          >
            <ArrowLeft size={18} className="text-slate-400" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-cyan-500 rounded-xl flex items-center justify-center font-black text-xl text-[#020617] shadow-lg">
              L
            </div>
            <div>
              <p className="text-[10px] font-bold text-cyan-500 italic tracking-[0.1em] mb-1">
                Certifica AI
              </p>
              <h1 className="text-xl font-black italic tracking-tighter flex items-center gap-2 uppercase">
                <Headset size={18} className="text-cyan-500" /> Listening Lab
              </h1>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 px-5 py-2.5 rounded-xl border border-white/5 shadow-inner">
          <span className="text-[11px] font-bold text-slate-400 italic tracking-wide">
            paso {currentStep + 1} de {task?.questions.length}
          </span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto w-full p-6 space-y-12 py-16 relative z-10">
        <section className="bg-gradient-to-br from-slate-950 to-slate-900 border border-white/10 p-12 rounded-[40px] text-center relative overflow-hidden shadow-2xl group hover:border-cyan-500/20 transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent group-hover:via-cyan-500/50" />
          
          <button
            onClick={playMainAudio}
            className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-10 transition-all duration-300 relative ${
              isPlaying
                ? "bg-cyan-400 scale-105 shadow-[0_0_50px_rgba(34,211,238,0.3)]"
                : "bg-slate-800 hover:bg-slate-700 shadow-xl border border-white/5"
            }`}
          >
            {isPlaying && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-15px] border-2 border-dashed border-cyan-500/30 rounded-full"
              />
            )}
            
            {isPlaying ? (
              <div className="flex gap-1.5 items-end h-9">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [10, 30, 10] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    className="w-1.5 bg-[#020617] rounded-full"
                  />
                ))}
              </div>
            ) : (
              <Play size={40} className="ml-2 text-cyan-400 group-hover:text-white transition-colors" />
            )}
          </button>
          
          <h2 className="text-xl md:text-2xl font-light italic tracking-tight text-white/90 max-w-xl mx-auto">
            Escucha atentamente el audio y selecciona la opción que mejor responda a la pregunta.
          </h2>
        </section>

        <section className="space-y-10">
          <div className="flex items-start gap-5">
            <Sparkles size={22} className="text-cyan-400 mt-1.5 shrink-0" />
            <h3 className="text-3xl md:text-4xl font-extrabold italic tracking-tighter text-white leading-tight">
              {task?.questions[currentStep].question}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {task?.questions[currentStep].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedAnswer(i)}
                className={`w-full p-8 rounded-3xl border transition-all duration-300 flex items-center gap-6 group ${
                  selectedAnswer === i
                    ? "border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.1)] scale-[1.01]"
                    : "border-white/5 bg-slate-900/40 hover:bg-slate-900/60 hover:border-white/10"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedAnswer === i
                      ? "border-cyan-500 bg-cyan-500"
                      : "border-slate-700 group-hover:border-slate-500"
                  }`}
                >
                  {selectedAnswer === i && (
                    <div className="w-2.5 h-2.5 bg-[#020617] rounded-full" />
                  )}
                </div>
                <span
                  className={`font-medium text-lg tracking-tight ${selectedAnswer === i ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}
                >
                  {opt}
                </span>
              </button>
            ))}
          </div>

          <button
            disabled={selectedAnswer === null}
            onClick={handleAnswer}
            className="w-full py-7 bg-white text-[#020617] rounded-3xl font-black italic tracking-[0.2em] uppercase disabled:opacity-10 hover:bg-cyan-400 transition-all flex items-center justify-center gap-3.5 shadow-xl disabled:cursor-not-allowed group"
          >
            <span className="group-hover:scale-105 transition-transform">
              {currentStep === task!.questions.length - 1
                ? "Finalizar protocolo"
                : "Siguiente fase"}
            </span>
            <Send size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto py-12 border-t border-white/5 text-center mt-auto">
        <p className="text-[10px] font-medium text-slate-600 tracking-[0.4em] italic uppercase">ai core engine v3.0 // 2026</p>
      </footer>

      <AnimatePresence>
        {showResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/98 backdrop-blur-3xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-950 to-slate-900 border border-white/10 p-12 md:p-16 rounded-[60px] text-center max-w-xl w-full shadow-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              
              <Award className="mx-auto text-cyan-400 mb-10" size={90} strokeWidth={1.5} />
              
              <div className="flex items-center justify-center gap-4 mb-3">
                <h2 className="text-9xl font-black italic tracking-tighter text-white">
                  {Math.round((correctCount / task!.questions.length) * 100)}
                </h2>
                <span className="text-5xl font-black text-cyan-500 italic">%</span>
              </div>
              
              <p className="text-cyan-500/60 text-[11px] font-bold italic tracking-[0.3em] mb-14 uppercase">
                Evaluación verificada
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-12">
                <button
                  onClick={handleRetry}
                  className="w-full py-6 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-bold italic uppercase text-xs tracking-wider flex items-center justify-center gap-3.5 hover:bg-white/10 hover:text-white transition-all shadow-inner"
                >
                  <RotateCcw size={18} /> reintentar fase
                </button>
                <button
                  onClick={() => router.push("/modulos")}
                  className="w-full py-6 bg-cyan-600 text-white rounded-2xl font-black italic uppercase text-xs tracking-wider flex items-center justify-center gap-3.5 hover:bg-cyan-500 transition-all shadow-[0_15px_30px_-5px_rgba(6,182,212,0.4)] group"
                >
                  <LayoutGrid size={18} className="group-hover:rotate-6 transition-transform" /> volver a módulos
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}