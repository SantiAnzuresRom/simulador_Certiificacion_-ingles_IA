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
  BarChart3,
  Sparkles,
  Command,
  LayoutGrid
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
    grammar: 0,
  });
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentLevel, setCurrentLevel] = useState("--");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const progressRef = doc(db, "user_progress", user.uid);
        const unsubSnap = onSnapshot(progressRef, (snap) => {
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
              grammar: source.grammar || 0,
            };
            setPercentages(scores);
            const average = Object.values(scores).reduce((a, b) => (a as number) + (b as number), 0) / 5;
            setOverallProgress(Math.round(average as number));
            setLoading(false);
          }
        }, (error) => {
          console.error(error);
          setLoading(false);
        });
        return () => unsubSnap();
      } else {
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  const modulos = [
    { id: "reading", title: "Reading", icon: <BookOpen />, path: "/modulos/reading", color: "from-blue-500 to-indigo-500", p: percentages.reading },
    { id: "listening", title: "Listening", icon: <Headphones />, path: "/modulos/listening", color: "from-sky-400 to-blue-500", p: percentages.listening },
    { id: "grammar", title: "Grammar", icon: <Sparkles />, path: "/modulos/grammar", color: "from-violet-500 to-purple-600", p: percentages.grammar },
    { id: "writing", title: "Writing", icon: <PenTool />, path: "/modulos/writing", color: "from-emerald-400 to-teal-500", p: percentages.writing },
    { id: "speaking", title: "Speaking", icon: <Mic2 />, path: "/modulos/speaking", color: "from-rose-400 to-red-500", p: percentages.speaking },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-sans">
      <div className="relative w-24 h-24 mb-6">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 border-b-2 border-cyan-500 rounded-full" />
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-2 border-t-2 border-blue-500 rounded-full" />
      </div>
      <p className="text-cyan-400 font-medium text-[13px] tracking-[0.3em] animate-pulse italic">
        loading {currentLevel} environment
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050810] text-white selection:bg-white/20 font-sans pb-20">
      
      {/* Cinematic Background Lights */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      <main className="max-w-[1400px] mx-auto px-8 relative z-10">
        
        {/* Navigation - Ultra Minimal */}
        <nav className="flex justify-between items-center py-10 mb-16">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
            <div className="p-2.5 bg-white rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              <Image src="/logo2.png" alt="logo" width={22} height={22} />
            </div>
            <span className="text-[11px] font-bold tracking-[0.4em] text-white/40 ">CERTIFICA v3.0</span>
          </motion.div>

          <div className="flex gap-4">
            <Link href="/dashboard">
              <button className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/10 transition-all group">
                <span className="text-[10px] font-bold tracking-widest text-white/40 group-hover:text-white transition-colors">DASHBOARD</span>
                <Home size={18} className="text-white/60 group-hover:text-white transition-colors" />
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-medium tracking-tight mb-6"
          >
            Your <span className="text-white/40 italic">Skills</span>
          </motion.h1>
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-10">
            <p className="max-w-md text-white/40 text-lg leading-relaxed">
              Master every skill with our artificial intelligence. Your current progress reflects your real mastery level.
            </p>
            
            {/* Progress Pill */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 min-w-[320px] shadow-2xl"
            >
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-white/30 mb-1 ">Total Mastery</p>
                  <p className="text-5xl font-light">{overallProgress}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-500 mb-1 ">Current Level</p>
                  <p className="text-4xl font-bold tracking-tighter">{currentLevel}</p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-white/40 to-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulos.map((m, index) => (
            <Link href={m.path} key={m.id} className="group">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="relative h-[320px] bg-white/[0.02] border border-white/[0.08] rounded-[3rem] p-8 flex flex-col justify-between overflow-hidden transition-all duration-500 group-hover:bg-white/[0.06] group-hover:border-white/20 group-hover:-translate-y-2 shadow-xl"
              >
                {/* Abstract Icon Background */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700`} />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3`}>
                    {cloneElement(m.icon as any, { size: 28, strokeWidth: 1.8, className: "text-white" })}
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <ChevronRight size={18} />
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-3xl font-medium mb-6 transition-colors group-hover:text-white">
                    {m.title}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold tracking-widest text-white/30 ">
                      <span>Progress</span>
                      <span className="text-white/60">{m.p}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${m.p}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full bg-gradient-to-r ${m.color}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
          
          {/* Analytics Shortcut Card */}
          <Link href="/results" className="group lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="h-[320px] bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center shadow-[0_20px_40px_rgba(6,182,212,0.2)] transition-all hover:scale-[1.02]"
            >
              <BarChart3 size={48} className="mb-6 text-white/90" />
              <h3 className="text-2xl font-bold mb-2">Detailed Report</h3>
              <p className="text-white/70 text-sm">Analyze your strengths and weaknesses with our AI.</p>
            </motion.div>
          </Link>
        </div>

        {/* Bottom Detail */}
        <footer className="mt-24 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/[0.03] border border-white/5 mb-8">
            <Command size={14} className="text-white/40" />
            
          </div>
          <p className="text-[10px] text-white/20 tracking-[0.5em] italic">© 2026 Certifica AI . All rights reserved</p>
        </footer>
      </main>
    </div>
  );
}