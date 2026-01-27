"use client";

import { doc, setDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, FileText, Loader2, PenTool } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

export default function ProfessionalWritingPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{score: number, feedback: string} | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    const lvl = localStorage.getItem("selectedLevel") || "A1";
    setSelectedLevel(lvl);
  }, []);

  const handleSubmit = async () => {
    if (wordCount < 10) return alert("Escribe un poco más, bro.");
    
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user found");

      // 1. LLAMADA AL MASTER API
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "writing",
          content: text, 
          level: selectedLevel 
        }),
      });

      const data = await response.json(); 
      setResult(data);

      // 2. ACTUALIZAR FIREBASE
      const progressRef = doc(db, "user_progress", user.uid, "levels", selectedLevel);
      await setDoc(progressRef, {
        writing: data.score,
        lastUpdated: new Date()
      }, { merge: true });

      // 3. MOSTRAR MODAL
      setShowModal(true);

    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el Master API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0f172a] border-b border-white/10 px-8 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-6">
          <Link href="/modulos" className="p-2 text-slate-400 hover:text-[#87CEEB] transition-colors bg-white/5 rounded-xl border border-white/5">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#87CEEB]">Active_Session</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight">
              <PenTool size={16} className="text-[#87CEEB]" /> Writing_{selectedLevel}
            </h1>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-white">
            <span className="text-slate-500 mr-2">WORDS:</span> {wordCount}/150
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-[#87CEEB] hover:bg-[#76bdda] text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : "Submit_Assessment"}
          </button>
        </div>
      </header>

      <div className="h-40 bg-[#0f172a] absolute top-0 w-full" />

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* PANEL IZQUIERDO */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
            <h3 className="text-[10px] font-black text-[#87CEEB] uppercase tracking-[0.2em] mb-4">Prompt_Task</h3>
            <p className="text-lg font-bold leading-tight text-slate-900 italic">
              Some people prefer to live in a small town, while others prefer a big city. Discuss both views and give your opinion.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl">
            <div className="flex items-center gap-2 text-[#87CEEB] mb-4">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Target_Level: {selectedLevel}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Escribe un texto coherente. GPT evaluará tu desempeño basándose estrictamente en los criterios del nivel {selectedLevel}.
            </p>
          </motion.div>
        </div>

        {/* EDITOR */}
        <div className="lg:col-span-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 uppercase text-[9px] font-black tracking-[0.2em]">
                    <FileText size={14} className="text-[#87CEEB]" /> Essay_Workspace.txt
                </div>
            </div>
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              className="w-full h-[550px] p-10 text-base leading-[2] text-slate-900 outline-none resize-none placeholder:text-slate-300 font-medium"
              placeholder="Start typing your essay..."
            />
          </motion.div>
        </div>
      </main>

      {/* MODAL DE RESULTADO EMERGENTE */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f172a]/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl relative border border-white/20"
            >
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} />
                </div>
                
                <div>
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Assessment_Results</h2>
                  <div className="text-7xl font-black text-[#87CEEB] italic">{result?.score}%</div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] text-left border border-slate-100">
                   <h4 className="text-[10px] font-black text-slate-900 uppercase mb-3 flex items-center gap-2">
                     <FileText size={12} className="text-[#87CEEB]" /> AI_Feedback
                   </h4>
                   <p className="text-sm text-slate-600 leading-relaxed font-medium">
                     {result?.feedback}
                   </p>
                </div>

                <button 
                  onClick={() => router.push("/modulos")}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#87CEEB] hover:text-slate-900 transition-all shadow-xl"
                >
                  Return_to_Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}