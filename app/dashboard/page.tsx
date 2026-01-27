"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Activity, ChevronRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../src/firebase/config";

export default function DashboardPage() {
  const router = useRouter();

  const [level, setLevel] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedLevel") || "A1";
    }
    return "A1";
  });

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    uid: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};

      setUserData({
        name: data?.full_name || user.displayName || "USER_ALPHA",
        email: user.email || "",
        uid: user.uid,
      });
    });
    return () => unsub();
  }, [router]);

  const handleLevelSelect = (lvl: string) => {
    setLevel(lvl);
    localStorage.setItem("selectedLevel", lvl);
    setTimeout(() => router.push("/modulos"), 300);
  };

  const history = [
    { lvl: "A1", progress: 100, color: "#10b981" },
    { lvl: "A2", progress: 65, color: "#87CEEB" },
    { lvl: "B1", progress: 35, color: "#64748b" },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 pb-24 selection:bg-[#87CEEB]">
      
      {/* ================= HEADER ================= */}
      <header className="relative bg-[#0f172a] text-white pt-20 pb-32 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#87CEEB] to-transparent opacity-40" />

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* USER INFO */}
          <div className="flex items-center gap-6 group">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-[#87CEEB] shadow-2xl">
                <span className="text-2xl font-black">{userData.name.charAt(0)}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#87CEEB]">Usuario Activo</span>
                <Activity size={10} className="animate-pulse text-[#87CEEB]" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white/90">
                {userData.name}
              </h2>
              <p className="text-slate-500 text-xs font-medium">{userData.email}</p>
            </div>
          </div>

          {/* STATUS COMPACTO */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl w-full md:w-64">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current_Rank</span>
              <span className="text-lg font-black italic text-[#87CEEB]">{level}</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                className="h-full bg-[#87CEEB] shadow-[0_0_10px_#87CEEB]" 
              />
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-8 -mt-16 relative z-10">
        
        {/* NIVEL SELECTION */}
        <section className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200/50 mb-10">
          <div className="flex justify-between items-center mb-8 px-2">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                Mission_Selection
              </h3>
              <p className="text-2xl font-bold text-slate-800">Selecciona tu nivel de entrenamiento</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <Zap size={20} className="text-[#87CEEB]" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => {
              const active = level === lvl;
              return (
                <motion.button
                  key={lvl}
                  onClick={() => handleLevelSelect(lvl)}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden h-20 rounded-xl border transition-all duration-300
                    ${active 
                      ? "bg-slate-900 border-slate-900 shadow-xl" 
                      : "bg-white border-slate-100 hover:border-[#87CEEB]/50"}`}
                >
                  {active && (
                    <motion.div 
                      layoutId="glow"
                      className="absolute inset-0 bg-gradient-to-tr from-[#87CEEB]/20 to-transparent" 
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full">
                    <span className={`text-[8px] font-black uppercase tracking-tighter mb-1 
                      ${active ? "text-[#87CEEB]" : "text-slate-400"}`}>Rank</span>
                    <span className={`text-2xl font-black italic 
                      ${active ? "text-white" : "text-slate-700"}`}>{lvl}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* BOTTOM CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8">
            <button 
              onClick={() => router.push("/modulos")}
              className="group w-full bg-slate-900 hover:bg-slate-800 text-white p-6 rounded-2xl flex items-center justify-between transition-all shadow-xl h-fit"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-lg group-hover:bg-[#87CEEB] group-hover:text-slate-900 transition-colors">
                  <ChevronRight size={20} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold">Continuar con el último módulo</p>
                </div>
              </div>
            </button>
          </div>

          {/* HISTORY COMPACTO CON TÍTULO */}
          <section className="lg:col-span-4 space-y-4">
            <div className="px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
                Training_History
              </h3>
              <p className="text-sm font-bold text-slate-600">Historial de prácticas</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {history.map((item, i) => (
                <motion.div
                  key={item.lvl}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-[#87CEEB]/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center font-black text-slate-400 text-sm border border-slate-100">
                    {item.lvl}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Progress</span>
                      <span className="text-[10px] font-black">{item.progress}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-50 rounded-full">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${item.progress}%`, backgroundColor: item.color }} 
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
