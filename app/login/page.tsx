"use client";

import {
  AuthError,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, Send, Facebook, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "../src/firebase/config";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/dashboard");
    } catch (error: unknown) {
      alert("Error en las credenciales");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider);
      router.replace("/dashboard");
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#020617] px-4 font-sans selection:bg-cyan-500/30">
      
      {/* Glow de fondo dinámico */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[900px] bg-[#0f172a]/40 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row"
      >
        
        {/* LADO IZQUIERDO: Branding y Social Media */}
        <div className="md:w-[38%] p-10 md:p-14 flex flex-col justify-between items-center text-center border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
          <div>
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Logo"
                width={180}
                height={50}
                className="drop-shadow-[0_0_15px_rgba(6,182,212,0.4)] mb-8 mx-auto"
              />
            </Link>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <ShieldCheck size={12} className="text-cyan-400" />
              <span className="text-[9px] font-black tracking-[0.2em] text-cyan-400 ">Portal X-learning Online</span>
            </div>
          </div>

          <div className="w-full">
            <p className="text-slate-400 text-[10px] font-bold tracking-[0.1em] mb-4 italic">Visítanos en nuestras redes</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <a href="https://facebook.com/profile.php?id=61555920905204&mibextid=ZbWKwL" target="_blank" className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-cyan-500 hover:border-cyan-500 transition-all group">
                <Facebook size={18} className="text-slate-400 group-hover:text-black" />
              </a>
              <a href="https://instagram.com/elon.school/?igsh=M29ucW41dXdqdWFz" target="_blank" className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-cyan-500 hover:border-cyan-500 transition-all group">
                <Instagram size={18} className="text-slate-400 group-hover:text-black" />
              </a>
              <a href="https://youtube.com/@xlearningonline?si=apzphp_iehBrqozX" target="_blank" className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-cyan-500 hover:border-cyan-500 transition-all group">
                <Youtube size={18} className="text-slate-400 group-hover:text-black" />
              </a>
              <a href="https://tiktok.com/@elon.school.oficial?_t=8nMfULz3U1u&_r=1" target="_blank" className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-cyan-500 hover:border-cyan-500 transition-all group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-slate-400 group-hover:text-black">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.31-2.34-.25-3.41.33-.71.38-1.27 1.03-1.57 1.77-.3.72-.38 1.52-.22 2.29.17.82.61 1.59 1.25 2.11.85.73 2.01.99 3.09.73 1.18-.24 2.19-1.03 2.67-2.1.23-.52.33-1.1.33-1.67-.01-4.71-.01-9.42-.01-14.13z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Formulario */}
        <div className="flex-1 p-10 md:p-14 flex flex-col justify-center">
          <header className="mb-8">
            <h2 className="text-2xl font-black text-white tracking-tighter italic ">
              Bienvenido de nuevo
            </h2>
            <p className="text-slate-500 text-[11px] font-bold tracking-widest mt-1 ">Ingresa al panel de control</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 size-4 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-[#020617]/60 px-12 py-4 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all font-bold"
                />
              </div>

              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 size-4 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-[#020617]/60 px-12 py-4 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-cyan-500 py-5 text-[11px] font-black tracking-[0.2em] text-[#020617] hover:bg-white hover:scale-[1.01] transition-all shadow-[0_15px_30px_-10px_rgba(6,182,212,0.4)] flex justify-center items-center gap-3  group"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <>Started <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[10px] font-black text-slate-700 tracking-[0.3em] ">O</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleGoogleLogin}
              className="flex-[2] flex items-center justify-center gap-3 py-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all text-[10px] font-black text-slate-300 tracking-widest group "
            >
              <img src="/google.svg" alt="G" className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Google ID
            </button>
            <Link
              href="/forgot-password"
              className="flex-1 flex items-center justify-center py-4 text-[10px] font-black text-slate-500 hover:text-cyan-400 tracking-widest italic transition-colors "
            >
              Forgot my password
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}