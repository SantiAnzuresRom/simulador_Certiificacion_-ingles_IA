"use client";

import { ArrowLeft, BookOpen, CheckCircle2, Clock, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProfessionalReadingPage() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      
      {/* HEADER TÉCNICO */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/modulos" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#87CEEB]">Certification Prep</span>
            <h1 className="text-sm font-bold flex items-center gap-2">
              <BookOpen size={16} className="text-slate-400" />
              Module 01: Academic Reading
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <Clock size={14} className="text-slate-400" />
            <span className="text-xs font-mono font-bold">18:45</span>
          </div>
          <button className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all">
            Finish Section
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[calc(100-73px)]">
        
        {/* COLUMNA IZQUIERDA: MATERIAL DE LECTURA */}
        <section className="p-8 lg:p-12 bg-white lg:border-r border-slate-200 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6 text-slate-400">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase">Passage 1 of 3</span>
            </div>
            
            <h2 className="text-2xl font-bold mb-8 text-slate-800 leading-tight">
              The Evolution of Sustainable Architecture in Urban Environments
            </h2>

            <article className="prose prose-slate prose-sm text-slate-600 leading-[1.8] space-y-6">
              <p>
                As urban populations continue to surge, the architectural landscape is undergoing a 
                paradigm shift. Sustainable architecture, once a niche consideration, has become 
                the cornerstone of modern urban planning. This evolution is driven by both 
                environmental necessity and technological advancement.
              </p>
              <div className="p-6 bg-slate-50 border-l-4 border-[#87CEEB] rounded-r-xl my-8">
                <p className="italic text-slate-500 font-medium">
                  The integration of biophilic design elements has proven to reduce energy consumption 
                  by up to 30% in high-density residential complexes.
                </p>
              </div>
              <p>
                Innovative materials such as cross-laminated timber (CLT) and smart glass are 
                replacing traditional carbon-heavy concrete and steel. These materials not only 
                lower the carbon footprint of construction but also improve the thermal efficiency 
                of buildings, leading to a significant reduction in long-term operational costs.
              </p>
            </article>
          </div>
        </section>

        {/* COLUMNA DERECHA: EVALUACIÓN */}
        <section className="p-8 lg:p-12 bg-[#F8FAFC]">
          <div className="max-w-xl mx-auto">
            <div className="mb-10">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Question 1</h3>
              <p className="text-lg font-semibold text-slate-800">
                According to the passage, what is the primary driver behind the evolution of sustainable architecture?
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Strictly political mandates and government regulations.",
                "Environmental necessity combined with technological progress.",
                "A decrease in urban population growth rates.",
                "The lower initial cost of smart glass over traditional materials."
              ].map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full group flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 text-left
                    ${selectedAnswer === index 
                      ? "bg-white border-[#87CEEB] shadow-md ring-1 ring-[#87CEEB]" 
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"}`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors
                    ${selectedAnswer === index ? "bg-[#87CEEB] border-[#87CEEB]" : "bg-slate-50 border-slate-300 group-hover:border-slate-400"}`}>
                    {selectedAnswer === index && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <span className={`text-sm font-medium ${selectedAnswer === index ? "text-slate-900" : "text-slate-600"}`}>
                    {option}
                  </span>
                </button>
              ))}
            </div>

            <footer className="mt-12 pt-8 border-t border-slate-200 flex justify-between">
              <button className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                Skip Question
              </button>
              <button className="px-8 py-3 bg-[#87CEEB] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#87CEEB]/30 hover:-translate-y-1 transition-all">
                Save & Continue
              </button>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}