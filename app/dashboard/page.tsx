"use client";

import { motion } from "framer-motion";
import { BarChart3, GraduationCap, Mail, Phone, PlayCircle, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const [level, setLevel] = useState("A1");

  // Simulación de datos de usuario (luego los traes de tu DB)
  const user = {
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    phone: "+52 555 123 4567"
  };

  // Simulación de historial por nivel
  const history = [
    { lvl: "A1", progress: 100, color: "#87CEEB" },
    { lvl: "A2", progress: 75, color: "#6eb5d1" },
    { lvl: "B1", progress: 40, color: "#94a3b8" },
  ];

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-950 pb-20">
      {/* Fondo decorativo coherente */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] rounded-full bg-[#87CEEB]/10 blur-[120px] -z-10" />
      
      {/* 1. TOP BAR / USER INFO */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#87CEEB] to-blue-400 flex items-center justify-center text-white shadow-md">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-sm font-bold">{user.name}</h2>
              <div className="flex gap-4 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                <span className="flex items-center gap-1"><Phone size={12} /> {user.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <GraduationCap size={16} className="text-[#87CEEB]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Nivel Actual: {level}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-10 space-y-10">
        
        {/* 2. SELECTOR DE NIVEL PARA SIMULACIÓN */}
        <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-50 text-center">
          <h3 className="text-lg font-bold mb-2">Simulador de Certificación</h3>
          <p className="text-slate-500 text-xs mb-6">Selecciona el nivel que deseas practicar hoy</p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`w-14 h-14 rounded-2xl text-xs font-bold transition-all border-2 
                  ${level === lvl 
                    ? "bg-[#87CEEB] border-[#87CEEB] text-white shadow-lg shadow-[#87CEEB]/40 scale-110" 
                    : "bg-white border-slate-100 text-slate-400 hover:border-[#87CEEB]/30"}`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <Link href="/modulos">
            <button className="px-10 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 mx-auto hover:bg-slate-800 transition-all hover:shadow-[0_10px_20px_-5px_rgba(135,206,235,0.6)] active:scale-95">
              <PlayCircle size={18} />
              VAMOS A PRACTICAR
            </button>
          </Link>
        </section>

        {/* 3. HISTORIAL DE PROGRESO POR NIVEL */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-[#87CEEB]" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Historial de Progreso</h3>
          </div>
          
          <div className="grid gap-4">
            {history.map((item) => (
              <div key={item.lvl} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700">Nivel {item.lvl}</span>
                  <span className="text-[10px] font-bold text-[#87CEEB]">{item.progress}% Completado</span>
                </div>
                {/* Barra de Progreso */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
