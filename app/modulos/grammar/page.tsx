"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Award, ChevronRight, LayoutGrid, RotateCcw, Sparkles, Terminal, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function GrammarModule() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<string>("--");
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const fetchTask = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      setCurrentStep(0);
      setSelectedAnswer(null);
      setCorrectCount(0);
      setShowResult(false);

      const progressRef = doc(db, "user_progress", uid);
      const snap = await getDoc(progressRef);
      const levelToUse = snap.exists() ? snap.data().currentLevel : "A1";
      setCurrentLevel(levelToUse);

      const res = await fetch(`${BACKEND_URL}/api/v1/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "grammar", level: levelToUse }),
      });

      const data = await res.json();
      setTask(data);
    } catch (e) {
      console.error("Error loading grammar:", e);
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
    return () => unsub();
  }, [router, fetchTask]);

  const handleAnswer = () => {
    if (selectedAnswer === null || !task) return;

    const isCorrect = task.questions[currentStep].options[selectedAnswer] === task.questions[currentStep].correctAnswer;
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    if (currentStep < task.questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  if (loading || !task) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-sans">
      <div className="relative w-24 h-24 mb-6">
        {/* Loader de dos líneas */}
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 border-b-2 border-purple-500 rounded-full" />
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-2 border-t-2 border-fuchsia-500 rounded-full" />
      </div>
      <p className="text-purple-400 font-bold tracking-[0.4em] animate-pulse  text-[10px]">Cargando Nivel {currentLevel}...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col font-sans overflow-x-hidden">
      
      {/* Luces de fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="max-w-[1400px] mx-auto w-full px-8 py-10 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-6">
          <Link href="/modulos" className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Grammar Lab</h1>
            <p className="text-[10px] font-black tracking-[0.2em] text-purple-500  italic">English {currentLevel}</p>
          </div>
        </div>
        
        <div className="bg-white/[0.03] border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl">
          <span className="text-[11px] font-mono text-white/40">
            PROGRESS: <span className="text-white font-bold">{currentStep + 1} / {task.questions.length}</span>
          </span>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto w-full px-8 flex-1 flex flex-col justify-center relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          
          {/* COLUMNA IZQUIERDA: La Oración (Fix de espacios aquí) */}
          <motion.section 
            key={currentStep}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/[0.02] border border-white/[0.08] p-12 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative flex flex-col justify-center min-h-[400px]"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500 to-fuchsia-500" />
            <div className="flex items-center gap-3 mb-10">
              <Sparkles size={16} className="text-purple-400" />
              <span className="text-[10px] font-black  tracking-[0.3em] text-white/30">Syntax Assessment</span>
            </div>
            
            <div className="text-3xl md:text-5xl font-light leading-[1.4] text-slate-100 tracking-tight">
              {task.questions[currentStep].question.split("___").map((part: string, i: number, arr: any[]) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="mx-2 px-6 py-1 border-b-4 border-purple-500 bg-purple-500/10 text-purple-400 font-bold min-w-[160px] inline-block text-center rounded-t-3xl transition-all duration-500">
                      {selectedAnswer !== null 
                        ? task.questions[currentStep].options[selectedAnswer] 
                        : "•••"}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </motion.section>

          {/* COLUMNA DERECHA: Opciones */}
          <div className="flex flex-col gap-4 justify-center">
            <div className="grid grid-cols-1 gap-3">
              {task.questions[currentStep].options.map((opt: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedAnswer(i)}
                  className={`p-7 rounded-[2rem] border transition-all duration-300 text-left group relative flex items-center justify-between ${
                    selectedAnswer === i 
                    ? "border-purple-500 bg-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.2)]" 
                    : "border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-6 relative z-10">
                    <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${
                      selectedAnswer === i ? "bg-purple-500 text-white rotate-12" : "bg-white/5 text-white/20"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={`text-xl font-medium transition-colors ${selectedAnswer === i ? "text-white" : "text-white/40 group-hover:text-white"}`}>
                      {opt}
                    </span>
                  </div>
                  {selectedAnswer === i && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 size={28} className="text-purple-500" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <button
              disabled={selectedAnswer === null}
              onClick={handleAnswer}
              className="w-full py-8 bg-white text-black hover:bg-purple-500 hover:text-white rounded-[2rem] font-black  tracking-[0.2em] text-xs transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl disabled:opacity-5 mt-4"
            >
              {currentStep === task.questions.length - 1 ? "Finish Logic" : "Process Next"}
              <ChevronRight size={20} />
            </button>
          </div>

        </div>
      </main>

      {/* Modal de Resultados */}
      <AnimatePresence>
        {showResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050810]/95 backdrop-blur-3xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-white/[0.03] border border-white/10 p-16 rounded-[4rem] text-center max-w-xl w-full shadow-2xl relative overflow-hidden"
            >
              <Award className="mx-auto text-purple-400 mb-8" size={64} />
              <h2 className="text-9xl font-black tracking-tighter text-white mb-2">
                {Math.round((correctCount / task.questions.length) * 100)}%
              </h2>
              <p className="text-white/20 text-[10px] font-black tracking-[0.5em]  mb-12">Performance Report</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => fetchTask(userUid!)} 
                  className="py-6 bg-white/[0.05] border border-white/10 rounded-3xl flex items-center justify-center gap-2 font-black text-[10px] upercase tracking-[0.2em] hover:bg-white/10 transition-all"
                >
                  <RotateCcw size={16} /> Retry
                </button>
                <button 
                  onClick={() => router.push("/modulos")} 
                  className="py-6 bg-white text-black rounded-3xl flex items-center justify-center gap-2 font-black text-[10px]  tracking-[0.2em] hover:bg-purple-500 hover:text-white transition-all shadow-lg"
                >
                  <LayoutGrid size={16} /> Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}