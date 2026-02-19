"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  RefreshCcw,
  Search,
  Trash2,
  UserMinus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../src/firebase/config";

export default function UserControlPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "user_progress"),
      orderBy("updatedAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error:", err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const handleDeleteProgress = async (uid: string) => {
    if (
      !confirm(
        `¿ESTÁS SEGURO? Borrarás el progreso de: ${selectedUser?.displayName || selectedUser?.id}`,
      )
    )
      return;
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "user_progress", uid));
      setSelectedUser(null);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.displayName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="text-cyan-500 animate-spin" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-6 md:p-10 selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto relative z-10">
        <nav className="mb-8">
          <Link
            href="/Adashboard"
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-cyan-400 transition-all"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back_to_Command_Center
          </Link>
        </nav>

        <header className="mb-12">
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
            Termination_<span className="text-red-500">Protocol</span>
          </h1>
          <p className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase mt-4 italic">
            Manejo de registros críticos e interrupción de data
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-5 space-y-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                size={16}
              />
              <input
                type="text"
                placeholder="BUSCAR POR NOMBRE O UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold text-white focus:outline-none focus:border-red-500/30 transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="bg-slate-900/20 border border-white/5 rounded-[40px] p-6 backdrop-blur-md max-h-[600px] overflow-y-auto">
              <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 px-2">
                Active_Database_Entries
              </h2>
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-5 rounded-[25px] border transition-all cursor-pointer flex justify-between items-center ${selectedUser?.id === user.id ? "border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-white/5 bg-slate-950/40 hover:border-white/20"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-black text-white truncate pr-4 uppercase italic">
                        {user.displayName || "Unknown_User"}
                      </p>
                      <p className="text-[8px] text-slate-600 font-mono mt-1 uppercase">
                        UID: {user.id.substring(0, 10)}...
                      </p>
                    </div>
                    <div
                      className={`shrink-0 w-2 h-2 rounded-full ${selectedUser?.id === user.id ? "bg-red-500 animate-pulse" : "bg-slate-800"}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedUser ? (
                <motion.div
                  key="action-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-slate-900/40 border border-red-500/20 rounded-[50px] p-10 backdrop-blur-2xl sticky top-10"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-16 h-16 bg-red-500/10 rounded-[20px] flex items-center justify-center text-red-500">
                      <AlertTriangle size={32} />
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      aria-label="Cerrar panel"
                      className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-10">
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                      Confirm_Deletion
                    </h3>
                    <p className="text-[10px] font-black text-red-500/70 uppercase tracking-[0.3em]">
                      Target: {selectedUser.displayName || "Unknown"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleDeleteProgress(selectedUser.id)}
                      disabled={isDeleting}
                      aria-label="Borrar cuenta permanentemente"
                      className="bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-[20px] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Trash2 size={20} />
                      )}
                      <span className="uppercase tracking-tighter italic">
                        Delete_Account
                      </span>
                    </button>
                    <button
                      aria-label="Borrar puntajes"
                      className="bg-white/5 hover:bg-white/10 text-slate-300 font-black py-5 rounded-[20px] flex items-center justify-center gap-3 border border-white/10 transition-all uppercase tracking-tighter italic"
                    >
                      <RefreshCcw size={20} /> Wipe_Scores
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[500px] border border-dashed border-white/5 rounded-[50px] flex flex-col items-center justify-center text-slate-700 text-center p-12">
                  <UserMinus size={40} className="mb-6" />
                  <h4 className="text-xs font-black uppercase tracking-[0.4em]">
                    No_Subject_Selected
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
