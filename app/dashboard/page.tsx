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
        name: user.displayName || "STUDENT_ALPHA",
        email: user.email || "",
        uid: user.uid,
      });

      const progressRef = doc(db, "user_progress", user.uid);

      const unsubSnap = onSnapshot(progressRef, async (docSnap) => {
        if (docSnap.exists()) {
          const pData = docSnap.data();
          const currentLvl = pData.currentLevel || "A1";
          setLevel(currentLvl);

          // --- NUEVA LÓGICA DE CÁLCULO DINÁMICO ---

          // Función para calcular promedio de cualquier objeto de módulos (A1, A2, etc.)
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

          // Mapeamos los stats leyendo directamente de tus nuevos campos modules_XX
          const newStats = {
            A1: calculateLevelAvg(pData.modules_A1),
            A2: calculateLevelAvg(pData.modules_A2),
            B1: calculateLevelAvg(pData.modules_B1),
            B2: calculateLevelAvg(pData.modules_B2),
            C1: calculateLevelAvg(pData.modules_C1),
            C2: calculateLevelAvg(pData.modules_C2),
          };

          setStats(newStats);

          // Sincronizamos el progreso general (progress) con el nivel que el usuario está viendo
          const currentProgressValue =
            newStats[currentLvl as keyof typeof newStats];

          if (currentProgressValue !== pData.progress) {
            await updateDoc(progressRef, {
              progress: currentProgressValue,
            });
          }
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
    { lvl: "B2", progress: stats.B2, color: "from-slate-600 to-slate-400" },
    { lvl: "C1", progress: stats.C1, color: "from-purple-600 to-pink-600" },
    { lvl: "C2", progress: stats.C2, color: "from-amber-500 to-orange-600" },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 p-10 bg-white/5 border border-white/10 rounded-[48px] backdrop-blur-2xl shadow-3xl">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-40"></div>
              <div className="relative w-24 h-24 rounded-full bg-[#020617] border-2 border-white/10 flex items-center justify-center overflow-hidden">
                <UserIcon size={40} className="text-slate-500" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500 mb-2 block italic">
                Neural_Active
              </span>
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                {userData.name.split(" ")[0]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-8 mt-8 md:mt-0 bg-white/5 p-6 rounded-3xl border border-white/5">
            <div className="text-center px-4 border-r border-white/10">
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">
                Rank
              </p>
              <p className="text-3xl font-black text-white italic">#042</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[9px] font-black uppercase text-cyan-500 tracking-widest mb-1">
                Target_Level
              </p>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 italic leading-none">
                {level}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <section className="lg:col-span-8 bg-slate-900/40 border border-white/10 rounded-[60px] p-12 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center gap-4 mb-12">
              <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                <Target className="text-cyan-400" size={24} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white italic">
                  Nivel de Entrenamiento
                </h2>
                <p className="text-[10px] text-slate-500 uppercase mt-1">
                  Selecciona el rango de tu certificación
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                <motion.button
                  key={lvl}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLevelSelect(lvl)}
                  className={`group relative h-40 rounded-[40px] border-2 transition-all duration-500 flex flex-col items-center justify-center
                    ${level === lvl ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.15)]" : "border-white/5 bg-[#020617]/50 hover:border-white/20"}`}
                >
                  <span
                    className={`text-6xl font-black italic transition-all duration-500 
                    ${level === lvl ? "text-white scale-110" : "text-slate-800 group-hover:text-slate-600"}`}
                  >
                    {lvl}
                  </span>
                  {level === lvl && (
                    <div className="absolute top-6 right-6 flex flex-col items-center">
                      <Zap
                        size={16}
                        className="text-cyan-400 animate-pulse mb-1"
                      />
                      <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">
                        Active
                      </span>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-8">
            <motion.button
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => router.push("/results")}
              className="w-full p-8 rounded-[40px] bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/10 flex items-center justify-between group shadow-2xl"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500/30 transition-all">
                  <Award size={28} className="text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
                    Analysis_Center
                  </p>
                  <h4 className="text-xl font-black uppercase italic text-white tracking-tighter">
                    Ver Reporte
                  </h4>
                </div>
              </div>
              <ArrowRight
                size={20}
                className="text-slate-600 group-hover:text-white group-hover:translate-x-2 transition-all"
              />
            </motion.button>

            <div className="bg-white/5 border border-white/10 rounded-[50px] p-10 backdrop-blur-md">
              <div className="flex items-center gap-4 mb-10">
                <BarChart3 className="text-cyan-400" size={20} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                  Global_Progress
                </h3>
              </div>

              <div className="space-y-7">
                {levelHistory.map((item) => (
                  <div key={item.lvl} className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span
                        className={`text-[11px] font-black italic uppercase ${level === item.lvl ? "text-cyan-400" : "text-slate-500"}`}
                      >
                        {item.lvl}_Stage
                      </span>
                      <span className="text-[10px] font-black text-white">
                        {item.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full border border-white/5 p-[1px] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
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
