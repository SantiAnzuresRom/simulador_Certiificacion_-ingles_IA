"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  Database,
  Loader2,
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserCog, // Importamos este para el botón de control
  Users,
} from "lucide-react";
import Link from "next/link"; // Necesario para la navegación
import { useEffect, useState } from "react";
import { db } from "../src/firebase/config";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "user_progress"),
      orderBy("updatedAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.currentLevel &&
        u.currentLevel.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="text-cyan-500 animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-6 md:p-10 selection:bg-cyan-500/30">
      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto relative z-10 space-y-10">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500 italic">
                System_Administrator
              </span>
            </div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
              A_Dashboard<span className="text-cyan-500">.</span>
            </h1>
          </motion.div>

          <div className="flex flex-wrap items-center gap-4">
            {/* --- BOTÓN DE CONTROL DE USUARIOS (TERMINATION PROTOCOL) --- */}
            <Link href="/Adashboard/control">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-4 py-2 rounded-xl flex items-center gap-3 transition-all group"
              >
                <UserCog
                  size={16}
                  className="text-red-500 group-hover:rotate-12 transition-transform"
                />
                <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">
                  User_Termination_Protocol
                </span>
              </motion.button>
            </Link>

            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="px-4 py-2 text-right border-r border-white/10">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  Server_Status
                </p>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">
                  Operational
                </p>
              </div>
              <div className="flex items-center gap-3 px-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                  <ShieldCheck size={16} className="text-cyan-400" />
                </div>
                <span className="text-[10px] font-black uppercase text-white tracking-widest">
                  Root_Access
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* METRICS GRID (Igual que antes...) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: "Total_Students",
              val: users.length,
              icon: Users,
              color: "text-blue-400",
              bg: "bg-blue-400/10",
            },
            {
              label: "AI_Interactions",
              val: "1.2k",
              icon: BrainCircuit,
              color: "text-purple-400",
              bg: "bg-purple-400/10",
            },
            {
              label: "Active_Sessions",
              val: Math.floor(users.length * 0.4),
              icon: Activity,
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
            },
            {
              label: "DB_Queries",
              val: "842",
              icon: Database,
              color: "text-orange-400",
              bg: "bg-orange-400/10",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/40 border border-white/5 p-6 rounded-[35px] backdrop-blur-xl group hover:border-white/20 transition-all cursor-default"
            >
              <div
                className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <s.icon className={s.color} size={20} />
              </div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {s.label}
              </p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-black text-white italic">{s.val}</p>
                <ArrowUpRight
                  size={14}
                  className="text-emerald-500 mb-2 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* MAIN DATABASE TABLE (Igual que antes...) */}
        <section className="bg-slate-900/20 border border-white/5 rounded-[50px] overflow-hidden backdrop-blur-2xl shadow-2xl">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div>
              <h2 className="text-xl font-black italic text-white uppercase tracking-tight">
                Student_Database_v1.0
              </h2>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1 italic">
                Logs de progreso y actividad neural
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                size={16}
              />
              <input
                type="text"
                placeholder="BUSCAR UID O NIVEL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-full py-3 pl-12 pr-6 text-[10px] font-bold text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700 uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5">
                <tr>
                  <th className="px-10 py-6 italic text-cyan-500/70">
                    Unique_UID
                  </th>
                  <th className="px-8 py-6">Current_Lvl</th>
                  <th className="px-8 py-6">Last_Update</th>
                  <th className="px-8 py-6">Neural_Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition-colors tracking-tight">
                          {u.id}
                        </span>
                        <span className="text-[8px] text-slate-600 font-mono mt-1 uppercase tracking-tighter">
                          PATH: /sys/usr/{u.id.substring(0, 6)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center justify-center w-14 h-8 bg-slate-950 border border-white/10 rounded-xl text-cyan-400 text-xs font-black italic shadow-inner">
                        {u.currentLevel || "A1"}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {u.updatedAt
                          ? new Date(u.updatedAt).toLocaleDateString()
                          : "No_Sync"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] animate-pulse" />
                        <span className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.2em] italic">
                          Synchronized
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        aria-label="Más opciones"
                        className="p-2 hover:bg-cyan-500/10 rounded-lg transition-all text-slate-500 hover:text-cyan-400 active:scale-90"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
