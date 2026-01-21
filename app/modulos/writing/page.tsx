"use client";

import { ArrowLeft, FileText, Info, PenTool } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProfessionalWritingPage() {
  const [text, setText] = useState("");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/modulos" className="p-2 text-slate-400 hover:text-slate-900"><ArrowLeft size={20} /></Link>
          <h1 className="text-sm font-bold flex items-center gap-2"><PenTool size={16} className="text-[#87CEEB]" /> Writing Assessment</h1>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"><span className="text-slate-400">WORDS:</span> {wordCount}/150</div>
          <button className="px-6 py-2 bg-[#87CEEB] text-white text-xs font-bold rounded-lg shadow-lg shadow-[#87CEEB]/20">SUBMIT ESSAY</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-[#87CEEB] uppercase tracking-widest mb-4">Prompt</h3>
            <p className="text-sm font-semibold leading-relaxed text-slate-800">Some people prefer to live in a small town, while others prefer a big city. Discuss both views and give your opinion.</p>
          </div>
          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
            <div className="flex items-center gap-2 text-blue-600 mb-2"><Info size={14} /><span className="text-[10px] font-bold uppercase">Instructions</span></div>
            <p className="text-[11px] text-blue-700/70 leading-relaxed">Ensure your response is well-organized with an introduction, body paragraphs, and a conclusion. Use transition words effectively.</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-[0.2em]"><FileText size={12} /> Essay Editor</div>
            <textarea 
              value={text} onChange={(e) => setText(e.target.value)}
              className="w-full h-[500px] p-8 text-sm leading-[1.8] text-slate-700 outline-none resize-none placeholder:text-slate-300"
              placeholder="Start writing your essay here..."
            />
          </div>
        </div>
      </main>
    </div>
  );
}