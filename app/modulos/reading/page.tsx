"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "reading", level: levelToUse })
      });
      
      const json: ReadingData = await res.json();
      setData(json);
    } catch (e) {
      console.error("Error:", e);
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
        modules: {
          reading: finalScore 
        },
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
      <Image src="/logo2.png" alt="X" width={80} height={80} className="animate-pulse mb-4" />
      <p className="text-cyan-400 text-xs font-black uppercase tracking-[0.4em]">Protocolo Reading...</p>
    </div>
  );

  if (showResult || !data) {
    const score = Math.round((correctCount / (data?.questions.length || 10)) * 100);
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="bg-[#0f172a] border border-white/5 p-12 rounded-[40px] text-center max-w-md w-full shadow-2xl">
          <Award className="mx-auto text-yellow-400 mb-6" size={64} />
          <h2 className="text-2xl font-black text-white italic uppercase tracking-widest">{score}% SCORE</h2>
          <div className="flex flex-col gap-4 mt-10">
            <button onClick={() => router.push("/modulos")} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-400 transition-all">Ir a Módulos</button>
            <button onClick={() => { setCurrentQuestion(0); setCorrectCount(0); setShowResult(false); setSelectedAnswer(null); }} className="flex items-center justify-center gap-2 w-full py-5 border border-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-all">
              <RotateCcw size={16} /> Volver a intentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300">
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <Link href="/modulos" className="p-2 hover:bg-white/5 rounded-lg transition-colors"><ArrowLeft size={20} /></Link>
        <div className="bg-[#0f172a] px-4 py-2 rounded-xl border border-cyan-500/30 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
           Step {currentQuestion + 1} / {data.questions.length}
        </div>
      </nav>

      <main className="pt-24 h-screen grid grid-cols-1 lg:grid-cols-2">
        <section className="p-10 lg:p-20 overflow-y-auto">
          <h1 className="text-4xl font-black text-white italic uppercase mb-8">{data.title}</h1>
          <div className="text-xl leading-[2] text-slate-400 whitespace-pre-wrap">{data.passage}</div>
        </section>
        <section className="p-10 lg:p-20 bg-[#070c1b]/40 overflow-y-auto border-l border-white/5">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-black text-white mb-10 italic uppercase">{data.questions[currentQuestion].question}</h2>
            <div className="space-y-4">
              {data.questions[currentQuestion].options.map((opt, i) => (
                <button key={i} onClick={() => setSelectedAnswer(i)} className={`w-full p-6 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${selectedAnswer === i ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "border-white/5 bg-slate-900/40 hover:border-white/10"}`}>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${selectedAnswer === i ? "bg-cyan-500 border-cyan-500" : "border-slate-700"}`}>
                    {selectedAnswer === i && <CheckCircle2 size={14} className="text-black stroke-[3]" />}
                  </div>
                  <span className={`font-bold uppercase text-sm ${selectedAnswer === i ? "text-white" : "text-slate-500"}`}>{opt}</span>
                </button>
              ))}
            </div>
            <button disabled={selectedAnswer === null} onClick={handleNext} className="w-full mt-12 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-20 hover:bg-cyan-400 transition-all shadow-xl">
              {currentQuestion === data.questions.length - 1 ? "Analizar y Guardar" : "Continuar Misión"} <Send size={16} className="inline ml-2" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}