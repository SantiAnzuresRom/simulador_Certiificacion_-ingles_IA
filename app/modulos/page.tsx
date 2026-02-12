"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Headphones,
  Home,
  Mic2,
  PenTool,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cloneElement, useEffect, useState } from "react";
import { auth, db } from "../src/firebase/config";

export default function ModulosPage() {
  const [percentages, setPercentages] = useState({
    reading: 0,
    listening: 0,
    writing: 0,
    speaking: 0,
  });
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentLevel, setCurrentLevel] = useState("--");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const progressRef = doc(db, "user_progress", user.uid);

        const unsubSnap = onSnapshot(
          progressRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();

              // 1. Detectamos Nivel Actual para saber qué objeto leer
              const lvl = data.currentLevel || "A1";
              setCurrentLevel(lvl);

              // 2. Extraemos el progreso del objeto específico (Ej: modules_A1)
              // Usamos la nueva estructura que definiste
              const moduleKey = `modules_${lvl}`;
              const source = data[moduleKey] || {};

              const scores = {
                reading: source.reading || 0,
                listening: source.listening || 0,
                writing: source.writing || 0,
                speaking: source.speaking || 0,
              };

              setPercentages(scores);

              // 3. El PROGRESO GENERAL es el promedio de este nivel específico
              const average =
                (scores.reading +
                  scores.listening +
                  scores.writing +
                  scores.speaking) /
                4;
              setOverallProgress(Math.round(average));
            }
          },
          (error) => {
            console.error("Error en Sync de Firestore:", error);
          },
        );

        return () => unsubSnap();
      } else {
        setCurrentLevel("--");
      }
    });

    return () => unsubAuth();
  }, []);

  const modulos = [
    {
      id: "reading",
      title: "Reading",
      icon: <BookOpen size={32} />,
      path: "/modulos/reading",
      color: "from-sky-400 to-blue-600",
      accent: "text-sky-400",
      p: percentages.reading,
    },
    {
      id: "listening",
      title: "Listening",
      icon: <Headphones size={32} />,
      path: "/modulos/listening",
      color: "from-blue-500 to-indigo-600",
      accent: "text-blue-400",
      p: percentages.listening,
    },
    {
      id: "writing",
      title: "Writing",
      icon: <PenTool size={32} />,
      path: "/modulos/writing",
      color: "from-emerald-400 to-teal-600",
      accent: "text-emerald-400",
      p: percentages.writing,
    },
    {
      id: "speaking",
      title: "Speaking",
      icon: <Mic2 size={32} />,
      path: "/modulos/speaking",
      color: "from-orange-400 to-red-600",
      accent: "text-orange-400",
      p: percentages.speaking,
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 overflow-x-hidden selection:bg-sky-500/30 font-sans">
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
        body {
          scrollbar-width: none;
        }
      `}</style>

      {/* Luces de ambiente */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full" />
      </div>

      <main className="max-w-6xl mx-auto relative z-10">
        <header className="mb-20">
          <div className="flex justify-between items-center w-full mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl p-2">
                <Image src="/logo2.png" alt="Logo" width={32} height={32} />
              </div>
              <div className="h-10 w-[1px] bg-white/10 mx-2" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
                Certifica_AI / Training_Ground
              </h2>
            </motion.div>

            <Link
              href="/dashboard"
              className="group flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all backdrop-blur-xl"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white italic">
                Back_to_System
              </span>
              <Home
                size={18}
                className="text-slate-400 group-hover:text-white"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20"
              >
                Módulos
              </motion.h1>
              <div className="flex items-center gap-3 bg-sky-400/10 w-fit px-4 py-2 rounded-full border border-sky-400/20">
                <Zap size={14} className="text-sky-400 fill-sky-400" />
                <p className="text-sky-400 font-black uppercase text-[10px] tracking-[0.4em] italic">
                  Active_Learning_Protocol
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-1 italic">
                    Level_Mastery
                  </span>
                  <span className="text-6xl font-black italic text-white leading-none">
                    {overallProgress}%
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="h-12 w-[1px] bg-white/10" />
                  <div className="text-center min-w-[80px]">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1 italic">
                      Target
                    </p>
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-400 italic leading-none">
                      {currentLevel}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                />
              </div>
            </motion.div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modulos.map((m, index) => (
            <Link href={m.path} key={m.id} className="block group">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[3rem] p-10 transition-all duration-500 hover:border-white/20 group-hover:bg-slate-900/60 overflow-hidden"
              >
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-8">
                    <div
                      className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${m.color} flex items-center justify-center text-slate-950 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      {cloneElement(m.icon as any, { strokeWidth: 2.5 })}
                    </div>
                    <div>
                      <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-3 text-white">
                        {m.title}
                      </h2>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full animate-pulse ${m.accent.replace("text", "bg")}`}
                        />
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          {m.p}% COMPLETADO
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-slate-950 transition-all duration-500 shadow-inner">
                    <ChevronRight size={28} />
                  </div>
                </div>
                <div className="mt-10">
                  <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 italic">
                    <span>Phase_Progress</span>
                    <span className={m.accent}>{m.p}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.p}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${m.color}`}
                    />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
