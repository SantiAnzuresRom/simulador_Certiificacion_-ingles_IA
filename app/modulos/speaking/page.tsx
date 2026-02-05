"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Volume2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

// --- 1. DEFINICIÓN DE TIPOS REALES (Sin 'any') ---
// Esto mata el error "Unexpected any" de raíz
interface SpeechRecognitionResult {
  readonly [index: number]: {
    readonly [index: number]: {
      readonly transcript: string;
    };
  };
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResult;
}

// Interfaces para el constructor y la instancia
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

// Extensión global de Window con tipos específicos
declare global {
  interface Window {
    SpeechRecognition: {
      new (): ISpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): ISpeechRecognition;
    };
  }
}

interface SpeakingQuestion {
  question: string;
}

export default function SpeakingModule() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [phrases, setPhrases] = useState<SpeakingQuestion[]>([]);

  const fetchSpeakingData = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      const snap = await getDoc(doc(db, "user_progress", uid));
      // Según el plan de Certifica AI, el historial es por nivel 
      const level = snap.exists() ? snap.data().currentLevel : "A1";

      const res = await fetch("http://127.0.0.1:8000/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "speaking", level })
      });
      
      const data = await res.json();
      const questions = data.questions || data.items || [{ question: "Hello, how are you today?" }];
      setPhrases(questions);
    } catch (e) {
      console.error("Critical Failure:", e);
      setPhrases([{ question: "System offline. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid);
        fetchSpeakingData(user.uid);
      } else {
        router.replace("/login");
      }
    });
    return () => unsub();
  }, [router, fetchSpeakingData]);

  const startRecognition = () => {
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      alert("Browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleNext = async () => {
    const target = phrases[currentStep].question.toLowerCase().replace(/[.,!?]/g, "");
    const spoken = transcript.toLowerCase();
    
    if (spoken.includes(target.split(" ")[0])) { 
        setScore(prev => prev + 1);
    }

    if (currentStep < phrases.length - 1) {
      setCurrentStep(prev => prev + 1);
      setTranscript("");
    } else {
      const finalScore = Math.round(((score + 1) / phrases.length) * 100);
      await saveProgress(finalScore);
      setShowResult(true);
    }
  };

  const saveProgress = async (finalPercentage: number) => {
    if (!userUid) return;
    try {
      await setDoc(doc(db, "user_progress", userUid), {
        modules: { speaking: finalPercentage },
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) { console.error("Cloud Sync Error", e); }
  };

  const playTTS = (text: string) => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "en-US";
      utt.rate = 0.9;
      window.speechSynthesis.speak(utt);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-emerald-400 mb-4" size={40} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Loading_Oral_Protocol</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <nav className="p-8 flex justify-between items-center bg-[#020617]/50 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/modulos" title="Back to Hub" className="p-3 hover:bg-white/5 rounded-2xl transition-all border border-white/5 text-slate-400 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">
           Step {currentStep + 1} of {phrases.length}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-slate-900/40 border border-white/5 p-12 rounded-[4rem] text-center shadow-2xl relative overflow-hidden mb-12"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-sky-500" />
            <h2 className="text-4xl font-black italic uppercase leading-tight mb-8">
              &quot;{phrases[currentStep]?.question}&quot;
            </h2>
            <button 
              onClick={() => playTTS(phrases[currentStep]?.question || "")} 
              title="Play Example"
              className="p-6 bg-white/5 rounded-full text-emerald-400 hover:bg-emerald-400 hover:text-slate-900 transition-all"
            >
              <Volume2 size={32} />
            </button>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col items-center gap-10 w-full">
          <button 
            onClick={startRecognition}
            title={isListening ? "Stop Microphone" : "Start Microphone"}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${isListening ? "bg-red-500 animate-pulse shadow-[0_0_50px_rgba(239,68,68,0.4)]" : "bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)] hover:scale-105"}`}
          >
            {isListening ? <MicOff size={40} /> : <Mic size={40} className="text-[#020617]" />}
          </button>

          <div className="min-h-[4rem] text-center">
            {transcript ? (
              <p className="text-emerald-400 font-bold text-2xl uppercase italic tracking-tighter">
                &quot;{transcript}&quot;
              </p>
            ) : (
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Tap microphone to begin speaking</p>
            )}
          </div>

          <button 
            disabled={!transcript || isListening}
            onClick={handleNext}
            className="w-full py-6 bg-white text-slate-950 rounded-3xl font-black uppercase text-xs tracking-widest disabled:opacity-20 hover:bg-emerald-400 transition-all flex items-center justify-center gap-3"
          >
            {currentStep === phrases.length - 1 ? "Sync_Final_Results" : "Next_Phase"} <Send size={16} />
          </button>
        </div>
      </main>

      {showResult && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-slate-900 border border-white/10 p-16 rounded-[4rem] text-center max-w-md w-full shadow-2xl">
            <Award className="mx-auto text-emerald-400 mb-8" size={80} />
            <div className="text-7xl font-black italic mb-4">{Math.round((score/phrases.length)*100)}%</div>
            <p className="text-slate-400 uppercase text-[10px] font-black tracking-widest mb-12 italic">Speaking_Mastery_Level</p>
            <button onClick={() => router.push("/modulos")} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest">Return_to_Hub</button>
            <button onClick={() => window.location.reload()} title="Retry Test" className="mt-4 text-slate-500 flex items-center justify-center gap-2 w-full text-[10px] font-black uppercase tracking-widest">
              <RotateCcw size={14} /> Retry_Module
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}