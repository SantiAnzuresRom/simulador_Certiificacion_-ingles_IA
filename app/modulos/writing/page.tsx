"use client";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, FileText, Loader2, PenTool, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

export default function ProfessionalWritingPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPrompt, setFetchingPrompt] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [prompt, setPrompt] = useState("Loading your writing task...");
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const fetchPrompt = useCallback(async (level: string) => {
    try {
      setFetchingPrompt(true);
      const res = await fetch("http://127.0.0.1:8000/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "writing", level })
      });
      const data = await res.json();
      setPrompt(data.passage || data.title);
    } catch (e) {
      console.error("Error fetching prompt:", e);
      setPrompt("Discuss the importance of learning a second language in the modern world.");
    } finally {
      setFetchingPrompt(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const user = auth.currentUser;
      let level = "A1";
      if (user) {
        const snap = await getDoc(doc(db, "user_progress", user.uid));
        if (snap.exists()) level = snap.data().currentLevel;
      }
      setSelectedLevel(level);
      fetchPrompt(level);
    };
    init();
  }, [fetchPrompt]);

  const handleSubmit = async () => {
    if (wordCount < 10) return alert("Escribe un poco más, bro.");
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user found");

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
      setResult(data);

      const progressRef = doc(db, "user_progress", user.uid);
      await setDoc(progressRef, {
        modules: { writing: data.score },
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setShowResult(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-[#87CEEB]/30">
      <style jsx global>{`::-webkit-scrollbar { display: none; }`}</style>
      
      <header className="sticky top-0 z-50 bg-[#0f172a] border-b border-white/10 px-8 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-6">
          <Link href="/modulos" className="p-2 text-slate-400 hover:text-[#87CEEB] transition-colors bg-white/5 rounded-xl border border-white/5">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#87CEEB]">Writing_Protocol</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight">
              <PenTool size={16} className="text-[#87CEEB]" /> Level_{selectedLevel}
            </h1>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="hidden md:block px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-white">
            <span className="text-slate-400 mr-2">METRICS:</span> {wordCount} WORDS
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading || fetchingPrompt}
            className="px-6 py-2 bg-[#87CEEB] hover:bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : "Analyze_Text"}
          </button>
        </div>
      </header>

      <div className="h-40 bg-[#0f172a] absolute top-0 w-full" />

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <div className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-300 shadow-xl">
            <h3 className="text-[10px] font-black text-[#87CEEB] uppercase tracking-[0.2em] mb-4 italic">Assignment_Prompt</h3>
            {fetchingPrompt ? (
              <div className="flex items-center gap-3 text-slate-500 animate-pulse">
                <Loader2 size={18} className="animate-spin" /> <span>Syncing with AI...</span>
              </div>
            ) : (
              <p className="text-xl font-extrabold leading-tight text-black">
                &quot;{prompt}&quot;
              </p>
            )}
            <button 
              onClick={() => fetchPrompt(selectedLevel)} 
              className="mt-6 flex items-center gap-2 text-[9px] font-black text-slate-500 hover:text-[#87CEEB] transition-colors uppercase tracking-widest"
            >
              <RotateCcw size={12} /> Change Prompt
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
             <span className="text-[10px] font-black uppercase tracking-widest text-[#87CEEB]">Evaluación IA</span>
             <p className="text-xs text-slate-300 mt-4 leading-relaxed font-bold">
               Asegúrate de usar gramática nivel {selectedLevel}. El sistema analizará tu coherencia y vocabulario.
             </p>
          </motion.div>
        </div>

        <div className="lg:col-span-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] shadow-2xl border border-slate-300 overflow-hidden min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between px-10 py-5 bg-slate-100 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-600 uppercase text-[9px] font-black tracking-[0.3em]">
                    <FileText size={14} className="text-[#87CEEB]" /> composition_workspace.log
                </div>
            </div>
            {/* AQUÍ ESTÁ EL CAMBIO DE COLOR: text-black y font-bold */}
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              className="flex-1 w-full p-12 text-xl leading-[2] text-black outline-none resize-none placeholder:text-slate-400 font-bold bg-transparent"
              placeholder="Start your professional composition here..."
            />
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f172a]/95 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3.5rem] p-12 max-w-xl w-full shadow-2xl text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Final_Report</h2>
              <div className="text-8xl font-black text-[#87CEEB] italic mb-8 tracking-tighter">{result?.score}%</div>

              <div className="bg-slate-100 p-8 rounded-[2.5rem] text-left border border-slate-200 mb-10">
                 <h4 className="text-[10px] font-black text-black uppercase mb-4 tracking-widest flex items-center gap-2">
                   <FileText size={14} className="text-[#87CEEB]" /> AI_Feedback_Log
                 </h4>
                 <p className="text-sm text-black leading-relaxed font-bold italic">
                   &quot;{result?.feedback}&quot;
                 </p>
              </div>

              <button 
                onClick={() => router.push("/modulos")}
                className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[#87CEEB] hover:text-slate-900 transition-all shadow-xl"
              >
                Sync_Data_and_Exit
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}