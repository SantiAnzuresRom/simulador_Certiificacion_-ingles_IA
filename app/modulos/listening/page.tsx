"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Headset,
  LayoutGrid,
  Loader2,
  Play,
  RotateCcw,
  Send,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

// ... Interfaces se mantienen igual ...
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
  const [currentLevel, setCurrentLevel] = useState<string>("A1");
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

      const res = await fetch("http://localhost:8000/api/v1/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "listening", level: levelToUse })
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
      const data = snap.data() || {};
      
      // Mantenemos la estructura unificada de 'stats'
      const currentStats = data.stats || {};
      const newStats = { ...currentStats, listening: finalScore };
      
      // Calculamos el nuevo promedio del nivel para actualizar la barra del Dashboard
      const avg = Math.round(
        ((newStats.reading || 0) + 
         (newStats.listening || 0) + 
         (newStats.writing || 0) + 
         (newStats.speaking || 0)) / 4
      );

      await updateDoc(progressRef, {
        "stats.listening": finalScore,
        [`progress_${currentLevel}`]: avg, // Actualiza el historial general
        "updatedAt": new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleAnswer = async () => {
    if (selectedAnswer === null || !task) return;
    const isCorrect = task.questions[currentStep].options[selectedAnswer] === task.questions[currentStep].correctAnswer;
    const updatedCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    
    if (isCorrect) setCorrectCount(prev => prev + 1);

    if (currentStep < task.questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedAnswer(null);
      window.speechSynthesis.cancel(); 
      setIsPlaying(false);
    } else {
      const finalScore = Math.round((updatedCorrectCount / task.questions.length) * 100);
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

  // ... (El resto del JSX se mantiene igual, está impecable) ...
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
        <Image src="/logo2.png" alt="Logo" width={80} height={80} className="mb-6" />
      </motion.div>
      <Loader2 className="animate-spin text-cyan-500 mb-4" size={30} />
      <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.5em]">Iniciando Protocolo Listening...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-cyan-500/30">
        {/* Aquí va tu JSX que ya tenías, funciona perfecto con los cambios de lógica arriba */}
        <nav className="p-8 flex justify-between items-center bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
            <div className="flex items-center gap-6">
                <Link href="/modulos" className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95">
                    <ArrowLeft size={20}/>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center font-black text-2xl text-[#020617] shadow-[0_0_20px_rgba(6,182,212,0.5)]">L</div>
                    <div>
                        <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-1">Certifica_AI</p>
                        <h1 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                            <Headset size={18} className="text-cyan-500" /> Listening_Lab
                        </h1>
                    </div>
                </div>
            </div>
            <div className="bg-cyan-500/10 px-6 py-3 rounded-2xl border border-cyan-500/30">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic">
                    Step {currentStep + 1} / {task?.questions.length}
                </span>
            </div>
        </nav>

        <main className="max-w-4xl mx-auto w-full p-6 space-y-8 py-12">
            <section className="bg-slate-900/40 border border-white/5 p-10 rounded-[50px] text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                <button onClick={playMainAudio} className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 transition-all ${isPlaying ? "bg-cyan-400 scale-110 shadow-[0_0_40px_rgba(34,211,238,0.4)]" : "bg-cyan-600 hover:bg-cyan-500 shadow-xl"}`}>
                    {isPlaying ? (
                        <div className="flex gap-1.5 items-end h-10">
                            {[1,2,3,4,5].map(i => <motion.div key={i} animate={{ height: [12, 35, 12] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} className="w-2 bg-[#020617] rounded-full" />)}
                        </div>
                    ) : <Play size={50} className="ml-2 text-[#020617]" />}
                </button>
                <h2 className="text-2xl font-bold italic">Escucha el audio y selecciona la respuesta correcta.</h2>
            </section>

            <section className="space-y-8">
                <div className="flex items-start gap-4">
                    <Sparkles size={20} className="text-cyan-400 mt-1" />
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">{task?.questions[currentStep].question}</h3>
                </div>

                <div className="grid gap-4">
                    {task?.questions[currentStep].options.map((opt, i) => (
                        <button key={i} onClick={() => setSelectedAnswer(i)} className={`w-full p-8 rounded-[35px] border-2 text-left transition-all flex items-center gap-6 ${selectedAnswer === i ? "border-cyan-500 bg-cyan-500/10 scale-[1.02]" : "border-white/5 bg-slate-900/40 hover:bg-slate-900/60"}`}>
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${selectedAnswer === i ? "bg-cyan-500 border-cyan-500" : "border-slate-700"}`}>
                                {selectedAnswer === i && <div className="w-3 h-3 bg-[#020617] rounded-full" />}
                            </div>
                            <span className={`font-bold text-xl uppercase ${selectedAnswer === i ? "text-white" : "text-slate-500"}`}>{opt}</span>
                        </button>
                    ))}
                </div>

                <button disabled={selectedAnswer === null} onClick={handleAnswer} className="w-full py-8 bg-white text-[#020617] rounded-[35px] font-black uppercase tracking-[0.5em] disabled:opacity-10 hover:bg-cyan-400 transition-all flex items-center justify-center gap-4">
                    {currentStep === task!.questions.length - 1 ? "Finalizar Protocolo" : "Siguiente Fase"} <Send size={20} />
                </button>
            </section>
        </main>

        <AnimatePresence>
            {showResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/98 backdrop-blur-3xl">
                    <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f172a] border border-cyan-500/20 p-14 rounded-[70px] text-center max-w-lg w-full">
                        <Award className="mx-auto text-cyan-400 mb-10 shadow-cyan-500/50" size={100} />
                        <div className="flex items-center justify-center gap-4 mb-3">
                            <h2 className="text-9xl font-black italic tracking-tighter text-white">{Math.round((correctCount / task!.questions.length) * 100)}</h2>
                            <span className="text-5xl font-black text-cyan-500 italic">%</span>
                        </div>
                        <p className="text-cyan-500/50 text-[11px] font-black uppercase tracking-[0.6em] mb-14 italic">Cognitive_Assessment_Verified</p>
                        <div className="grid grid-cols-1 gap-5">
                            <button onClick={handleRetry} className="w-full py-7 bg-white/5 border border-white/10 text-white rounded-[30px] font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-4">
                                <RotateCcw size={20} /> Reintentar Protocolo
                            </button>
                            <button onClick={() => router.push("/modulos")} className="w-full py-8 bg-cyan-600 text-white rounded-[30px] font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4">
                                <LayoutGrid size={20} /> Regresar a Módulos
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
}