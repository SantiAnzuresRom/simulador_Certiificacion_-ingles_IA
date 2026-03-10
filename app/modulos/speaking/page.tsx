"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  LayoutGrid,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Volume2,
  Sparkles,
} from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { auth, db } from "../../src/firebase/config";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function SpeakingModule() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string>("B1");
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<{ prompt: string; targetSentence: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // Referencia para el reconocimiento de voz
  const recognitionRef = useRef<any>(null);

  const fetchTask = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      const progressRef = doc(db, "user_progress", uid);
      const snap = await getDoc(progressRef);
      const levelToUse = snap.exists() ? snap.data().currentLevel : "B1";
      setCurrentLevel(levelToUse);

      const res = await fetch(`${BACKEND_URL}/api/v1/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "speaking", level: levelToUse }),
      });

      const data = await res.json();
      setTask({
        prompt: data.prompt || "pronuncia la oración:",
        targetSentence: data.targetSentence || data.sentence || "The technology of today is the magic of tomorrow.",
      });
    } catch (e) {
      console.error("fetch error:", e);
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
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [router, fetchTask]);

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Navegador no compatible.");
      return;
    }

    // Limpiar instancia previa si existe para evitar error de red
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false; // Cambiado a false para mayor estabilidad
    recognition.interimResults = true;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (e: any) => {
      const current = Array.from(e.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join("");
      setTranscript(current);
    };

    recognition.onerror = (e: any) => {
      console.error("Speech Error:", e.error);
      setIsRecording(false);
      if (e.error === 'network') {
        alert("Error de red: Asegúrate de estar en Brave/Chrome y tener internet estable.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleEvaluate = async () => {
    if (!transcript || !task || !userUid) return;
    stopSpeechRecognition();

    const target = task.targetSentence.toLowerCase().replace(/[^\w\s]/g, "");
    const input = transcript.toLowerCase().replace(/[^\w\s]/g, "");
    const targetWords = target.split(/\s+/).filter(Boolean);
    const inputWords = input.split(/\s+/).filter(Boolean);
    let matches = 0;
    targetWords.forEach((word) => { if (inputWords.includes(word)) matches++; });

    const finalScore = Math.min(100, Math.round((matches / targetWords.length) * 100));
    setScore(finalScore);
    
    const progressRef = doc(db, "user_progress", userUid);
    await updateDoc(progressRef, {
      [`modules_${currentLevel}.speaking`]: finalScore,
      updatedAt: new Date().toISOString(),
    });
    
    setShowResult(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-sans">
        <div className="relative w-28 h-28 mb-10">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 border-b-2 border-cyan-500 rounded-full" />
          <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-2 border-t-2 border-[#10b981] rounded-full" />
        </div>
        <p className="text-cyan-400 font-medium text-[13px] tracking-[0.3em] animate-pulse italic lowercase">
          generando misión de voz nivel {currentLevel}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-orange-500/30 overflow-x-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NextLink href="/modulos" className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-inner group">
            <ArrowLeft size={18} className="text-slate-400 group-hover:text-white transition-colors" />
          </NextLink>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center font-black text-xl text-[#020617] shadow-lg shadow-orange-500/20">S</div>
            <div>
              <p className="text-[10px] font-bold text-orange-500 italic tracking-[0.1em] mb-0.5 lowercase">certifica ai</p>
              <h1 className="text-xl font-black italic tracking-tighter lowercase flex items-center gap-2">
                 speaking lab <Mic size={20} className="text-orange-500" />
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto w-full px-6 py-12 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        
        {/* Panel Izquierdo: Oración Target (TEXTO MÁS PEQUEÑO) */}
        <div className="lg:col-span-7 h-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-slate-950 to-slate-900/50 p-10 md:p-14 rounded-[45px] border border-white/10 shadow-3xl h-[70vh] flex flex-col relative overflow-hidden group transition-all duration-500 hover:border-orange-500/20">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
            <div className="flex items-center gap-3 mb-8">
              <div className="h-[1px] w-8 bg-orange-500/50" />
              <h2 className="text-[10px] font-bold text-orange-500 italic tracking-[0.4em] lowercase">vocal_target_mission</h2>
            </div>
            {/* Achicado de text-4xl/5xl a text-2xl/3xl */}
            <h1 className="text-2xl md:text-3xl font-black text-white italic mb-10 tracking-tighter leading-[1.4] lowercase">
              "{task?.targetSentence}"
            </h1>
            <div className="mt-auto">
              <button 
                onClick={() => {
                  window.speechSynthesis.cancel();
                  const u = new SpeechSynthesisUtterance(task?.targetSentence);
                  u.lang = "en-US"; u.rate = 0.9;
                  window.speechSynthesis.speak(u);
                }}
                className="flex items-center gap-4 px-8 py-4 bg-orange-500/10 rounded-2xl text-orange-400 hover:bg-orange-500/20 transition-all border border-orange-500/20 font-bold italic tracking-widest text-xs"
              >
                <Volume2 size={20} /> ESCUCHAR GUÍA NEURAL
              </button>
            </div>
          </motion.div>
        </div>

        {/* Panel Derecho: Interacción */}
        <div className="lg:col-span-5">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/30 backdrop-blur-sm rounded-[45px] border border-white/5 p-10 flex flex-col gap-8 sticky top-32 shadow-2xl h-fit">
            
            <div className="space-y-6 text-center">
              <h3 className="text-2xl font-extrabold italic tracking-tighter text-white lowercase">
                {isRecording ? "sincronizando voz..." : "listo para grabar"}
              </h3>

              {/* Caja de Transcripción (ARRIBA) */}
              <div className="bg-black/20 p-8 rounded-3xl border border-white/5 min-h-[140px] flex items-center justify-center text-center shadow-inner relative overflow-hidden">
                <p className="text-xl font-medium italic text-slate-300 leading-relaxed lowercase">
                  {transcript || "tu voz aparecerá aquí..."}
                </p>
                {!transcript && !isRecording && (
                  <Sparkles size={16} className="absolute bottom-4 right-5 text-slate-700 opacity-50" />
                )}
              </div>
              
              {/* Botón de Micro (ABAJO) */}
              <div className="relative flex justify-center py-4">
                <AnimatePresence>
                  {isRecording && (
                    <motion.div initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 2.2, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 m-auto w-28 h-28 bg-red-500 rounded-full" />
                  )}
                </AnimatePresence>
                <button
                  onClick={() => {
                    if (isRecording) stopSpeechRecognition();
                    else startSpeechRecognition();
                  }}
                  className={`w-28 h-28 rounded-full flex items-center justify-center relative z-10 transition-all active:scale-90 ${isRecording ? "bg-red-500 shadow-[0_0_60px_rgba(239,68,68,0.4)]" : "bg-orange-500 hover:bg-orange-400 shadow-xl shadow-orange-500/20"}`}
                >
                  {isRecording ? <MicOff size={40} /> : <Mic size={40} className="text-[#020617]" />}
                </button>
              </div>
            </div>

            <button
              disabled={!transcript || isRecording}
              onClick={handleEvaluate}
              className="w-full py-7 bg-white text-[#020617] rounded-[30px] font-black italic tracking-[0.2em] text-[11px] disabled:opacity-20 hover:bg-orange-500 transition-all flex items-center justify-center gap-4 shadow-xl lowercase"
            >
              finalizar protocolo <Send size={18} />
            </button>
          </motion.div>
        </div>
      </main>
      
      {/* Modal de Resultados omitido para brevedad, pero igual al anterior */}
      <AnimatePresence>
        {showResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/98 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#020617] border border-white/10 p-12 md:p-16 rounded-[60px] text-center max-w-xl w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
              <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-10 border border-orange-500/20">
                <CheckCircle2 size={45} strokeWidth={1.5} />
              </div>
              <p className="text-orange-500/60 text-[11px] font-bold italic tracking-[0.5em] mb-4 lowercase">análisis finalizado</p>
              <div className="flex items-center justify-center gap-4 mb-14">
                <h2 className="text-9xl font-black italic text-white tracking-tighter">{score}</h2>
                <span className="text-5xl font-black text-orange-500 italic">%</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <button onClick={() => { setShowResult(false); setTranscript(""); fetchTask(userUid!); }} className="w-full py-6 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-bold italic text-[10px] tracking-widest flex items-center justify-center gap-3 lowercase">
                  <RotateCcw size={18} /> reintentar misión
                </button>
                <button onClick={() => router.push("/modulos")} className="w-full py-6 bg-orange-500 text-[#020617] rounded-2xl font-black italic text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 lowercase">
                  <LayoutGrid size={18} /> volver a módulos
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}