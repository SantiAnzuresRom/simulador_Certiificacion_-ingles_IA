"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Award, Headset, LayoutGrid, Play, Pause, RotateCcw, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import { auth, db } from "../../src/firebase/config";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function ListeningModule() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string>("--");
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Referencias para el control instantáneo
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  // --- 1. PRE-CARGA DEL AUDIO (Para que no tarde nada) ---
  const preloadAudio = async (text: string) => {
    try {
      setIsAudioLoaded(false);
      const res = await fetch(`${BACKEND_URL}/api/v1/voice/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "nova", speed: 0.95 }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
      setIsAudioLoaded(true);
    } catch (e) {
      console.error("Error pre-cargando audio:", e);
    }
  };

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
      // Pre-cargamos el audio del passage principal apenas llega la data
      if (data.passage) preloadAudio(data.passage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) { setUserUid(user.uid); fetchTask(user.uid); }
      else { router.replace("/login"); }
    });
    return () => {
      unsub();
      if (audioRef.current) audioRef.current.pause();
    };
  }, [router, fetchTask]);

  // --- 2. LÓGICA DE PLAY/PAUSE (Continúa donde se quedó) ---
  const handleToggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAnswer = async () => {
    if (selectedAnswer === null || !task) return;
    if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }

    const isCorrect = task.questions[currentStep].options[selectedAnswer] === task.questions[currentStep].correctAnswer;
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    if (currentStep < task.questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  // --- 3. PANTALLA DE CARGA (TU ORIGINAL) ---
  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-sans">
      <div className="relative w-24 h-24 mb-6">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 border-b-2 border-cyan-500 rounded-full" />
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-2 border-t-2 border-blue-500 rounded-full" />
      </div>
      <p className="text-cyan-400 font-medium text-[13px] tracking-[0.3em] animate-pulse italic">
        Generando contenido para escuchar en nivel {currentLevel}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans overflow-x-hidden">
      <nav className="p-8 flex justify-between items-center bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-6">
          <Link href="/modulos" className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
            <ArrowLeft size={18} className="text-slate-400" />
          </Link>
          <h1 className="text-xl font-black italic tracking-tighter flex items-center gap-2">
            <Headset size={18} className="text-cyan-500" /> Listening Lab
          </h1>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto w-full p-6 space-y-12 py-16 relative z-10">
        <section className="bg-gradient-to-br from-slate-950 to-slate-900 border border-white/10 p-12 rounded-[40px] text-center relative overflow-hidden shadow-2xl group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent group-hover:via-cyan-500/50" />
          
          <button
            onClick={handleToggleAudio}
            disabled={!isAudioLoaded}
            className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-10 transition-all duration-300 relative ${
              isPlaying ? "bg-cyan-400 scale-105 shadow-[0_0_50px_rgba(34,211,238,0.3)]" : "bg-slate-800 hover:bg-slate-700 shadow-xl border border-white/5"
            } ${!isAudioLoaded && "opacity-50 cursor-wait"}`}
          >
            {isPlaying && (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-15px] border-2 border-dashed border-cyan-500/30 rounded-full" />
            )}
            
            {isPlaying ? (
              <div className="flex gap-1.5 items-end h-9">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div key={i} animate={{ height: [10, 30, 10] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1.5 bg-[#020617] rounded-full" />
                ))}
              </div>
            ) : (
              <Play size={40} className="ml-2 text-cyan-400 group-hover:text-white transition-colors" />
            )}
          </button>
          
          <h2 className="text-xl font-light italic text-white/90">
            {!isAudioLoaded ? "Sincronizando audio HD..." : isPlaying ? "Reproduciendo... Pausa para analizar." : "Pulsa para escuchar la conversación profesional."}
          </h2>
        </section>

        {/* Bloque de Preguntas */}
        <section className="space-y-10">
          <h3 className="text-3xl font-extrabold italic text-white">
            {task?.questions[currentStep].question}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {task?.questions[currentStep].options.map((opt: string, i: number) => (
              <button key={i} onClick={() => setSelectedAnswer(i)}
                className={`w-full p-8 rounded-3xl border transition-all ${
                  selectedAnswer === i ? "border-cyan-500 bg-cyan-500/10" : "border-white/5 bg-slate-900/40"
                }`}>
                <span className={`text-lg ${selectedAnswer === i ? "text-white" : "text-slate-400"}`}>{opt}</span>
              </button>
            ))}
          </div>

          <button disabled={selectedAnswer === null} onClick={handleAnswer}
            className="w-full py-7 bg-white text-[#020617] rounded-3xl font-black italic tracking-[0.2em] hover:bg-cyan-400 transition-all disabled:opacity-20 shadow-xl flex items-center justify-center gap-3">
            {currentStep === task!.questions.length - 1 ? "Finalizar Test" : "Siguiente Pregunta"}
            <Send size={18} />
          </button>
        </section>
      </main>
    </div>
  );
}