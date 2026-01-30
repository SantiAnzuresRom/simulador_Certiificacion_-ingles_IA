"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { ArrowLeft, Award, CheckCircle2, RotateCcw, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

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

      // LLAMADA A TU BACKEND DE PYTHON (Vía el proxy de Next o directa si configuraste CORS)
      const res = await fetch("http://127.0.0.1:8000/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "reading", 
          level: levelToUse,
          count: 10 // Le pasamos al back que queremos 10
        })
      });
      
      const json: ReadingData = await res.json();
      setData(json);
    } catch (e) {
      console.error("Error conectando con el backend de Python:", e);
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
      await setDoc(progressRef, {
        modules: { reading: finalScore },
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleNext = async () => {
    if (selectedAnswer === null || !data) return;
    const isCorrect = data.questions[currentQuestion].options[selectedAnswer] === data.questions[currentQuestion].correctAnswer;
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    
    if (isCorrect) setCorrectCount(newCorrectCount);

    if (currentQuestion < data.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      const finalPercentage = Math.round((newCorrectCount / data.questions.length) * 100);
      await updateFirebaseProgress(finalPercentage);
      setShowResult(true);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
      <style jsx global>{`::-webkit-scrollbar { display: none; }`}</style>
      <Image src="/logo2.png" alt="X" width={80} height={80} className="animate-pulse mb-4" />
      <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Iniciando Protocolo Reading...</p>
    </div>
  );

  if (showResult || !data) {
    const score = Math.round((correctCount / (data?.questions.length || 10)) * 100);
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f172a]/80 backdrop-blur-2xl border border-cyan-500/20 p-12 rounded-[50px] text-center max-w-md w-full shadow-2xl">
          <Award className="mx-auto text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]" size={80} />
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">{score}%</h2>
          <p className="text-cyan-500/60 text-[10px] font-black uppercase tracking-[0.4em] mb-10">Misión Finalizada</p>
          <div className="flex flex-col gap-4">
            <button onClick={() => router.push("/modulos")} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-400 transition-all shadow-lg">Continuar</button>
            <button onClick={() => { setCurrentQuestion(0); setCorrectCount(0); setShowResult(false); setSelectedAnswer(null); }} className="flex items-center justify-center gap-2 w-full py-5 border border-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all">
              <RotateCcw size={16} /> Reintentar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 overflow-hidden">
      <style jsx global>{`
        section::-webkit-scrollbar { display: none; }
        section { -ms-overflow-style: none; scrollbar-width: none; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <nav className="fixed top-0 w-full z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <Link href="/modulos" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white"><ArrowLeft size={22} /></Link>
        <div className="bg-cyan-500/10 px-5 py-2 rounded-2xl border border-cyan-500/30 text-[10px] font-black text-cyan-400 uppercase tracking-widest italic shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            Step {currentQuestion + 1} / {data.questions.length}
        </div>
      </nav>

      <main className="pt-24 h-screen grid grid-cols-1 lg:grid-cols-2">
        <section className="p-10 lg:p-20 overflow-y-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl font-black text-white italic uppercase mb-10 tracking-tighter leading-none border-l-4 border-cyan-500 pl-6">{data.title}</h1>
            <div className="text-xl leading-[1.8] text-slate-400 font-medium whitespace-pre-wrap">{data.passage}</div>
          </motion.div>
        </section>

        <section className="p-10 lg:p-20 bg-[#070c1b]/60 backdrop-blur-md overflow-y-auto border-l border-white/5 relative">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-black text-white mb-10 italic uppercase leading-tight tracking-tight">{data.questions[currentQuestion].question}</h2>
            <div className="space-y-4">
              {data.questions[currentQuestion].options.map((opt, i) => (
                <button key={i} onClick={() => setSelectedAnswer(i)} className={`w-full p-6 rounded-[30px] border-2 text-left flex items-center gap-4 transition-all duration-300 ${selectedAnswer === i ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_25px_rgba(6,182,212,0.15)] scale-[1.02]" : "border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60"}`}>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${selectedAnswer === i ? "bg-cyan-500 border-cyan-500" : "border-slate-700"}`}>
                    {selectedAnswer === i && <CheckCircle2 size={14} className="text-[#020617] stroke-[3]" />}
                  </div>
                  <span className={`font-bold uppercase text-sm tracking-tight ${selectedAnswer === i ? "text-white" : "text-slate-500"}`}>{opt}</span>
                </button>
              ))}
            </div>
            
            <button disabled={selectedAnswer === null} onClick={handleNext} className="w-full mt-12 py-6 bg-white text-[#020617] rounded-[30px] font-black uppercase text-[11px] tracking-[0.3em] disabled:opacity-20 hover:bg-cyan-400 transition-all shadow-2xl flex items-center justify-center gap-3">
              {currentQuestion === data.questions.length - 1 ? "Analizar Protocolo" : "Siguiente Pregunta"} <Send size={16} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}