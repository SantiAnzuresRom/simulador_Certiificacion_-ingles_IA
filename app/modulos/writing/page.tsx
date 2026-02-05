"use client";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, FileText, Loader2, PenTool, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

interface EvaluationResult {
  score: number;
  feedback: string;
}

export default function ProfessionalWritingPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPrompt, setFetchingPrompt] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [prompt, setPrompt] = useState("Loading your writing task...");
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const fetchPrompt = useCallback(async (level: string) => {
    try {
      setFetchingPrompt(true);
      const res = await fetch("http://127.0.0.1:8000/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "writing", level })
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setPrompt(data.passage || data.title || "Write an essay about the impact of technology in education.");
    } catch (e) {
      console.error("Critical: Error fetching prompt", e);
      setPrompt("Discuss the importance of learning a second language in the modern world.");
    } finally {
      setFetchingPrompt(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "user_progress", user.uid));
        const level = snap.exists() ? snap.data().currentLevel : "A1";
        setSelectedLevel(level);
        fetchPrompt(level);
      } catch (err) {
        console.error("Firebase Init Error", err);
      }
    };
    init();
  }, [fetchPrompt]);

  const handleSubmit = async () => {
    if (wordCount < 15) return alert("Your composition is too short. Aim for professional depth.");
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Session expired");

      const response = await fetch("http://127.0.0.1:8000/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "grade_writing",
          content: text, 
          level: selectedLevel,
          prompt: prompt
        }),
      });

      const data = await response.json(); 
      const evaluation: EvaluationResult = {
        score: typeof data.score === 'number' ? data.score : 0,
        feedback: data.feedback || "Your submission was processed successfully."
      };

      setResult(evaluation);
      const progressRef = doc(db, "user_progress", user.uid);
      await setDoc(progressRef, {
        modules: { writing: evaluation.score },
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setShowModal(true);
    } catch (error) {
      console.error("Submission Error:", error);
      alert("System sync failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-sky-500/30">
      {/* HEADER CON IDENTIDAD CERTIFICA AI */}
      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/modulos" className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="flex items-center gap-3">
            {/* LOGO DE CERTIFICA AI */}
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-lg flex items-center justify-center font-black text-slate-900 text-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              C
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-sky-400 block leading-none mb-1">Certifica_AI</span>
              <h1 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-white">
                <PenTool size={14} className="text-emerald-400" /> WRITING_LAB
              </h1>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="hidden md:flex flex-col items-end mr-4">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active_Level</span>
             <span className="text-xs font-bold text-sky-400 uppercase italic">{selectedLevel}</span>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading || fetchingPrompt}
            className="px-8 py-3 bg-white hover:bg-sky-400 text-slate-950 text-[11px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : "Submit_Work"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* PANEL LATERAL: PROMPT CON MAS COLOR */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={60} className="text-sky-400" />
            </div>
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> IA_Instruction
            </h3>
            
            {fetchingPrompt ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-white/5 rounded-full w-full" />
                <div className="h-4 bg-white/5 rounded-full w-3/4" />
              </div>
            ) : (
              <p className="text-2xl font-black leading-[1.2] text-white italic tracking-tight">
                &quot;{prompt}&quot;
              </p>
            )}

            <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Target: Academic Depth
              </span>
              <button onClick={() => fetchPrompt(selectedLevel)} className="p-2 text-slate-400 hover:text-sky-400 transition-colors" title="Reload Prompt">
                <RotateCcw size={16} />
              </button>
            </div>
          </motion.div>

          {/* WORD COUNTER VISUAL */}
          <div className="bg-sky-500/5 p-6 rounded-3xl border border-sky-500/10 text-center">
             <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest block mb-1">Metrics: Word_Count</span>
             <span className="text-5xl font-black text-white italic">{wordCount}</span>
          </div>
        </div>

        {/* EDITOR DE TEXTO: MÁS CONTRASTE */}
        <div className="lg:col-span-8">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900/40 rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden min-h-[600px] flex flex-col focus-within:border-sky-500/30 transition-all border-b-sky-500/20">
            <div className="px-10 py-5 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black tracking-widest uppercase italic">
                  <FileText size={14} className="text-sky-400" /> Neural_Editor_v1.0
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
            </div>
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              className="flex-1 w-full p-12 text-xl leading-relaxed text-white outline-none resize-none placeholder:text-slate-700 font-medium bg-transparent"
              placeholder="Excribe aquí tu respuesta profesional..."
            />
          </motion.div>
        </div>
      </main>

      {/* MODAL DE RESULTADOS: MÁS COLOR */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-white/10 rounded-[4rem] p-12 max-w-xl w-full shadow-3xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-500 via-emerald-400 to-sky-500" />
              
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <CheckCircle2 size={40} />
              </div>
              
              <h2 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.5em] mb-4 italic">Performance_Analysis</h2>
              <div className="text-8xl font-black text-white italic mb-8 tracking-tighter">
                {result?.score}<span className="text-3xl text-emerald-400 font-black">%</span>
              </div>
              
              <div className="bg-white/5 p-8 rounded-3xl text-left border border-white/5 mb-10 max-h-48 overflow-y-auto custom-scrollbar">
                 <p className="text-sm text-slate-300 leading-relaxed font-medium italic">&quot;{result?.feedback}&quot;</p>
              </div>

              <button 
                onClick={() => router.push("/modulos")} 
                className="w-full py-6 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-sky-400 transition-all active:scale-95"
              >
                Sync_Results_&_Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}