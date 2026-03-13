"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  BarChart3,
  User as UserIcon,
  LogOut,
  Activity,
  ChevronRight,
  LayoutGrid,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../src/firebase/config";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [level, setLevel] = useState<string>("A1");
  const [userData, setUserData] = useState({ fullName: "", email: "", uid: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 });

  const globalProgress = Math.round(Object.values(stats).reduce((a, b) => a + b, 0) / 6);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    let unsubSnap: () => void;
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.replace("/login"); return; }
      let nameFound = user.displayName || "Agente";
      let roleFound = "student";
      const userRef = doc(db, "users", user.uid);
      const progressRef = doc(db, "user_progress", user.uid);

      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const d = userSnap.data();
          nameFound = d.nombre || d.full_name || d.fullName || nameFound;
          roleFound = d.role || "student";
        }
        unsubSnap = onSnapshot(progressRef, (docSnap) => {
          if (docSnap.exists()) {
            const pData = docSnap.data();
            setUserData({ fullName: nameFound, email: user.email || "", uid: user.uid, role: roleFound });
            setLevel(pData.currentLevel || "A1");
            const calc = (m: any) => m ? Math.round((m.reading + m.listening + m.writing + m.speaking) / 4) : 0;
            setStats({
              A1: calc(pData.modules_A1), A2: calc(pData.modules_A2), B1: calc(pData.modules_B1),
              B2: calc(pData.modules_B2), C1: calc(pData.modules_C1), C2: calc(pData.modules_C2),
            });
          } else {
            setUserData({ fullName: nameFound, email: user.email || "", uid: user.uid, role: roleFound });
          }
          setLoading(false);
        });
      } catch (err) { setLoading(false); }
    });
    return () => { unsubAuth(); if (unsubSnap) unsubSnap(); };
  }, [router]);

  const handleLevelSelect = async (lvl: string) => {
    if (!userData.uid) return;
    try {
      await setDoc(doc(db, "user_progress", userData.uid), {
        currentLevel: lvl, updatedAt: new Date().toISOString(),
      }, { merge: true });
      setLevel(lvl);
      router.push("/modulos");
    } catch (error) { console.error(error); }
  };

  const levelHistory = [
    { lvl: "A1", progress: stats.A1, color: "from-cyan-400 to-blue-500" },
    { lvl: "A2", progress: stats.A2, color: "from-blue-500 to-indigo-500" },
    { lvl: "B1", progress: stats.B1, color: "from-indigo-500 to-purple-500" },
    { lvl: "B2", progress: stats.B2, color: "from-slate-400 to-slate-200" },
    { lvl: "C1", progress: stats.C1, color: "from-purple-600 to-pink-600" },
    { lvl: "C2", progress: stats.C2, color: "from-amber-400 to-orange-600" },
  ];

  // --- NUEVA PANTALLA DE CARGA BASADA EN TU IMAGEN ---
  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05)_0%,transparent_50%)]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative w-32 h-32 mb-8">
          {/* Esfera de cristal con aura */}
          <div className="absolute inset-0 bg-cyan-500/20 blur-[40px] rounded-full animate-pulse" />
          <div className="absolute inset-2 border border-cyan-500/30 rounded-full backdrop-blur-sm bg-gradient-to-b from-white/10 to-transparent" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-r-2 border-cyan-500/40 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <Image src="/logo.png" alt="Logo" width={60} height={20} className="brightness-150 animate-pulse" />
          </div>
        </div>
        <span className="text-[10px] font-black text-cyan-500 tracking-[0.5em] uppercase italic animate-pulse">
          Synchronizing_System
        </span>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30 pb-20 overflow-x-hidden">
      
      {/* --- BG EFFECTS --- */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] animate-pulse" />
      </div>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 pt-6">
        
        {/* --- NAV MINIMALISTA --- */}
        <nav className="flex justify-between items-center mb-10 px-8 py-4 bg-white/[0.02] backdrop-blur-3xl rounded-3xl border border-white/[0.05]">
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={100} height={28} className="brightness-125" />
          </Link>
          <div className="flex items-center gap-3">
            {userData.role === "admin" && (
              <button onClick={() => router.push("/Adashboard")} className="text-[9px] font-black text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-xl bg-cyan-500/5 tracking-widest italic uppercase">
                Admin
              </button>
            )}
            <button onClick={handleLogout} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </nav>

        {/* --- HERO UNIFICADO (DASHBOARD CORE) --- */}
        <section className="mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 md:p-12 bg-gradient-to-br from-slate-900/50 via-slate-900/80 to-[#020617] border border-white/[0.08] rounded-[4rem] shadow-2xl relative overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
              <div className="flex items-center gap-6 max-w-full lg:max-w-3xl min-w-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                  <UserIcon size={28} className="text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-black text-cyan-500 tracking-[0.4em] italic mb-1.5 block uppercase">System Agent</span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black text-white italic tracking-tight leading-[1.1] break-words md:whitespace-nowrap overflow-hidden text-ellipsis transition-all">
                    {userData.fullName || "User_X"}
                  </h1>
                  <p className="text-[10px] text-slate-500 font-bold tracking-wider mt-1 opacity-60 truncate">{userData.email}</p>
                </div>
              </div>

              <div className="bg-[#020617]/50 px-8 py-5 rounded-[2.2rem] border border-white/5 text-center min-w-[140px] backdrop-blur-md shrink-0">
                <p className="text-[8px] font-black text-slate-500 tracking-[0.3em] uppercase mb-1">Target</p>
                <span className="text-5xl font-black text-white italic drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">{level}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10 border-t border-white/5">
              <div className="flex flex-col justify-center">
                <div className="flex justify-between items-end mb-3 px-1">
                  <span className="text-[10px] font-black text-cyan-500/60 tracking-widest italic uppercase">Overall_Sync</span>
                  <span className="text-2xl font-black text-white italic">{globalProgress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${globalProgress}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  />
                </div>
              </div>

              <button 
                onClick={() => router.push("/results")}
                className="group relative h-20 bg-cyan-500 rounded-3xl flex items-center justify-between px-8 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-900/40 overflow-hidden"
              >
                <div className="relative z-10 text-left">
                  <p className="text-[8px] font-black text-white/60 tracking-widest uppercase">Analysis</p>
                  <h4 className="text-lg font-black text-white italic leading-none">Recommendations</h4>
                </div>
                <ChevronRight className="text-white group-hover:translate-x-1 transition-transform" />
                <div className="absolute top-0 right-0 w-24 h-full bg-white/10 skew-x-[20deg] translate-x-12 group-hover:translate-x-8 transition-transform" />
              </button>

              <div className="hidden lg:flex items-center gap-4 px-8 border-l border-white/5">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Activity size={18} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-600 tracking-widest uppercase">Activity</p>
                  <p className="text-xs font-bold text-slate-400">System: Operational</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- GRID DE CONTENIDO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="lg:col-span-8 bg-white/[0.01] border border-white/[0.05] rounded-[3.5rem] p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-cyan-500/10 rounded-xl">
                <LayoutGrid size={18} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-black text-white italic tracking-tight uppercase">Levels</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleLevelSelect(lvl)}
                  className={`group relative h-40 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center justify-center overflow-hidden
                    ${level === lvl ? "border-cyan-500 bg-cyan-500/10 shadow-xl shadow-cyan-500/5" : "border-white/5 bg-slate-900/40 hover:border-white/20"}`}
                >
                  <span className={`text-5xl font-black italic transition-all ${level === lvl ? "text-white scale-110" : "text-slate-800"}`}>
                    {lvl}
                  </span>
                  <div className={`mt-3 px-4 py-1 rounded-full text-[8px] font-black tracking-widest uppercase
                    ${level === lvl ? "bg-cyan-500 text-[#020617]" : "bg-white/5 text-slate-600 opacity-0 group-hover:opacity-100"}`}>
                    {level === lvl ? "Selected" : "SYNC"}
                  </div>
                  {level === lvl && <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="bg-[#0a0f1e]/60 border border-white/[0.08] rounded-[3.5rem] p-10 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-8 text-slate-500">
                <BarChart3 size={16} />
                <h3 className="text-[9px] font-black tracking-[0.4em] italic uppercase">Progression</h3>
              </div>

              <div className="space-y-6">
                {levelHistory.map((item) => (
                  <div key={item.lvl} className="group/bar">
                    <div className="flex justify-between items-end mb-2 px-1">
                      <span className={`text-[10px] font-black italic ${level === item.lvl ? "text-cyan-400" : "text-slate-600"}`}>
                        LVL_{item.lvl}
                      </span>
                      <span className="text-[9px] font-black text-white/20 group-hover/bar:text-white/50 transition-colors">{item.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${item.progress}%` }}
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/10 relative group">
                <Zap size={20} className="text-cyan-400/20 absolute top-4 right-4 group-hover:text-cyan-400/50 transition-colors" />
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                  "El éxito bilingüe es una maratón de inmersión, no un sprint de gramática."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}