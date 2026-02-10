"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Headset, Loader2, Play, Send, Volume2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ListeningTask {
  passage: string; // Cambiado a 'passage' para coincidir con tu main.py
  questions: Question[];
}

export default function ListeningModule() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
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
      // Obtenemos el nivel del usuario desde Firebase
      const progressRef = doc(db, "user_progress", uid);
      const snap = await getDoc(progressRef);
      const levelToUse = snap.exists() ? snap.data().currentLevel : "A1";

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

    // Cleanup: Detener el audio si el usuario sale de la página
    return () => {
      unsub();
      window.speechSynthesis.cancel();
    };
  }, [router, fetchTask]);

  const playMainAudio = () => {
    if (!task || !task.passage) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(task.passage);
    utterance.lang = "en-US";
    utterance.rate = 0.85; // Un poquito más rápido que el anterior para que sea natural
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleAnswer = async () => {
    if (selectedAnswer === null || !task) return;

    const isCorrect = task.questions[currentStep].options[selectedAnswer] === task.questions[currentStep].correctAnswer;
    
    // CORRECCIÓN: Variable local para cálculo inmediato del score
    const updatedCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    
    if (isCorrect) setCorrectCount(prev => prev + 1);

    if (currentStep < task.questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedAnswer(null);
      window.speechSynthesis.cancel(); // Detener audio si estaba sonando al pasar de pregunta
      setIsPlaying(false);
    } else {
      const finalScore = Math.round((updatedCorrectCount / task.questions.length) * 100);
      
      if (userUid) {
        await setDoc(doc(db, "user_progress", userUid), {
          modules: { listening: finalScore },
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      setShowResult(true);
    }
  };

  if (loading || !task) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
      <p className="text-blue-400 font-black text-[10px] tracking-[0.3em] uppercase">Generando Audio con GPT...</p>
    </div>
  );

  if (showResult) {
    const finalPercentage = Math.round((correctCount / task.questions.length) * 100);
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/50 p-12 rounded-[50px] text-center border border-blue-500/20 max-w-md w-full shadow-2xl backdrop-blur-md">
          <Award className="mx-auto text-blue-400 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" size={80} />
          <h2 className="text-5xl font-black mb-2 italic tracking-tighter">{finalPercentage}%</h2>
          <p className="text-blue-500/60 text-[10px] font-black uppercase tracking-[0.4em] mb-10">Listening Completed</p>
          <button onClick={() => router.push("/modulos")} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-400 transition-all">Finalizar Misión</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <nav className="p-8 flex justify-between items-center bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <Link href="/modulos" className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"><ArrowLeft size={20}/></Link>
        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          Question {currentStep + 1} of {task?.questions?.length || 0}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto w-full p-6 space-y-8 flex-grow">
        <section className="bg-slate-900/40 border border-white/5 p-10 rounded-[40px] text-center relative overflow-hidden shadow-inner">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center justify-center gap-2">
            <Headset size={14} className="text-blue-500" /> Audio_Passage_Sync
          </p>
          
          <button 
            onClick={playMainAudio}
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-all shadow-2xl ${isPlaying ? "bg-blue-400 scale-110 shadow-blue-500/20" : "bg-blue-600 hover:scale-105"}`}
          >
            {isPlaying ? <Volume2 size={40} className="animate-pulse text-white" /> : <Play size={40} className="ml-2 text-white" />}
          </button>
          <h2 className="text-lg font-bold text-slate-300 italic">Escucha con atención el fragmento generado por la IA</h2>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-black italic uppercase leading-tight tracking-tight border-l-4 border-blue-500 pl-4">
            {task.questions[currentStep].question}
          </h3>
          <div className="grid gap-4">
            {task.questions[currentStep].options.map((opt, i) => (
              <button 
                key={i}
                onClick={() => setSelectedAnswer(i)}
                className={`w-full p-6 rounded-[25px] border-2 text-left transition-all flex items-center gap-4 ${selectedAnswer === i ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)] scale-[1.01]" : "border-white/5 bg-slate-900/40 hover:bg-slate-900/60"}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAnswer === i ? "bg-blue-500 border-blue-500" : "border-slate-700"}`}>
                   {selectedAnswer === i && <div className="w-2 h-2 bg-[#020617] rounded-full" />}
                </div>
                <span className={`font-bold text-sm uppercase tracking-tight ${selectedAnswer === i ? "text-white" : "text-slate-500"}`}>{opt}</span>
              </button>
            ))}
          </div>

          <button 
            disabled={selectedAnswer === null}
            onClick={handleAnswer}
            className="w-full py-6 bg-white text-black rounded-[25px] font-black uppercase text-[11px] tracking-[0.3em] disabled:opacity-20 hover:bg-blue-400 transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            {currentStep === task.questions.length - 1 ? "Analizar Protocolo" : "Confirmar Respuesta"} <Send size={16} />
          </button>
        </section>
      </main>
    </div>
  );
}