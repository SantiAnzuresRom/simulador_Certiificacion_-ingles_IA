"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BarChart3,
  Target,
  User as UserIcon,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../src/firebase/config";

export default function DashboardPage() {
  const router = useRouter();
  const [level, setLevel] = useState<string>("A1");
  const [userData, setUserData] = useState({ name: "", email: "", uid: "" });
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0,
  });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      setUserData({
        name: user.displayName || "Estudiante",
        email: user.email || "",
        uid: user.uid,
      });

      const progressRef = doc(db, "user_progress", user.uid);

      const unsubSnap = onSnapshot(progressRef, (docSnap) => {
        if (docSnap.exists()) {
          const pData = docSnap.data();
          const currentLvl = pData.currentLevel || "A1";
          setLevel(currentLvl);

          const calculateLevelAvg = (moduleData: any) => {
            if (!moduleData) return 0;
            const {
              reading = 0,
              listening = 0,
              writing = 0,
              speaking = 0,
            } = moduleData;
            return Math.round((reading + listening + writing + speaking) / 4);
          };

          setStats({
            A1: calculateLevelAvg(pData.modules_A1),
            A2: calculateLevelAvg(pData.modules_A2),
            B1: calculateLevelAvg(pData.modules_B1),
            B2: calculateLevelAvg(pData.modules_B2),
            C1: calculateLevelAvg(pData.modules_C1),
            C2: calculateLevelAvg(pData.modules_C2),
          });
        }
        setLoading(false);
      });

      return () => unsubSnap();
    });

    return () => unsubAuth();
  }, [router]);

  const handleLevelSelect = async (lvl: string) => {
    if (!userData.uid) return;
    try {
      const progressRef = doc(db, "user_progress", userData.uid);
      await updateDoc(progressRef, {
        currentLevel: lvl,
        updatedAt: new Date().toISOString(),
      });
      setLevel(lvl);
      router.push("/modulos");
    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  const levelHistory = [
    { lvl: "A1", progress: stats.A1, color: "from-cyan-400 to-blue-500" },
    { lvl: "A2", progress: stats.A2, color: "from-blue-500 to-indigo-500" },
    { lvl: "B1", progress: stats.B1, color: "from-indigo-500 to-purple-500" },
    { lvl: "B2", progress: stats.B2, color: "from-slate-500 to-slate-300" },
    { lvl: "C1", progress: stats.C1, color: "from-purple-600 to-pink-600" },
    { lvl: "C2", progress: stats.C2, color: "from-amber-500 to-orange-600" },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full"
        />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Luces Ambientales */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header Principal */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 p-8 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center overflow-hidden">
                <UserIcon size={32} className="text-slate-500" />
              </div>
            </div>
            <div>
              <span className="text-[9px] font-black tracking-[0.5em] text-cyan-500 mb-1 block uppercase italic">
                Neural Active
              </span>
              <h1 className="text-4xl font-black text-white italic tracking-tighter leading-none">
                {userData.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-8 mt-8 md:mt-0 px-8 py-4 bg-slate-950/50 rounded-2xl border border-white/5">
            <div className="text-center pr-8 border-r border-white/10">
              <p className="text-[9px] font-black text-slate-500 tracking-widest uppercase mb-1">
                Rank
              </p>
              <p className="text-2xl font-black text-white italic">#042</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-cyan-500 tracking-widest uppercase mb-1">
                Target
              </p>
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 italic leading-none">
                {level}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Selector de Niveles */}
          <section className="lg:col-span-8 bg-slate-900/30 border border-white/5 rounded-[50px] p-10 backdrop-blur-xl shadow-inner">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <Target className="text-cyan-400" size={22} />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-widest text-white uppercase italic">
                  Niveles de Entrenamiento
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                  Selecciona tu rango de certificación actual
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                <motion.button
                  key={lvl}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleLevelSelect(lvl)}
                  className={`group relative h-36 rounded-[35px] border-2 transition-all duration-300 flex items-center justify-center
                    ${
                      level === lvl
                        ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                        : "border-white/5 bg-slate-950/40 hover:border-white/20"
                    }`}
                >
                  <span
                    className={`text-5xl font-black italic transition-all 
                    ${level === lvl ? "text-white scale-110" : "text-slate-700 group-hover:text-slate-400"}`}
                  >
                    {lvl}
                  </span>
                  {level === lvl && (
                    <div className="absolute top-5 right-6 text-cyan-400">
                      <Zap size={14} className="animate-pulse" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </section>

          {/* Barra Lateral / Progreso */}
          <aside className="lg:col-span-4 space-y-6">
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              onClick={() => router.push("/results")}
              className="w-full p-8 rounded-[40px] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 flex items-center justify-between group shadow-xl"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                  <Award
                    size={24}
                    className="text-cyan-400 group-hover:text-inherit"
                  />
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-black tracking-[0.3em] text-slate-500 uppercase italic">
                    Analysis_Center
                  </p>
                  <h4 className="text-lg font-black italic text-white tracking-tighter">
                    Ver Reporte AI
                  </h4>
                </div>
              </div>
              <ArrowRight
                size={18}
                className="text-slate-600 group-hover:text-white group-hover:translate-x-2 transition-all"
              />
            </motion.button>

            <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="text-cyan-500" size={18} />
                <h3 className="text-[9px] font-black tracking-[0.4em] text-slate-400 uppercase italic">
                  Progreso Global
                </h3>
              </div>

              <div className="space-y-6">
                {levelHistory.map((item) => (
                  <div key={item.lvl} className="group">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <span
                        className={`text-[10px] font-black italic tracking-widest ${level === item.lvl ? "text-cyan-400" : "text-slate-600"}`}
                      >
                        LVL_{item.lvl}
                      </span>
                      <span className="text-[9px] font-black text-white/70">
                        {item.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
