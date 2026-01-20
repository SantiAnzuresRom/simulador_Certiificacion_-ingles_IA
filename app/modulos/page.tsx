"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Headphones, Mic2, PenTool, Trophy } from "lucide-react";
import Link from "next/link";

export default function ModulosPage() {
  // Simulación de progreso por módulo
  const modules = [
    {
      id: "reading",
      title: "Reading",
      description: "Mejora tu comprensión lectora y vocabulario.",
      icon: <BookOpen size={32} />,
      progress: 75,
      color: "#87CEEB",
      path: "/modulos/reading"
    },
    {
      id: "listening",
      title: "Listening",
      description: "Entrena tu oído con ejercicios de audio nativo.",
      icon: <Headphones size={32} />,
      progress: 45,
      color: "#6eb5d1",
      path: "/modulos/listening"
    },
    {
      id: "writing",
      title: "Writing",
      description: "Practica gramática y redacción de textos.",
      icon: <PenTool size={32} />,
      progress: 30,
      color: "#94a3b8",
      path: "/modulos/writing"
    },
    {
      id: "speaking",
      title: "Speaking",
      description: "Perfecciona tu pronunciación y fluidez.",
      icon: <Mic2 size={32} />,
      progress: 10,
      color: "#1e293b",
      path: "/modulos/speaking"
    }
  ];

  const totalProgress = 40; // Ejemplo de promedio general

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-950 pb-20">
      {/* Luces de fondo coherentes con el resto de la app */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#87CEEB]/10 blur-[120px] -z-10" />

      {/* HEADER DE MÓDULOS */}
      <div className="bg-white border-b border-slate-100 px-6 py-8 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-[#87CEEB] transition-colors uppercase tracking-widest mb-4"
          >
            <ArrowLeft size={14} /> Volver al Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Módulos de Práctica</h1>
              <p className="text-slate-500 text-xs mt-1">Nivel Seleccionado: <span className="text-[#87CEEB] font-bold">A1</span></p>
            </div>

            {/* BARRA DE PROGRESO GLOBAL DEL NIVEL */}
            <div className="w-full md:w-72 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                <span>Progreso del Nivel</span>
                <span className="text-slate-900">{totalProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${totalProgress}%` }}
                  className="h-full bg-gradient-to-r from-[#87CEEB] to-blue-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE MÓDULOS (CARDS) */}
      <main className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod, index) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={mod.path} className="group block">
                <div className="relative h-full bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-blue-900/5 transition-all 
                                hover:border-[#87CEEB] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(135,206,235,0.3)]">
                  
                  {/* ICONO CON CÍRCULO DE FONDO */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 mb-6 group-hover:bg-[#87CEEB] group-hover:text-white transition-colors">
                    {mod.icon}
                  </div>

                  <h3 className="text-lg font-bold mb-2">{mod.title}</h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed mb-8">
                    {mod.description}
                  </p>

                  {/* BARRA DE PROGRESO INDIVIDUAL (Lo que pediste si el usuario se sale) */}
                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Completado</span>
                      <span className="text-[10px] font-bold text-slate-900">{mod.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${mod.progress}%`, backgroundColor: mod.color }}
                      />
                    </div>
                  </div>

                  {/* INDICADOR VISUAL DE ESTADO */}
                  {mod.progress === 100 && (
                    <div className="absolute top-6 right-6 text-yellow-500">
                      <Trophy size={20} />
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}