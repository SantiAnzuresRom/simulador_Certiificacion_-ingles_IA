"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Mail,
  PlayCircle,
  ShieldCheck,
  User,
  Zap
} from "lucide-react";
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
    name: "Cargando...",
    email: "",
    uid: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.fullName || user.displayName || "User_Alpha",
            email: user.email || "",
            uid: user.uid,
          });
        } else {
          setUserData({
            name: user.displayName || "User_Alpha",
            email: user.email || "",
            uid: user.uid,
          });
        }
      } else {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLevelSelect = (lvl: string) => {
    setLevel(lvl);
    localStorage.setItem("selectedLevel", lvl);
  };

  const history = [
    { lvl: "A1", progress: 100, color: "#10b981", status: "Completed" },
    { lvl: "A2", progress: 75, color: "#87CEEB", status: "In Progress" },
    { lvl: "B1", progress: 40, color: "#64748b", status: "Analyzing" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-20 font-sans selection:bg-[#87CEEB] selection:text-slate-900">
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-white/5 pt-12 pb-20 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#87CEEB] to-transparent opacity-50" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="h-24 w-24 rounded-3xl bg-slate-800 border-2 border-[#87CEEB]/20 flex items-center justify-center text-[#87CEEB] shadow-[0_0_30px_rgba(135,206,235,0.15)]">
                  <User size={48} strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-lg border-4 border-slate-900">
                  <ShieldCheck size={16} className="text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Activity size={18} className="text-[#87CEEB]" />
                  </motion.div>
                  <h1 className="text-3xl font-black uppercase italic tracking-widest">
                    {userData.name.split(" ")[0]}
                    <span className="text-[#87CEEB]">_OPERATOR</span>
                  </h1>
                </div>

                <div className="flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                    <Mail size={12} className="text-[#87CEEB]" />
                    {userData.email}
                  </span>
                  <span className="bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                    ID: {userData.uid.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl w-full md:w-96 shadow-2xl relative">
              <div className="absolute top-4 right-6">
                <Zap size={14} className="text-[#87CEEB] animate-pulse" />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase mb-4 tracking-[0.2em] text-slate-400">
                <span>{level}_ACTIVE</span>
                <span className="text-[#87CEEB]"></span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-[2px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="h-full bg-gradient-to-r from-[#87CEEB] to-blue-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CONTROL PANEL */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-[3.5rem] p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] text-slate-900">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black uppercase mb-1">
                    Target_Selection
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Define your training parameters
                  </p>
                </div>
                <PlayCircle size={32} />
              </div>

              {/* 🔥 LEVEL SELECTOR MEJORADO */}
              <div className="grid grid-cols-3 gap-4 mb-12">
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => {
                  const isActive = level === lvl;

                  return (
                    <motion.button
                      key={lvl}
                      onClick={() => handleLevelSelect(lvl)}
                      whileHover={{ y: -6, scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 18,
                      }}
                      className={`relative h-24 rounded-2xl border overflow-hidden
                        ${
                          isActive
                            ? "bg-slate-900 border-[#87CEEB] shadow-[0_0_30px_rgba(135,206,235,0.35)]"
                            : "bg-slate-50 border-slate-200 hover:border-[#87CEEB]/60"
                        }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full relative z-10">
                        <span
                          className={`text-[9px] font-black uppercase tracking-[0.35em]
                          ${
                            isActive
                              ? "text-[#87CEEB]"
                              : "text-slate-400"
                          }`}
                        >
                          Level
                        </span>
                        <span
                          className={`text-3xl font-black italic
                          ${
                            isActive
                              ? "text-[#87CEEB]"
                              : "text-slate-700"
                          }`}
                        >
                          {lvl}
                        </span>
                      </div>

                      {isActive && (
                        <motion.div
                          layoutId="activeGlow"
                          className="absolute inset-0 bg-gradient-to-tr from-[#87CEEB]/20 to-transparent"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={() => router.push("/modulos")}
                className="w-full py-8 bg-slate-900 text-[#87CEEB] rounded-3xl font-black text-xl flex items-center justify-center gap-5 hover:bg-slate-800 transition-all active:scale-95"
              >
                INITIALIZE TRAINING
                <PlayCircle size={30} />
              </button>
            </div>
          </section>

          {/* ANALYTICS */}
          <section className="lg:col-span-4 space-y-6">
            {history.map((item, i) => (
              <motion.div
                key={item.lvl}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5"
              >
                <div className="flex justify-between mb-4">
                  <div className="font-black">{item.lvl}</div>
                  {item.progress === 100 && (
                    <CheckCircle2 className="text-emerald-400" />
                  )}
                </div>

                <div className="h-2 bg-white/10 rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </motion.div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
