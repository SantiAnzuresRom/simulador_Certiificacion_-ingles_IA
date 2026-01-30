"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Mic, MicOff, RotateCcw, Send, Volume2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

// 1. Definimos interfaces para que TypeScript esté feliz sin usar 'any'
interface ISpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onresult: (event: ISpeechRecognitionEvent) => void;
  onend: () => void;
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
      const progressRef = doc(db, "user_progress", uid);
      const snap = await getDoc(progressRef);
      const levelToUse = snap.exists() ? snap.data().currentLevel : "A1";

      const res = await fetch("http://127.0.0.1:8000/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "speaking", level: levelToUse, count: 10 })
      });
      
      const data = await res.json();
      setPhrases(data.questions);
    } catch (e) {
      console.error("Error cargando frases:", e);
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

  const startSpeechRecognition = () => {
    const WindowWithSpeech = window as unknown as {
      SpeechRecognition: new () => ISpeechRecognition;
      webkitSpeechRecognition: new () => ISpeechRecognition;
    };
    
    const SpeechRecognition = WindowWithSpeech.SpeechRecognition || WindowWithSpeech.webkitSpeechRecognition;
    
    if (!SpeechRecognition) return alert("Navegador no compatible.");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const updateFirebaseProgress = async (finalPercentage: number) => {
    if (!userUid) return;
    try {
      const progressRef = doc(db, "user_progress", userUid);
      await setDoc(progressRef, {
        modules: { speaking: finalPercentage },
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) { console.error(e); }
  };

  const handleNext = async () => {
    const target = phrases[currentStep].question.toLowerCase().replace(/[.,!?]/g, "");
    const spoken = transcript.toLowerCase();
    
    let currentScore = score;
    if (spoken.length > target.length * 0.7) {
      currentScore += 1;
      setScore(currentScore);
    }

    if (currentStep < phrases.length - 1) {
      setCurrentStep(prev => prev + 1);
      setTranscript("");
    } else {
      const finalPercentage = Math.round((currentScore / phrases.length) * 100);
      await updateFirebaseProgress(finalPercentage);
      setShowResult(true);
    }
  };

  const playText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  if (loading || phrases.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
      <Image src="/logo2.png" alt="X" width={80} height={80} className="animate-pulse mb-4" />
      <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">Iniciando Protocolo...</p>
    </div>
  );

  if (showResult) {
    const finalScore = Math.round((score / phrases.length) * 100);
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/50 backdrop-blur-3xl border border-emerald-500/20 p-12 rounded-[50px] text-center max-w-md w-full shadow-2xl">
          <Award className="mx-auto text-emerald-400 mb-6" size={80} />
          <h2 className="text-5xl font-black italic uppercase mb-2">{finalScore}%</h2>
          <div className="space-y-4 mt-10">
            <button onClick={() => router.push("/modulos")} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest">Regresar</button>
            <button onClick={() => { setCurrentStep(0); setScore(0); setShowResult(false); setTranscript(""); }} className="flex items-center justify-center gap-2 w-full py-4 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">
               <RotateCcw size={14} /> Reintentar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <style jsx global>{`::-webkit-scrollbar { display: none; }`}</style>
      
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <Link href="/modulos" className="p-2 hover:bg-white/5 rounded-lg transition-colors"><ArrowLeft size={22} /></Link>
        <div className="bg-emerald-500/10 px-5 py-2 rounded-2xl border border-emerald-500/30 text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">
           Paso {currentStep + 1} / {phrases.length}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 mt-16">
        <div className="max-w-2xl w-full">
          <motion.div key={currentStep} className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-12 rounded-[50px] mb-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Repite la frase:</p>
            <h2 className="text-3xl font-black italic uppercase leading-tight text-white mb-8">
              &quot;{phrases[currentStep].question}&quot;
            </h2>
            <button 
              aria-label="Escuchar frase"
              onClick={() => playText(phrases[currentStep].question)} 
              className="p-5 bg-emerald-500/10 rounded-full text-emerald-400 hover:bg-emerald-500 hover:text-[#020617] transition-all"
            >
              <Volume2 size={32} />
            </button>
          </motion.div>

          <div className="flex flex-col items-center gap-8">
            <button 
              aria-label={isListening ? "Detener grabación" : "Iniciar grabación"}
              onClick={startSpeechRecognition}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening ? "bg-red-500 animate-pulse" : "bg-emerald-500 shadow-xl shadow-emerald-500/20"}`}
            >
              {isListening ? <MicOff size={40} className="text-white" /> : <Mic size={40} className="text-[#020617]" />}
            </button>

            <div className="h-24 flex items-center justify-center text-center">
              {transcript ? (
                <p className="text-emerald-400 font-black italic text-xl uppercase tracking-tighter">
                  &quot;{transcript}&quot;
                </p>
              ) : (
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Pulsa el micro para hablar</p>
              )}
            </div>

            <button 
              disabled={!transcript || isListening}
              onClick={handleNext}
              className="w-full max-w-xs py-6 bg-white text-[#020617] rounded-[30px] font-black uppercase text-[11px] tracking-[0.3em] disabled:opacity-20 hover:bg-emerald-400 transition-all flex items-center justify-center gap-3"
            >
              {currentStep === phrases.length - 1 ? "Finalizar" : "Siguiente"} <Send size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}