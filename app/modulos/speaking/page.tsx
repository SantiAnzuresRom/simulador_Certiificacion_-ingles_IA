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
  Award,
  AlertCircle
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
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  const fetchTask = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      setErrorStatus(null);
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
        prompt: data.prompt || "Pronounce the sentence:",
        targetSentence: data.targetSentence || data.sentence || "The technology of today is the magic of tomorrow.",
      });
    } catch (e) {
      console.error("Fetch error:", e);
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
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    };
  }, [router, fetchTask]);

  const startSpeechRecognition = async () => {
    setErrorStatus(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setErrorStatus("permission-denied");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorStatus("not-supported");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setErrorStatus(null);
    };

    recognition.onresult = (e: any) => {
      const current = Array.from(e.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join("");
      setTranscript(current);
    };

    recognition.onerror = (e: any) => {
      console.warn("Speech Recognition Error:", e.error);
      setIsRecording(false);
      
      if (e.error === 'network') {
        setErrorStatus("network-error");
      } else if (e.error === 'not-allowed') {
        setErrorStatus("permission-denied");
      } else {
        setErrorStatus(e.error);
      }
      
      recognition.stop();
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    
    setTimeout(() => {
      try {
        recognition.start();
      } catch (e) {
        console.error("Start Error:", e);
      }
    }, 200);
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleEvaluate = async () => {
    if (!transcript || !task || !userUid) return;
    stopSpeechRecognition();

    // Normalización de texto para comparación precisa
    const cleanText = (text: string) => text.replace(/[^\w\s]/g, "").toLowerCase().trim();
    
    const target = cleanText(task.targetSentence);
    const input = cleanText(transcript);
    
    const targetWords = target.split(/\s+/).filter(Boolean);
    const inputWords = input.split(/\s+/).filter(Boolean);
    
    let matches = 0;
    targetWords.forEach((word) => { 
      if (inputWords.includes(word)) matches++; 
    });

    const finalScore = Math.min(100, Math.round((matches / targetWords.length) * 100));
    setScore(finalScore);
    
    try {
      const progressRef = doc(db, "user_progress", userUid);
      await updateDoc(progressRef, {
        [`modules_${currentLevel}.speaking`]: finalScore,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) { 
      console.error("Firestore update error:", e); 
    }
    
    setShowResult(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-sans">
        <div className="relative w-24 h-24 mb-6">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 border-b-2 border-orange-500 rounded-full" />
          <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-2 border-t-2 border-amber-200 rounded-full" />
        </div>
        <p className="text-orange-500 font-bold tracking-[0.4em] animate-pulse uppercase text-[10px]">SYNCING VOICE ENGINE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans overflow-x-hidden">
      
      <nav className="max-w-[1400px] mx-auto w-full px-8 py-10 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-6">
          <NextLink href="/modulos" className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
            <ArrowLeft size={20} className="text-white/60 group-hover:text-white" />
          </NextLink>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Mic size={24} className="text-[#020617]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Speaking Lab</h1>
              <p className="text-[10px] font-black tracking-[0.2em] text-orange-500 uppercase italic">{currentLevel} Module</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto w-full px-8 flex-1 flex flex-col justify-center relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/[0.02] border border-white/[0.08] p-12 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative flex flex-col justify-center min-h-[400px]"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-500 to-amber-300" />
            <div className="flex items-center gap-3 mb-10">
              <Sparkles size={16} className="text-orange-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Vocal Mission</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-light leading-[1.4] text-slate-100 italic mb-10">
              "{task?.targetSentence}"
            </h2>

            <button 
              onClick={() => {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(task?.targetSentence);
                u.lang = "en-US"; u.rate = 0.85;
                window.speechSynthesis.speak(u);
              }}
              className="w-fit flex items-center gap-3 px-6 py-4 bg-orange-500/10 rounded-2xl text-orange-400 hover:bg-orange-500/20 transition-all border border-orange-500/20 font-bold text-[10px] uppercase tracking-widest"
            >
              <Volume2 size={18} /> Audio Guide
            </button>
          </motion.section>

          <div className="flex flex-col gap-4 justify-center">
            <motion.div 
              className="bg-white/[0.02] border border-white/[0.08] p-10 rounded-[3rem] text-center flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden"
              animate={isRecording ? { borderColor: "rgba(249, 115, 22, 0.4)" } : {}}
            >
              <AnimatePresence>
                {errorStatus && (
                  <motion.div 
                    initial={{ y: -50, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="absolute top-6 inset-x-6 z-20"
                  >
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4">
                      <AlertCircle className="text-red-500 shrink-0" size={20} />
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest text-left">
                        {errorStatus === "network-error" 
                          ? "Network connection issue. Please check your internet." 
                          : "Voice error: Check your microphone permissions."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <h3 className="text-xl font-bold italic tracking-tighter mt-8">
                {isRecording ? "Listening..." : "Ready to Record"}
              </h3>

              <div className="bg-black/40 w-full p-8 rounded-[2rem] border border-white/5 min-h-[120px] flex items-center justify-center">
                <p className={`text-lg italic leading-relaxed font-medium ${transcript ? "text-white" : "text-white/20"}`}>
                  {transcript || "Speak now..."}
                </p>
              </div>

              <div className="relative">
                <AnimatePresence>
                  {isRecording && (
                    <motion.div 
                      initial={{ scale: 1, opacity: 0.5 }} 
                      animate={{ scale: 2, opacity: 0 }} 
                      exit={{ opacity: 0 }} 
                      transition={{ duration: 1.5, repeat: Infinity }} 
                      className="absolute inset-0 bg-orange-500 rounded-full" 
                    />
                  )}
                </AnimatePresence>
                <button
                  onClick={() => isRecording ? stopSpeechRecognition() : startSpeechRecognition()}
                  className={`w-24 h-24 rounded-full flex items-center justify-center relative z-10 transition-all active:scale-90 ${
                    isRecording 
                    ? "bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]" 
                    : "bg-orange-500 hover:bg-orange-400 shadow-xl shadow-orange-500/20"
                  }`}
                >
                  {isRecording ? <MicOff size={32} /> : <Mic size={32} className="text-[#020617]" />}
                </button>
              </div>
            </motion.div>

            <button
              disabled={!transcript || isRecording}
              onClick={handleEvaluate}
              className="w-full py-8 bg-white text-black hover:bg-orange-500 hover:text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl disabled:opacity-20 mt-4"
            >
              Analyze Speech <Send size={18} />
            </button>
          </div>

        </div>
      </main>

      <AnimatePresence>
        {showResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-3xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-white/[0.03] border border-white/10 p-16 rounded-[4rem] text-center max-w-xl w-full shadow-2xl relative overflow-hidden"
            >
              <Award className="mx-auto text-orange-400 mb-8" size={64} />
              <h2 className="text-9xl font-black tracking-tighter text-white mb-2">
                {score}%
              </h2>
              <p className="text-white/20 text-[10px] font-black tracking-[0.5em] uppercase mb-12">Accuracy Report</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setShowResult(false); setTranscript(""); fetchTask(userUid!); }} 
                  className="py-6 bg-white/[0.05] border border-white/10 rounded-3xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                >
                  <RotateCcw size={16} /> Retry
                </button>
                <button 
                  onClick={() => router.push("/modulos")} 
                  className="py-6 bg-white text-black rounded-3xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-lg"
                >
                  <LayoutGrid size={16} /> Finish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}