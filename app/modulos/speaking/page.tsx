"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  LayoutGrid,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Volume2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { auth, db } from "../../src/firebase/config";

export default function SpeakingModule() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string>("A1");
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<{prompt: string, targetSentence: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const recognitionRef = useRef<any>(null);

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
        body: JSON.stringify({ type: "speaking", level: levelToUse })
      });

      if (!res.ok) throw new Error("Error backend");
      const data = await res.json();
      
      setTask({
        prompt: data.prompt || "Pronuncia la oración:",
        targetSentence: data.targetSentence || data.sentence || data.text || "English is fun to learn."
      });
    } catch (e) {
      console.error("Fetch error:", e);
      setTask({ prompt: "Modo Offline", targetSentence: "Check your server connection." });
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

    const SpeechRecognition = typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (e: any) => setTranscript(e.results[0][0].transcript);
      recognitionRef.current.onend = () => setIsRecording(false);
    }

    return () => unsub();
  }, [router, fetchTask]);

  const updateFirebaseProgress = async (finalScore: number) => {
    if (!userUid) return;
    try {
      const progressRef = doc(db, "user_progress", userUid);
      const snap = await getDoc(progressRef);
      const data = snap.data() || {};
      
      // Sincronización con la estructura unificada
      const currentStats = data.modules || {};
      const newStats = { ...currentStats, speaking: finalScore };
      
      const avg = Math.round(
        ((newStats.reading || 0) + 
         (newStats.listening || 0) + 
         (newStats.writing || 0) + 
         (newStats.speaking || 0)) / 4
      );

      await updateDoc(progressRef, {
        "modules.speaking": finalScore,
        [`progress_${currentLevel}`]: avg, // Esto actualiza la gráfica del Dashboard
        "updatedAt": new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleEvaluate = async () => {
    if (!transcript || !task || !userUid) return;

    const target = task.targetSentence.toLowerCase().replace(/[^\w\s]/g, "");
    const input = transcript.toLowerCase().replace(/[^\w\s]/g, "");
    
    const targetWords = target.split(" ");
    const matches = input.split(" ").filter(w => targetWords.includes(w)).length;
    const finalScore = Math.min(100, Math.round((matches / targetWords.length) * 100));
    
    setScore(finalScore);
    await updateFirebaseProgress(finalScore);
    setShowResult(true);
  };

  const handleRetry = () => {
    setShowResult(false);
    setTranscript("");
    setScore(0);
    if (userUid) fetchTask(userUid);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin text-cyan-500 mb-4" size={40} />
      <p className="text-cyan-400 font-black text-[10px] tracking-[0.3em] uppercase italic">Iniciando Protocolo Speaking...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">
      <nav className="p-8 flex justify-between items-center bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-6">
          <Link href="/modulos" className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <ArrowLeft size={20}/>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center font-black text-2xl text-[#020617] shadow-[0_0_20px_rgba(6,182,212,0.5)]">S</div>
            <div>
              <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-1">Certifica_AI</p>
              <h1 className="text-xl font-black uppercase italic tracking-tighter">Vocal_Lab</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto w-full p-6 py-12 space-y-12 flex-grow">
        <section className="bg-slate-900/40 border border-white/5 p-12 rounded-[50px] text-center relative shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <Sparkles className="absolute top-6 right-8 text-cyan-500/20" size={40} />
          
          <h2 className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[0.4em] mb-6 italic">Target_Sentence_v2.0</h2>
          <p className="text-4xl font-black italic tracking-tighter mb-10 leading-tight">"{task?.targetSentence}"</p>
          
          <div className="flex justify-center gap-6">
            <button 
              onClick={() => { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(task?.targetSentence); u.lang="en-US"; u.rate=0.9; window.speechSynthesis.speak(u); }}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest border border-white/5"
            >
              <Volume2 size={16} className="text-cyan-500" /> Escuchar Guía
            </button>
            <button 
              title="Recargar pregunta"
              onClick={() => fetchTask(userUid!)}
              className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-cyan-400 transition-all border border-white/5"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </section>

        <section className="flex flex-col items-center gap-8">
          {/* Botón de Grabación con efecto Ripple */}
          <div className="relative">
            {isRecording && (
              <motion.div 
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-red-500 rounded-full"
              />
            )}
            <button 
              onClick={() => {
                if(isRecording) recognitionRef.current?.stop();
                else { setTranscript(""); recognitionRef.current?.start(); setIsRecording(true); }
              }}
              className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 transition-all ${isRecording ? "bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]" : "bg-cyan-600 hover:bg-cyan-500 shadow-xl"}`}
            >
              {isRecording ? <MicOff size={40} /> : <Mic size={40} className="text-[#020617]" />}
            </button>
          </div>

          <div className="w-full bg-slate-900/60 p-10 rounded-[40px] border border-white/5 text-center min-h-[140px] flex items-center justify-center relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
              {[1,2,3].map(i => <div key={i} className={`w-1 h-1 rounded-full ${isRecording ? "bg-red-500 animate-bounce" : "bg-slate-700"}`} style={{ animationDelay: `${i*0.2}s` }} />)}
            </div>
            {transcript ? (
              <p className="text-2xl font-bold italic text-white leading-relaxed">"{transcript}"</p>
            ) : (
              <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">Esperando entrada de audio...</p>
            )}
          </div>

          <button 
            disabled={!transcript || isRecording}
            onClick={handleEvaluate}
            className="w-full py-8 bg-white text-[#020617] rounded-[30px] font-black uppercase text-[11px] tracking-[0.5em] disabled:opacity-10 hover:bg-cyan-400 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95"
          >
            Sincronizar Protocolo <Send size={18} />
          </button>
        </section>
      </main>

      <AnimatePresence>
        {showResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/98 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f172a] border border-cyan-500/20 p-16 rounded-[70px] text-center max-w-md w-full shadow-3xl">
              <Award className="mx-auto text-cyan-400 mb-8 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" size={100} />
              <div className="flex items-center justify-center gap-4 mb-4">
                <h2 className="text-9xl font-black italic text-white tracking-tighter">{score}</h2>
                <span className="text-4xl font-black text-cyan-500 italic">%</span>
              </div>
              <p className="text-cyan-500/50 text-[11px] font-black uppercase tracking-[0.6em] mb-12 italic">Vocal_Accuracy_Score</p>
              <div className="flex flex-col gap-4">
                <button onClick={handleRetry} className="w-full py-6 bg-white/5 border border-white/10 text-white rounded-[25px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                  <RotateCcw size={18} /> Reintentar Fase
                </button>
                <button onClick={() => router.push("/modulos")} className="w-full py-7 bg-cyan-600 text-[#020617] rounded-[25px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(8,145,178,0.3)] hover:bg-cyan-500 transition-all">
                  <LayoutGrid size={18} /> Panel de Módulos
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}