"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Headphones, Mic2, PenTool, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../src/firebase/config";

export default function ModulosPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedLevel") || "A1";
    }
    return "A1";
  });

  const [userName, setUserName] = useState<string | null>(null);
  
  // ESTADO PARA PROGRESO REAL DESDE FIREBASE
  const [progressData, setProgressData] = useState({
    reading: 0,
    listening: 0,
    writing: 0,
    speaking: 0,
  });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // 1. Obtener nombre del usuario
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserName(userSnap.data().nombre);
      }

      // 2. Escuchar progreso en tiempo real (según el nivel seleccionado)
      const progressRef = doc(db, "user_progress", user.uid, "levels", selectedLevel);
      const unsubProgress = onSnapshot(progressRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProgressData({
            reading: data.reading || 0,
            listening: data.listening || 0,
            writing: data.writing || 0,
            speaking: data.speaking || 0,
          });
        }
      });

      return () => unsubProgress();
    });

    return () => unsubAuth();
  }, [selectedLevel]);

  // Cálculo del progreso general basado en datos reales
  const generalProgress = Math.round(
    (progressData.reading + progressData.listening + progressData.writing + progressData.speaking) / 4
  );

  const modules = [
    { id: "reading", title: "Reading", icon: <BookOpen size={28} />, progress: progressData.reading, color: "#10b981" },
    { id: "listening", title: "Listening", icon: <Headphones size={28} />, progress: progressData.listening, color: "#87CEEB" },
    { id: "writing", title: "Writing", icon: <PenTool size={28} />, progress: progressData.writing, color: "#64748b" },
    { id: "speaking", title: "Speaking", icon: <Mic2 size={28} />, progress: progressData.speaking, color: "#0f172a" }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      {/* HEADER */}
      <div className="bg-slate-900 text-white pt-16 pb-24 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">

          {/* USER BADGE */}
          {userName && (
            <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-3 shadow-lg">
              <div className="w-8 h-8 rounded-full bg-[#87CEEB] text-slate-900 flex items-center justify-center text-xs font-black uppercase">
                {userName.charAt(0)}
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-white">
                {userName}
              </span>
            </div>
          )}

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[10px] font-black text-[#87CEEB] uppercase tracking-widest mb-8 hover:text-white transition-all"
          >
            <ArrowLeft size={16} /> Volver al Dashboard
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Zap size={24} className="text-[#87CEEB] fill-[#87CEEB]" />
                <h1 className="text-4xl font-black italic uppercase">
                  Módulos de Práctica
                </h1>
              </div>

              <p className="text-slate-400 text-sm">
                Nivel Seleccionado:{" "}
                <span className="text-[#87CEEB] font-black px-2 py-0.5 bg-white/10 rounded-md">
                  {selectedLevel}
                </span>
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] w-full md:w-80 shadow-2xl">
              <div className="flex justify-between text-[10px] font-black uppercase mb-3 text-slate-400">
                <span>Progreso General</span>
                <span className="text-[#87CEEB]">{generalProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#87CEEB] transition-all duration-700" 
                  style={{ width: `${generalProgress}%`, boxShadow: "0 0 15px #87CEEB" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-8 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl group hover:border-[#87CEEB] transition-all relative"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 mb-8 group-hover:bg-slate-900 group-hover:text-[#87CEEB] transition-all">
                {mod.icon}
              </div>

              <h3 className="text-lg font-black tracking-tight mb-4">
                {mod.title}
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-end text-[10px] font-black text-slate-400 uppercase">
                  <span>Progreso</span>
                  <span className="text-slate-900">{mod.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${mod.progress}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: mod.color }}
                  />
                </div>
              </div>

              <button 
                onClick={() => router.push(`/modulos/${mod.id}`)}
                className="w-full mt-8 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all"
              >
                Entrar al Módulo
              </button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}