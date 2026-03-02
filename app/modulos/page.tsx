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
  Target,
  BarChart3
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cloneElement, useEffect, useState } from "react";
import { auth, db } from "../src/firebase/config";

export default function ModulosPage() {
  const [loading, setLoading] = useState(true);
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
              const lvl = data.currentLevel || "A1";
              setCurrentLevel(lvl);

              const moduleKey = `modules_${lvl}`;
              const source = data[moduleKey] || {};

              const scores = {
                reading: source.reading || 0,
                listening: source.listening || 0,
                writing: source.writing || 0,
                speaking: source.speaking || 0,
              };

              setPercentages(scores);

              const average =
                (scores.reading +
                  scores.listening +
                  scores.writing +
                  scores.speaking) /
                4;
              setOverallProgress(Math.round(average));
              setLoading(false);
            }
          },
          (error) => {
            console.error("error en sync de firestore:", error);
            setLoading(false);
          },
        );

        return () => unsubSnap();
      } else {
        setCurrentLevel("--");
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const modulos = [
    {
      id: "reading",
      title: "Reading",
      icon: <BookOpen size={24} />,
      path: "/modulos/reading",
      color: "from-sky-400 to-blue-600",
      accent: "text-sky-400",
      p: percentages.reading,
    },
    {
      id: "listening",
      title: "Listening",
      icon: <Headphones size={24} />,
      path: "/modulos/listening",
      color: "from-blue-500 to-indigo-600",
      accent: "text-blue-400",
      p: percentages.listening,
    },
    {
      id: "writing",
      title: "Writing",
      icon: <PenTool size={24} />,
      path: "/modulos/writing",
      color: "from-emerald-400 to-teal-600",
      accent: "text-emerald-400",
      p: percentages.writing,
    },
    {
      id: "speaking",
      title: "Speaking",
      icon: <Mic2 size={24} />,
      path: "/modulos/speaking",
      color: "from-orange-400 to-red-600",
      accent: "text-orange-400",
      p: percentages.speaking,
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-sans">
        <div className="relative w-24 h-24 mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-0 border-b-2 border-cyan-500 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-2 border-t-2 border-blue-500 rounded-full"
          />
        </div>
        <p className="text-cyan-400 font-medium text-[13px] tracking-[0.3em] animate-pulse italic">
          cargando entorno de {currentLevel}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 overflow-x-hidden selection:bg-cyan-500/30 font-sans">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { scrollbar-width: none; }
      `}</style>

      {/* luces de ambiente sutiles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sky-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto relative z-10">
        <header className="mb-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-6 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-2xl p-2 transition-all hover:rotate-6">
                <Image src="/logo2.png" alt="logo" width={28} height={28} />
              </div>
              <div className="h-6 w-[1px] bg-white/10" />
              <h2 className="text-[12px] font-medium text-slate-500 italic tracking-[0.1em]">
                certifica_ai / training_ground
              </h2>
            </motion.div>

            <div className="flex items-center gap-3">
              <Link href="/results">
                <motion.button
                  whileHover={{ y: -2 }}
                  className="group flex items-center gap-3 px-5 py-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 backdrop-blur-md transition-all hover:bg-cyan-500/10"
                >
                  <span className="text-[12px] font-medium text-cyan-400 group-hover:text-cyan-300 italic tracking-wide">
                    Ver resultados
                  </span>
                  <BarChart3 size={16} className="text-cyan-400" />
                </motion.button>
              </Link>

              <Link href="/dashboard">
                <motion.button
                  whileHover={{ y: -2 }}
                  className="group flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md transition-all hover:bg-white/10"
                >
                  <span className="text-[12px] font-medium text-slate-400 group-hover:text-white italic tracking-wide">
                    Dashboard de niveles
                  </span>
                  <Home size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                </motion.button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-end justify-between gap-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <p className="text-cyan-400/80 font-medium text-[12px] tracking-[0.2em] italic">
                  Protocolo de aprendizaje activo
                </p>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl md:text-[100px] font-light italic tracking-tighter leading-[0.9] mb-4 text-slate-100"
              >
                Módulos
              </motion.h1>
              <p className="text-slate-500 font-medium tracking-wide text-sm italic opacity-80">
                Selecciona tu fase de entrenamiento para continuar
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full lg:w-auto min-w-[380px] bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[32px] border border-white/10 shadow-2xl group hover:border-cyan-500/20 transition-all duration-500"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block mb-2 italic tracking-widest">
                    mastery_level
                  </span>
                  <span className="text-6xl font-light italic text-white leading-none">
                    {overallProgress}%
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-medium text-slate-500 tracking-widest mb-2 italic">
                    target
                  </p>
                  <p className="text-5xl font-bold text-cyan-400 italic leading-none">
                    {currentLevel}
                  </p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                />
              </div>
            </motion.div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {modulos.map((m, index) => (
            <Link href={m.path} key={m.id} className="block group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-slate-900/20 backdrop-blur-sm border border-white/5 rounded-[40px] p-8 md:p-10 transition-all duration-500 hover:border-white/20 group-hover:bg-slate-900/40 overflow-hidden group-hover:shadow-2xl"
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-slate-950 shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      {cloneElement(m.icon as any, { strokeWidth: 1.5 })}
                    </div>
                    <div>
                      <h2 className="text-3xl font-light italic text-white mb-2 tracking-tight transition-colors group-hover:text-cyan-400">
                        {m.title}
                      </h2>
                      <p className="text-[13px] text-slate-500 italic font-medium">
                        Fase de entrenamiento 0{index + 1}
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center transition-all group-hover:bg-white group-hover:text-slate-950">
                    <ChevronRight size={20} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-[11px] font-medium text-slate-500 italic tracking-widest">Progreso</span>
                    <span className={`text-sm font-bold italic ${m.accent}`}>{m.p}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.p}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-full bg-gradient-to-r ${m.color}`}
                    />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-medium text-slate-600 tracking-[0.4em] italic uppercase">ai core engine v3.0 // 2026</p>
      </footer>
    </div>
  );
}