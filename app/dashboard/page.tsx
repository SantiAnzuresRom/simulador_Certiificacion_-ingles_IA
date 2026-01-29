"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Award, BarChart3, Target, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../src/firebase/config";

export default function DashboardPage() {
  const router = useRouter();
  const [level, setLevel] = useState<string>("A1");
  const [userData, setUserData] = useState({ name: "", email: "", uid: "" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.exists() ? userSnap.data() : {};

      setUserData({
        name: data?.full_name || user.displayName || "STUDENT_ALPHA",
        email: user.email || "",
        uid: user.uid,
      });

      const progressRef = doc(db, "user_progress", user.uid);
      const progressSnap = await getDoc(progressRef);
      if (progressSnap.exists()) {
        setLevel(progressSnap.data().currentLevel);
      }
    });
    return () => unsub();
  }, [router]);

  const handleLevelSelect = async (lvl: string) => {
    if (!userData.uid) return;
    setLevel(lvl);
    try {
      const progressRef = doc(db, "user_progress", userData.uid);
      await setDoc(progressRef, {
        currentLevel: lvl,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // Navegación directa a módulos
      router.push("/modulos");
    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  // Historial General por Nivel (Como solicitaste)
  const levelHistory = [
    { lvl: "A1", progress: 95, color: "bg-cyan-500" },
    { lvl: "A2", progress: 60, color: "bg-blue-500" },
    { lvl: "B1", progress: 25, color: "bg-purple-500" },
    { lvl: "B2", progress: 0, color: "bg-slate-700" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30">
      {/* BACKGROUND DECOR (LA X GIGANTE) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px]">
          <Image src="/logo2.png" alt="X" width={600} height={600} className="brightness-50" />
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative w-20 h-20 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
                <span className="text-3xl font-black text-white italic">{userData.name.charAt(0)}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500">System_Online</span>
              </div>
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{userData.name}</h1>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl backdrop-blur-xl">
            <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Nivel_Actual</p>
            <p className="text-2xl font-black text-cyan-400 italic">{level}</p>
          </div>
        </header>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SELECCIÓN DE NIVEL (ESTILO CON LOGO) */}
          <section className="lg:col-span-8">
            <div className="bg-[#070c1b]/80 border border-white/5 rounded-[40px] p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <Target className="text-cyan-500" size={20} />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Missions_Selection</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleLevelSelect(lvl)}
                    className={`relative overflow-hidden h-40 rounded-[32px] border-2 transition-all duration-500 group
                      ${level === lvl 
                        ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.15)]" 
                        : "border-white/5 bg-slate-900/40 hover:border-white/20 hover:scale-[1.02]"}`}
                  >
                    {/* El logo que te gustaba en el hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity">
                      <Image src="/logo2.png" alt="X" layout="fill" objectFit="cover" className="grayscale" />
                    </div>
                    
                    <span className={`relative text-5xl font-black italic ${level === lvl ? "text-white" : "text-slate-700 group-hover:text-slate-500"}`}>
                      {lvl}
                    </span>

                    {level === lvl && (
                      <div className="absolute bottom-4 right-5">
                        <Zap size={20} className="text-cyan-400 animate-pulse" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* BARRA LATERAL (HISTORIAL POR NIVEL) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#0f172a]/50 border border-white/5 rounded-[40px] p-8 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="text-cyan-500" size={18} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Global_Progress</h3>
              </div>
              
              <div className="space-y-6">
                {levelHistory.map((item) => (
                  <div key={item.lvl} className="p-5 bg-black/20 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <Award size={14} className="text-slate-500" />
                        <p className="text-xs font-black text-white italic">Nivel {item.lvl}</p>
                      </div>
                      <span className="text-[10px] font-black text-cyan-500">{item.progress}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${item.progress}%` }} 
                        className={`h-full ${item.color}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-cyan-500/10 border border-cyan-500/20 rounded-[40px] relative overflow-hidden group">
               <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">X-Learning Status</p>
               <h4 className="text-xl font-black text-white italic uppercase tracking-tight leading-tight">Tu progreso es asertivo y proactivo.</h4>
               <p className="text-[8px] text-slate-500 mt-4 uppercase tracking-[0.2em]">Selecciona un rango para desplegar submisiones.</p>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
