"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Ban,
  ChevronRight,
  Loader2,
  Lock,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Unlock,
  UserMinus,
  X,
  Zap,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../src/firebase/config";

// --- Interfaces de Tipado ---
interface UserData {
  id: string;
  nombre?: string;
  full_name?: string;
  nivelingles?: string;
  correo?: string;
  email?: string;
  access_blocked?: boolean;
}

interface UserProgress {
  [key: string]: any;
}

export default function UserControlPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [progressData, setProgressData] = useState<UserProgress | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newLevel, setNewLevel] = useState("A1");

  const modules = ["speaking", "listening", "reading", "writing"];

  // 1. Listener de usuarios
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snap) => {
      const usersData = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as UserData[];

      const sortedUsers = usersData.sort((a, b) => {
        const nameA = (a.nombre || a.full_name || "").toLowerCase();
        const nameB = (b.nombre || b.full_name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setUsers(sortedUsers);
      // Timeout para lucir la carga uniforme
      setTimeout(() => setLoading(false), 800);
    }, (err) => {
      console.error("Firestore Error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Listener de progreso para el usuario seleccionado
  useEffect(() => {
    if (!selectedUser) {
      setProgressData(null);
      return;
    }
    const unsubProgress = onSnapshot(doc(db, "user_progress", selectedUser.id), (snap) => {
      if (snap.exists()) {
        setProgressData(snap.data());
      } else {
        setProgressData(null);
      }
    });
    return () => unsubProgress();
  }, [selectedUser]);

  // --- Funciones de Acción ---
  const handleUpdateUser = async (uid: string, data: Partial<UserData>) => {
    try {
      setIsActionLoading(true);
      await updateDoc(doc(db, "users", uid), data);
      if (data.nivelingles) setNewLevel(data.nivelingles);
    } catch (error) {
      console.error("Update Error:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    const confirmName = selectedUser?.nombre || selectedUser?.full_name || "este usuario";
    if (!confirm(`¿ELIMINAR PERMANENTEMENTE EL REGISTRO DE: ${confirmName}?`)) return;
    try {
      setIsActionLoading(true);
      await deleteDoc(doc(db, "users", uid));
      setSelectedUser(null);
    } catch (error) {
      console.error("Delete Error:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getModuleScore = (module: string) => {
    const score = progressData?.[`modules_${newLevel}`]?.[module];
    return typeof score === 'number' ? score : 0;
  };

  const avgLevel = Math.round(
    modules.reduce((acc, mod) => acc + getModuleScore(mod), 0) / modules.length
  );

  const filteredUsers = users.filter((u) => {
    const searchLow = searchTerm.toLowerCase();
    const name = (u.nombre || u.full_name || "").toLowerCase();
    const email = (u.correo || u.email || "").toLowerCase();
    return name.includes(searchLow) || email.includes(searchLow) || u.id.toLowerCase().includes(searchLow);
  });

  // --- PANTALLA DE CARGA UNIFICADA ---
  if (loading) return (
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
      <p className="text-cyan-400 font-medium text-[13px] tracking-[0.3em] animate-pulse italic ">
        Accediendo a la base de datos...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-4 md:p-10 font-sans relative overflow-hidden selection:bg-blue-500/30">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; display: block; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37, 99, 235, 0.6); }
      `}</style>

      {/* Background FX */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        
        <nav className="mb-10 flex items-center justify-between pb-6 border-b border-white/5">
          <Link href="/Adashboard" className="group inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] text-slate-600 hover:text-white transition-all ">
            <ArrowLeft size={16} className="group-hover:-translate-x-1.5 transition-transform text-blue-500" /> 
            Regresar al Hub
          </Link>
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-white/5 shadow-inner">
            <Fingerprint size={14} className="text-blue-500" />
            <span className="text-[10px] font-mono text-slate-400">ADMIN_AUTH::ESTABLISHED</span>
          </div>
        </nav>

        <header className="mb-14 relative">
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-1 h-16 bg-blue-600 rounded-full"></div>
          <p className="text-xs font-mono text-blue-500 tracking-[0.5em] mb-2 ">Command Center</p>
          <h1 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter leading-none flex items-center gap-4 ">
            User Control Panel
          </h1>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Listado Lateral */}
          <section className="xl:col-span-4 space-y-8">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="BUSCAR SUJETO POR NOMBRE O ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/5 rounded-full py-5 pl-14 pr-8 text-[11px] font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 shadow-inner" 
              />
            </div>

            <div className="bg-slate-950/40 border border-white/5 rounded-[40px] p-7 backdrop-blur-lg shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h2 className="text-[10px] font-black text-slate-500 tracking-[0.3em] italic ">Database Index</h2>
                <span className="text-[10px] font-mono bg-slate-800 text-blue-400 px-3 py-1 rounded-full ">{filteredUsers.length} Subjects</span>
              </div>

              <div className="space-y-3 max-h-[650px] overflow-y-auto custom-scrollbar pr-3">
                {filteredUsers.map((user) => (
                  <motion.button
                    layout
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setNewLevel(user.nivelingles || "A1");
                    }}
                    className={`w-full p-6 rounded-3xl border transition-all flex justify-between items-center text-left relative overflow-hidden group ${
                      selectedUser?.id === user.id 
                        ? "border-blue-500/50 bg-blue-600/10 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.3)]" 
                        : "border-white/5 bg-slate-950 hover:border-blue-500/30 hover:bg-slate-900"
                    }`}
                  >
                    {selectedUser?.id === user.id && (
                        <motion.div layoutId="activePilot" className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
                    )}
                    <div className="overflow-hidden relative z-10">
                      <p className={`text-xs font-black truncate pr-4 italic transition-colors  ${selectedUser?.id === user.id ? 'text-white' : 'text-slate-200'}`}>
                        {user.nombre || user.full_name || "Unknown_Subject"}
                      </p>
                      <p className="text-[9px] text-slate-600 font-mono mt-1.5 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded  ${selectedUser?.id === user.id ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'}`}>
                            {user.nivelingles || "N/A"}
                        </span>
                        • ID: {user.id.substring(0, 12)}
                      </p>
                    </div>
                    <div className="relative z-10 flex items-center gap-3">
                        {user.access_blocked && <Lock size={14} className="text-orange-500 opacity-70" />}
                        <ChevronRight size={18} className={`transition-transform ${selectedUser?.id === user.id ? "text-cyan-400 translate-x-1" : "text-slate-800 group-hover:text-slate-600"}`} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          {/* Panel Derecho */}
          <section className="xl:col-span-8">
            <AnimatePresence mode="wait">
              {selectedUser ? (
                <motion.div 
                    key="action-panel" 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }} 
                    className="space-y-8 sticky top-10"
                >
                  
                  {/* Visualización de Métricas Superiores */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {modules.map((mod, index) => (
                      <motion.div 
                        key={mod} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                        className="bg-slate-950 border border-white/5 p-6 rounded-[32px] text-center relative overflow-hidden group hover:border-blue-500/20 transition-colors shadow-xl"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 group-hover:bg-blue-600 transition-colors"></div>
                        <p className="text-[8px] font-black text-slate-600 tracking-[0.3em] mb-3 italic ">{mod}</p>
                        <div className="text-3xl font-black text-white italic tracking-tighter relative z-10">
                          {getModuleScore(mod)}<span className="text-xs text-cyan-400 ml-1">%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${getModuleScore(mod)}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-blue-600 rounded-full"
                            />
                        </div>
                      </motion.div>
                    ))}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-slate-950 border-2 border-cyan-500/30 p-6 rounded-[32px] text-center shadow-[0_15px_40px_-10px_rgba(34,211,238,0.2)] relative"
                    >
                      <Zap size={16} className="absolute top-4 right-4 text-cyan-500 opacity-50" />
                      <p className="text-[8px] font-black text-cyan-500 tracking-[0.3em] mb-3 italic ">Level_Efficiency</p>
                      <div className="text-3xl font-black text-white italic tracking-tighter">
                        {avgLevel}<span className="text-xs text-cyan-400 ml-1">%</span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-2 font-mono ">Aggregate_Score</p>
                    </motion.div>
                  </div>

                  {/* Panel de Control Principal */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-[50px] p-10 backdrop-blur-2xl relative overflow-hidden shadow-3xl">
                    <div className="flex justify-between items-start mb-12 relative z-10 pb-6 border-b border-white/5">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-cyan-400 border border-blue-600/20 shadow-lg">
                          <ShieldCheck size={40} strokeWidth={1} />
                        </div>
                        <div>
                          <p className="text-xs font-mono text-blue-500 tracking-[0.3em] ">Control</p>
                          <h3 className="text-4xl font-black text-white italic tracking-tighter mt-1 ">
                            User progress<span className="text-white opacity-80 ml-2">👤</span>
                          </h3>
                        </div>
                      </div>
                      <button onClick={() => setSelectedUser(null)} className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors border border-white/5">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 mb-12">
                      <div className="space-y-5 bg-slate-950 p-8 rounded-3xl border border-white/5 shadow-inner">
                        <label className="text-[10px] font-black text-slate-400 tracking-[0.3em] italic flex items-center gap-2 ">
                            <Zap size={14} className="text-blue-500" /> Selecciona el nivel
                        </label>
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <select 
                                value={newLevel} 
                                onChange={(e) => setNewLevel(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-5 py-4 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 flex-1 appearance-none cursor-pointer shadow-md "
                            >
                                {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                                <option key={lvl} value={lvl} className="bg-slate-950 text-white">LEVEL_{lvl}</option>
                                ))}
                            </select>
                            <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 rotate-90 pointer-events-none" />
                          </div>
                          <button 
                            onClick={() => handleUpdateUser(selectedUser.id, { nivelingles: newLevel })}
                            disabled={isActionLoading}
                            className={`px-7 rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-lg ${isActionLoading ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'}`}
                          >
                            {isActionLoading ? <Loader2 size={18} className="animate-spin text-slate-400" /> : <Save size={20} className="text-white" />}
                          </button>
                        </div>

                        <div className="pt-4 mt-2 border-t border-white/5 grid grid-cols-4 gap-2">
                            {modules.map((mod) => (
                                <div key={mod} className="text-center">
                                    <p className="text-[7px] font-black text-slate-600  tracking-tighter mb-1">{mod.substring(0,4)}</p>
                                    <div className="text-[11px] font-mono font-bold text-cyan-500/80">
                                        {getModuleScore(mod)}%
                                    </div>
                                    <div className="w-full h-[2px] bg-white/5 rounded-full mt-1 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getModuleScore(mod)}%` }}
                                            className="h-full bg-cyan-500/40"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                      </div>

                      <div className="space-y-5 bg-slate-950 p-8 rounded-3xl border border-white/5 shadow-inner">
                        <label className="text-[10px] font-black text-slate-400 tracking-[0.3em] italic flex items-center gap-2 ">
                            <Fingerprint size={14} className="text-blue-500" /> Access Status
                        </label>
                        <button
                          onClick={() => handleUpdateUser(selectedUser.id, { access_blocked: !selectedUser.access_blocked })}
                          disabled={isActionLoading}
                          className={`w-full py-4.5 rounded-xl text-xs font-black flex items-center justify-center gap-3 border-2 transition-all shadow-lg active:scale-[0.98]  ${
                            selectedUser.access_blocked 
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20" 
                              : "bg-blue-600/10 border-blue-500/40 text-blue-400 hover:bg-blue-600/20"
                          }`}
                        >
                          {selectedUser.access_blocked ? (
                            <><Unlock size={18} strokeWidth={2.5}/> Restore Access</>
                          ) : (
                            <><Ban size={18} strokeWidth={2.5}/> Revoke Access</>
                          )}
                        </button>
                         <p className={`text-[9px] italic font-mono pt-1  ${selectedUser.access_blocked ? 'text-emerald-700' : 'text-blue-700'}`}>
                            :: {selectedUser.access_blocked ? 'BLOQUEADO' : 'ACTIVO'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10 pt-8 border-t border-white/5">
                        <button 
                            onClick={() => handleUpdateUser(selectedUser.id, { average_score: 0, total_exams: 0 } as any)} 
                            className="group bg-slate-950 hover:bg-slate-900 text-slate-500 hover:text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 border border-white/5 text-[10px] italic tracking-widest transition-all shadow-inner"
                        >
                            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500 text-blue-500" /> 
                            Restart progress
                        </button>
                        <button 
                            onClick={() => handleDeleteUser(selectedUser.id)} 
                            className="group bg-slate-950 hover:bg-red-950 text-red-700 hover:text-red-200 font-bold py-5 rounded-2xl flex items-center justify-center gap-3 border border-red-900/30 text-[10px] italic tracking-widest transition-all shadow-lg "
                        >
                            <Trash2 size={16} className="group-hover:animate-pulse" /> 
                            Erase user permanently
                        </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                    key="empty-panel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full min-h-[700px] border border-dashed border-white/10 rounded-[60px] flex flex-col items-center justify-center text-center p-12 bg-slate-950/20 backdrop-blur-sm"
                >
                  <UserMinus size={80} className="text-slate-800 opacity-30" strokeWidth={1} />
                  <h4 className="text-xs font-black tracking-[0.5em] text-slate-600 italic mt-6 ">
                    Awaiting_Selection_Input
                  </h4>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-white/5 text-center">
            <p className="text-[9px] font-mono text-slate-700 tracking-widest ">
                AI_REGISTRY_PROTOCOL_v4.1 // UNIFIED_COMMAND_INTERFACE
            </p>
        </footer>
      </div>
    </div>
  );
}