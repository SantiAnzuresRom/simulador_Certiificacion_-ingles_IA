"use client";

import { ArrowLeft, Award, CheckCircle2, Loader2, Send, Target } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// 1. TIPADO PARA ELIMINAR LOS ERRORES ROJOS
interface Question {
  question: string;
  options: string[];
}

interface ReadingData {
  title: string;
  passage: string;
  questions: Question[];
}

export default function ProfessionalReadingPage() {
  const [data, setData] = useState<ReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);

  useEffect(() => {
    async function loadReading() {
      try {
        setLoading(true);
        const lvl = localStorage.getItem("selectedLevel") || "A1";
        const res = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "reading", level: lvl, count: 10 }) 
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           throw new Error("Timeout del servidor. Reintenta.");
        }

        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadReading();
  }, []);

  const handleNext = async () => {
    if (selectedAnswer === null || !data) return;
    const currentAnswerText = data.questions[currentQuestion].options[selectedAnswer];
    const updatedAnswers = [...userAnswers, currentAnswerText];
    setUserAnswers(updatedAnswers);

    if (currentQuestion < data.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "reading",
            passage: data.passage,
            questions: data.questions,
            userAnswers: updatedAnswers
          })
        });
        const evalData = await res.json();
        setResult(evalData);
      } catch (e) {
        setError("Error de red.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading || isSubmitting) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin text-[#00f2ff] mb-4" size={50} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 italic">
        {isSubmitting ? "Uploading to Cloud..." : "Accessing Database..."}
      </p>
    </div>
  );

  if (result) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
      <div className="bg-[#0f172a] border-2 border-cyan-500/30 p-12 rounded-[40px] shadow-[0_0_50px_-12px_rgba(0,242,255,0.3)] max-w-md w-full">
        <Award className="mx-auto text-yellow-400 mb-6" size={60} />
        <h2 className="text-xl font-black text-white uppercase italic">Final Grade</h2>
        <div className="text-8xl font-black text-cyan-400 my-6 tracking-tighter">{result.score}/10</div>
        <p className="text-slate-400 mb-8 italic">{result.feedback}</p>
        <Link href="/modulos" className="block w-full py-4 bg-cyan-500 text-[#020617] rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all">
          Exit Module
        </Link>
      </div>
    </div>
  );

  const activeQ = data?.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300">
      <header className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/modulos" className="p-2 hover:bg-white/10 rounded-full text-slate-500">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Reading Lab</span>
        </div>
        <div className="px-5 py-1.5 bg-cyan-500 text-[#020617] rounded-full text-[10px] font-black">
          PHASE {currentQuestion + 1} / 10
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-70px)] overflow-hidden">
        {/* LECTURA: Mantener ancha para leer bien */}
        <section className="p-10 lg:p-16 overflow-y-auto border-r border-white/5 scrollbar-thin scrollbar-thumb-cyan-900">
          <h1 className="text-3xl font-black mb-8 text-white leading-tight uppercase italic border-l-4 border-cyan-500 pl-6">
            {data?.title}
          </h1>
          <div className="text-lg leading-relaxed text-slate-400 font-medium">
            {data?.passage}
          </div>
        </section>

        {/* PREGUNTAS: Más angostas para centrar la vista */}
        <section className="p-10 lg:p-16 overflow-y-auto bg-[#070c1b]">
          <div className="max-w-md mx-auto"> {/* AQUÍ SE HACE MÁS ANGOSTO */}
            <div className="flex items-center gap-2 mb-6">
              <Target className="text-cyan-500" size={16} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Select Objective</span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-10 leading-snug">
              {activeQ?.question}
            </h2>

            <div className="space-y-4">
              {activeQ?.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(idx)}
                  className={`w-full p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all group
                    ${selectedAnswer === idx 
                      ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_-5px_rgba(0,242,255,0.4)]" 
                      : "border-slate-800 bg-[#0f172a] hover:border-slate-600"}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                    ${selectedAnswer === idx ? "bg-cyan-400 border-cyan-400" : "border-slate-600 group-hover:border-slate-400"}`}>
                    {selectedAnswer === idx && <CheckCircle2 size={14} className="text-[#020617]" />}
                  </div>
                  <span className={`text-sm font-bold transition-colors ${selectedAnswer === idx ? "text-cyan-400" : "text-slate-400"}`}>
                    {opt}
                  </span>
                </button>
              ))}
            </div>

            <footer className="mt-12 flex items-center justify-between pt-8 border-t border-white/5">
               <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Progress status</span>
                  <span className="text-[10px] font-bold text-cyan-500">READY TO SEND</span>
               </div>
              <button
                disabled={selectedAnswer === null}
                onClick={handleNext}
                className="px-10 py-4 bg-white text-[#020617] rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 disabled:opacity-20 hover:bg-cyan-400 transition-all shadow-xl"
              >
                {currentQuestion === 9 ? "Summit results" : "Confirm Data"}
                <Send size={14} />
              </button>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}