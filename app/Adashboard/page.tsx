"use client";

import { collection, onSnapshot, query, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  Database,
  Loader2,
  MoreHorizontal,
  Search,
  UserCog,
  Users,
  Layout,
  ClipboardList, 
  X,
  AlertTriangle,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../src/firebase/config";
import { signOut } from "firebase/auth";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL"); 
  const [showOnlineList, setShowOnlineList] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false); 

  const levels = ["ALL", "A1", "A2", "B1", "B2", "C1", "C2"];

  // 1. Sincronización con Firebase
  useEffect(() => {
    const qUsers = query(collection(db, "users"));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const qRequests = query(collection(db, "admin_requests"));
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubUsers();
      unsubRequests();
    };
  }, []);

  // 2. Lógica de Seguridad y Control
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  const handleAccept = async (reqId: string) => {
    try {
      const userRef = doc(db, "users", reqId);
      await updateDoc(userRef, { role: "admin", is_instructor: true });
      await deleteDoc(doc(db, "admin_requests", reqId));
      alert("Acceso de administrador concedido.");
    } catch (e) { console.error(e); }
  };

  const handleReject = async (reqId: string) => {
    try {
      await deleteDoc(doc(db, "admin_requests", reqId));
    } catch (e) { console.error(e); }
  };

  // 3. Filtrado de Búsqueda
  const onlineUsers = users.filter(u => !u.access_blocked);
  const filteredUsers = users.filter((u) => {
    const userName = (u.full_name || u.nombre || "").toLowerCase();
    const matchesSearch = u.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         userName.includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "ALL" || (u.nivelingles || "A1").toUpperCase() === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-sans">
      <Loader2 className="text-cyan-500 animate-spin" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-6 md:p-10 selection:bg-cyan-500/30 font-sans relative">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-7xl mx-auto relative z-10 space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.4em] text-cyan-500 italic ">System Administrator</span>
            </div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none ">Control Center</h1>
          </motion.div>

          {/* BARRA DE BOTONES DE COLORES */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* AMARILLO: SOLICITUDES */}
            <motion.button
              onClick={() => setShowRequestsModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 px-4 py-2 rounded-xl flex items-center gap-3 transition-all relative"
            >
              <ClipboardList size={16} className="text-yellow-500" />
              <span className="text-[10px] font-black text-yellow-500 tracking-widest ">Solicitudes</span>
              {requests.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {requests.length}
                </span>
              )}
            </motion.button>

            {/* AZUL: VER MÓDULOS (FIXED) */}
            <Link href="/modulos">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 px-4 py-2 rounded-xl flex items-center gap-3 transition-all">
                <Layout size={16} className="text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 tracking-widest ">Módulos</span>
              </motion.button>
            </Link>

            {/* MORADO: ADMINISTRATOR */}
            <Link href="/Adashboard/control">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                className="bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 px-4 py-2 rounded-xl flex items-center gap-3 transition-all group"
              >
                <UserCog size={16} className="text-purple-500" />
                <span className="text-[10px] font-black text-purple-500 tracking-widest ">Administrator</span>
              </motion.button>
            </Link>

            {/* ROJO: SALIR (FUNCIONAL) */}
            <motion.button 
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-4 py-2 rounded-xl flex items-center gap-3 transition-all"
            >
              <LogOut size={16} className="text-red-500" />
              <span className="text-[10px] font-black text-red-500 tracking-widest ">Salir</span>
            </motion.button>
          </div>
        </header>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total_Students", val: users.length, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "AI_Interactions", val: "1.2k", icon: BrainCircuit, color: "text-purple-400", bg: "bg-purple-400/10" },
            { label: "Active_Sessions", val: onlineUsers.length, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { label: "DB_Queries", val: "842", icon: Database, color: "text-orange-400", bg: "bg-orange-400/10" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-slate-900/40 border border-white/5 p-6 rounded-[35px] backdrop-blur-xl group hover:border-white/20 transition-all">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}><s.icon className={s.color} size={20} /></div>
              <p className="text-[9px] font-black text-slate-500 tracking-[0.2em] ">{s.label}</p>
              <p className="text-3xl font-black text-white italic">{s.val}</p>
            </motion.div>
          ))}
        </div>

        {/* --- USER TABLE --- */}
        <section className="bg-slate-900/20 border border-white/5 rounded-[50px] backdrop-blur-2xl shadow-2xl relative z-10 overflow-hidden">
          <div className="p-8 border-b border-white/5 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h2 className="text-xl font-black italic text-white tracking-tight ">Database</h2>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input 
                  type="text" 
                  placeholder="BUSCAR SUJETO..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-full py-3 pl-12 pr-6 text-[10px] font-bold text-white focus:border-cyan-500/50 outline-none transition-all tracking-widest" 
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {levels.map((lvl) => (
                <button key={lvl} onClick={() => setLevelFilter(lvl)} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all border ${levelFilter === lvl ? "bg-cyan-500 text-black border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "bg-white/5 text-slate-500 border-white/5 hover:border-white/20"}`}>{lvl}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-[9px] font-black tracking-[0.3em] text-slate-500 border-b border-white/5 ">
                <tr><th className="px-10 py-6">Subject</th><th className="px-8 py-6">Level</th><th className="px-8 py-6">Status</th><th className="px-8 py-6 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors ">
                          {u.full_name || u.nombre || "Unknown"}
                        </span>
                        <span className="text-[8px] text-slate-600 font-mono">ID: {u.id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center justify-center w-14 h-8 bg-slate-950 border border-white/10 rounded-xl text-cyan-400 text-xs font-black italic">{u.nivelingles || "A1"}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${u.access_blocked ? "bg-red-500" : "bg-emerald-500"}`} />
                        <span className={`text-[9px] font-black italic ${u.access_blocked ? "text-red-500" : "text-emerald-500"}`}>
                          {u.access_blocked ? "TERMINATED" : "ACTIVE"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right"><button className="p-2 hover:bg-cyan-500/10 rounded-lg text-slate-500"><MoreHorizontal size={18} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- REQUESTS MODAL --- */}
        <AnimatePresence>
          {showRequestsModal && (
            <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRequestsModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-slate-950 border border-yellow-500/30 w-full max-w-2xl rounded-[40px] overflow-hidden relative shadow-2xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-yellow-500/5">
                  <h3 className="text-2xl font-black italic text-yellow-500 flex items-center gap-3 ">
                    <AlertTriangle size={24} /> Admin_Requests
                  </h3>
                  <button onClick={() => setShowRequestsModal(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"><X /></button>
                </div>
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                  {requests.length > 0 ? (
                    requests.map((req) => (
                      <motion.div key={req.id} layout className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-yellow-500/40">
                        <div className="space-y-2 flex-1">
                          <p className="text-sm font-black text-white italic ">{req.nombre || "Instructor Candidate"}</p>
                          <p className="text-[10px] text-slate-500 italic">"{req.motivo || "Sin descripción."}"</p>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => handleReject(req.id)} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black  hover:bg-red-500 hover:text-white transition-all">Rechazar</button>
                          <button onClick={() => handleAccept(req.id)} className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black  hover:bg-emerald-500 hover:text-white transition-all">Aceptar</button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-20 text-center text-slate-600 italic text-[10px] tracking-[0.4em] ">No pending requests</div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(234, 179, 8, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}