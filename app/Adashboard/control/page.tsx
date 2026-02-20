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
  ShieldAlert,
  Trash2,
  Unlock,
  UserMinus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../src/firebase/config";

// Definimos una interfaz básica para evitar que TypeScript se queje
interface UserData {
  id: string;
  nombre?: string;
  full_name?: string;
  nivelingles?: string;
  correo?: string;
  email?: string;
  access_blocked?: boolean;
}

export default function UserControlPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newLevel, setNewLevel] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const usersData = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as UserData[];

        // Ordenamiento seguro en el cliente
        const sortedUsers = usersData.sort((a, b) => {
          const nameA = (a.nombre || a.full_name || "").toLowerCase();
          const nameB = (b.nombre || b.full_name || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setUsers(sortedUsers);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Error:", err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const handleUpdateUser = async (uid: string, data: Partial<UserData>) => {
    try {
      setIsActionLoading(true);
      await updateDoc(doc(db, "users", uid), data);
      setSelectedUser((prev) => (prev ? { ...prev, ...data } : null));
    } catch (error) {
      console.error("Update Error:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    const confirmName =
      selectedUser?.nombre || selectedUser?.full_name || "este usuario";
    if (!confirm(`¿ELIMINAR PERMANENTEMENTE A: ${confirmName}?`)) return;
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

  const filteredUsers = users.filter((u) => {
    const searchLow = searchTerm.toLowerCase();
    const name = (u.nombre || u.full_name || "").toLowerCase();
    const email = (u.correo || u.email || "").toLowerCase();
    return (
      name.includes(searchLow) ||
      email.includes(searchLow) ||
      u.id.toLowerCase().includes(searchLow)
    );
  });

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="text-red-500 animate-spin" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-6 md:p-10">
      <div className="max-w-7xl mx-auto relative z-10">
        <nav className="mb-8">
          <Link
            href="/Adashboard"
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-cyan-400 transition-all"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Back_to_Command_Center
          </Link>
        </nav>

        <header className="mb-12">
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
            User_<span className="text-red-500">Termination_Control</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LISTADO LATERAL */}
          <section className="lg:col-span-4 space-y-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                size={16}
              />
              <input
                type="text"
                placeholder="BUSCAR SUJETO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold text-white focus:outline-none focus:border-red-500/30 transition-all placeholder:text-slate-700 uppercase"
              />
            </div>

            <div className="bg-slate-900/20 border border-white/5 rounded-[40px] p-6 backdrop-blur-md max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  title={`Seleccionar a ${user.nombre || user.full_name}`}
                  onClick={() => {
                    setSelectedUser(user);
                    setNewLevel(user.nivelingles || "A1");
                  }}
                  className={`w-full p-5 mb-3 rounded-[25px] border transition-all flex justify-between items-center text-left ${
                    selectedUser?.id === user.id
                      ? "border-red-500/50 bg-red-500/10 shadow-lg"
                      : "border-white/5 bg-slate-950/40 hover:border-white/20"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-black text-white truncate pr-4 uppercase italic">
                      {user.nombre || user.full_name || "Unknown_Subject"}
                    </p>
                    <p className="text-[8px] text-slate-600 font-mono mt-1 uppercase">
                      {user.nivelingles || "N/A"} • ID:{" "}
                      {user.id.substring(0, 8)}
                    </p>
                  </div>
                  {user.access_blocked ? (
                    <Lock size={12} className="text-red-500" />
                  ) : (
                    <ChevronRight size={14} className="text-slate-800" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* PANEL DE ACCIÓN */}
          <section className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedUser ? (
                <motion.div
                  key="action-panel"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-900/40 border border-white/10 rounded-[50px] p-10 backdrop-blur-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-10 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-red-500/10 rounded-[22px] flex items-center justify-center text-red-500 border border-red-500/20">
                          <ShieldAlert size={32} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                            Protocol_Override
                          </h3>
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                            ID: {selectedUser.id}
                          </p>
                        </div>
                      </div>
                      <button
                        title="Descartar selección"
                        onClick={() => setSelectedUser(null)}
                        className="p-3 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                      <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                          Neural_Level_Select
                        </label>
                        <div className="flex gap-2">
                          <select
                            title="Seleccionar Nuevo Nivel"
                            value={newLevel}
                            onChange={(e) => setNewLevel(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 flex-1 appearance-none cursor-pointer"
                          >
                            {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                              <option key={lvl} value={lvl}>
                                LEVEL_{lvl}
                              </option>
                            ))}
                          </select>
                          <button
                            title="Guardar Cambios de Nivel"
                            onClick={() =>
                              handleUpdateUser(selectedUser.id, {
                                nivelingles: newLevel,
                              })
                            }
                            disabled={isActionLoading}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.3)]"
                          >
                            {isActionLoading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Save size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                          Security_State
                        </label>
                        <button
                          title={
                            selectedUser.access_blocked
                              ? "Restaurar Acceso"
                              : "Revocar Acceso"
                          }
                          onClick={() =>
                            handleUpdateUser(selectedUser.id, {
                              access_blocked: !selectedUser.access_blocked,
                            })
                          }
                          disabled={isActionLoading}
                          className={`w-full py-3.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-3 border transition-all ${
                            selectedUser.access_blocked
                              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
                              : "bg-red-500/10 border-red-500/50 text-red-500"
                          }`}
                        >
                          {selectedUser.access_blocked ? (
                            <>
                              <Unlock size={16} /> AUTHORIZE_SUBJECT
                            </>
                          ) : (
                            <>
                              <Ban size={16} /> TERMINATE_ACCESS
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      title="Reiniciar estadísticas del usuario"
                      onClick={() =>
                        handleUpdateUser(selectedUser.id, {
                          average_score: 0,
                          total_exams: 0,
                        } as any)
                      }
                      className="bg-white/5 hover:bg-white/10 text-slate-400 font-black py-5 rounded-[25px] flex items-center justify-center gap-3 border border-white/10 text-[10px] uppercase italic tracking-widest transition-all"
                    >
                      <RefreshCcw size={18} /> Reset_Neural_Logs
                    </button>
                    <button
                      title="Eliminar usuario permanentemente"
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      className="bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-[25px] flex items-center justify-center gap-3 text-[10px] uppercase italic tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                    >
                      <Trash2 size={18} /> Wipe_Registry_Total
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[600px] border border-dashed border-white/10 rounded-[60px] flex flex-col items-center justify-center text-slate-800 text-center p-12">
                  <UserMinus size={64} className="mb-6 opacity-10" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.5em] italic opacity-40">
                    Awaiting_Selection_Input
                  </h4>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </div>
  );
}
