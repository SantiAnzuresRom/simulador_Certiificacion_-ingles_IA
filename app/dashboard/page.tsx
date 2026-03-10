"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BarChart3,
  Target,
  User as UserIcon,
  Zap,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../src/firebase/config";

export default function DashboardPage() {
  const router = useRouter();
  const [level, setLevel] = useState<string>("A1");
  const [userData, setUserData] = useState({ fullName: "", email: "", uid: "" });
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0,
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      // Referencias a las dos posibles colecciones donde vive el nombre
      const userRef = doc(db, "users", user.uid);
      const progressRef = doc(db, "user_progress", user.uid);

      try {
        // 1. Intento inicial para sacar el nombre real de la tabla 'users'
        const userSnap = await getDoc(userRef);
        let nameFound = "Usuario";

        if (userSnap.exists()) {
          nameFound = userSnap.data().full_name || userSnap.data().name || user.displayName || "Usuario";
        } else {
          nameFound = user.displayName || "Usuario";
        }

        // 2. Escucha en tiempo real de progreso y datos de nivel
        const unsubSnap = onSnapshot(progressRef, (docSnap) => {
          if (docSnap.exists()) {
            const pData = docSnap.data();
            
            setUserData({
              fullName: pData.full_name || nameFound, 
              email: user.email || "",
              uid: user.uid,
            });

            const currentLvl = pData.currentLevel || "A1";
            setLevel(currentLvl);

            const calculateLevelAvg = (moduleData: any) => {
              if (!moduleData) return 0;
              const { reading = 0, listening = 0, writing = 0, speaking = 0 } = moduleData;
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
          } else {
            // Caso: Usuario nuevo sin documento de progreso aún
            setUserData({
              fullName: nameFound,
              email: user.email || "",
              uid: user.uid,
            });
          }
          setLoading(false);
        });

        return () => unsubSnap();
      } catch (err) {
        console.error("Error en la carga de datos:", err);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, [router]);

  const handleLevelSelect = async (lvl: string) => {
    if (!userData.uid) return;
    try {
      const progressRef = doc(db, "user_progress", userData.uid);
      await setDoc(progressRef, {
        currentLevel: lvl,
        updatedAt: new Date().toISOString(),
        email: userData.email,
        full_name: userData.fullName 
      }, { merge: true });

      setLevel(lvl);
      router.push("/modulos");
    } catch (error) {
      console.error("sync error:", error);
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
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-sans">
        <div className="relative w-24 h-24 mb-6">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 border-b-2 border-cyan-500 rounded-full" />
          <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-2 border-t-2 border-blue-500 rounded-full" />
        </div>
        <p className="text-cyan-400 font-medium text-[13px] tracking-[0.3em] animate-pulse italic">Sincronizando identidad...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { scrollbar-width: none; }
      `}</style>

      {/* Luces Ambientales */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header Principal */}
        <header className="relative flex flex-col md:flex-row justify-between items-center mb-12 p-10 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-[45px] backdrop-blur-3xl shadow-3xl group">
          
          {/* Botón Cerrar Sesión */}
          <button 
            onClick={handleLogout}
            className="absolute top-6 right-8 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-slate-500 hover:text-red-400 transition-colors uppercase italic"
          >
            <LogOut size={14} />
            Desconectar
          </button>

          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-24 h-24 rounded-full bg-[#020617] border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                <UserIcon size={38} className="text-slate-600 group-hover:text-cyan-500 transition-colors" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.5em] text-cyan-500 mb-2 block italic uppercase">Agente Activo</span>
              <h1 className="text-4xl md:text-6xl font-light text-white italic tracking-tighter leading-none mb-1">
                {userData.fullName}
              </h1>
              <p className="text-[11px] text-slate-500 italic tracking-wider">{userData.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-10 mt-10 md:mt-0 px-10 py-5 bg-slate-950/40 rounded-3xl border border-white/5 shadow-inner">
            <div className="text-center">
              <p className="text-[10px] font-bold text-cyan-500 tracking-[0.3em] mb-2 italic uppercase">Target Level</p>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-500 italic leading-none tracking-tighter">
                {level}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Selector de Niveles */}
          <section className="lg:col-span-8 bg-slate-900/20 border border-white/5 rounded-[50px] p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Target size={150} className="text-cyan-500" />
            </div>

            <div className="flex items-center gap-5 mb-12 relative z-10">
              <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-inner">
                <Target className="text-cyan-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-light tracking-tight text-white italic">Fase de Entrenamiento</h2>
                <p className="text-[11px] text-slate-500 tracking-[0.05em] italic opacity-80">Selecciona el rango de dificultad para iniciar el despliegue</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                <motion.button
                  key={lvl}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLevelSelect(lvl)}
                  className={`group relative h-40 rounded-[40px] border transition-all duration-500 flex items-center justify-center overflow-hidden
                    ${level === lvl ? "border-cyan-500/30 bg-cyan-500/5 shadow-[0_20px_40px_rgba(6,182,212,0.1)]" : "border-white/5 bg-slate-950/40 hover:border-white/10"}`}
                >
                  <span className={`text-6xl font-light italic transition-all duration-500 ${level === lvl ? "text-white scale-110" : "text-slate-800 group-hover:text-slate-500"}`}>
                    {lvl}
                  </span>
                  {level === lvl && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                  )}
                </motion.button>
              ))}
            </div>
          </section>

          {/* Sidebar / Progreso */}
          <aside className="lg:col-span-4 space-y-8">
            <motion.button
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => router.push("/results")}
              className="w-full p-10 rounded-[45px] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 flex items-center justify-between group backdrop-blur-md shadow-2xl"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                  <Award size={28} className="text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold tracking-[0.4em] text-slate-600 mb-1 italic uppercase">Reporting</p>
                  <h4 className="text-xl font-light italic text-white tracking-tighter">Resultados</h4>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-700 group-hover:text-white transition-all" />
            </motion.button>

            <div className="bg-slate-900/40 border border-white/5 rounded-[45px] p-10 backdrop-blur-md shadow-inner">
              <div className="flex items-center gap-3 mb-10">
                <BarChart3 className="text-cyan-500" size={20} />
                <h3 className="text-[10px] font-bold tracking-[0.4em] text-slate-500 italic uppercase">Estado de Misión</h3>
              </div>

              <div className="space-y-8">
                {levelHistory.map((item) => (
                  <div key={item.lvl} className="group">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <span className={`text-[12px] font-bold italic tracking-[0.2em] ${level === item.lvl ? "text-cyan-400" : "text-slate-600"}`}>
                        LVL_{item.lvl}
                      </span>
                      <span className="text-[11px] font-black text-white/40 italic">{item.progress}%</span>
                    </div>
                    <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
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
