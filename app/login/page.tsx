"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
// Importaciones de Firebase
import {
  AuthError,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
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
      const authError = error as AuthError;
      switch (authError.code) {
        case "auth/invalid-credential":
          alert("El correo y la contraseña no coinciden.");
          break;
        case "auth/user-not-found":
          alert("Ese correo no está registrado, panita.");
          break;
        default:
          alert("Hubo un fallo en la matriz. Intenta de nuevo más tarde.");
      }
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
    } catch (error: unknown) {
      console.error("Error con Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#87CEEB]/20 blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-100/40 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[850px] bg-white shadow-2xl shadow-blue-900/10 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-100"
      >
        {/* PANEL IZQUIERDO: Branding Principal */}
        <div className="hidden md:flex flex-col items-center justify-center bg-[#0f172a] p-12 text-white relative overflow-hidden">
          <div className="relative z-10 text-center">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <Image 
                src="/logo.png" 
                alt="Main Logo" 
                width={220} 
                height={60} 
                className="mx-auto mb-8 drop-shadow-[0_0_15px_rgba(135,206,235,0.3)]" 
              />
            </motion.div>
            <h2 className="text-xl font-black uppercase tracking-[0.3em] italic mb-2 text-[#87CEEB]">
              
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Tu mejor aliado para triunfar .
            </p>
          </div>
          
          {/* Logo decorativo de fondo */}
          <div className="absolute bottom-[-20px] right-[-20px] opacity-10 pointer-events-none">
             <Image src="/logo2.png" alt="Decoration" width={200} height={200} />
          </div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        {/* PANEL DERECHO: Formulario */}
        <div className="px-10 py-12 flex flex-col justify-center bg-white relative">
          {/* Logo pequeño para móviles */}
          <div className="md:hidden flex justify-center mb-8">
            <Image src="/logo.png" alt="Logo Mobile" width={150} height={40} />
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black text-[#87CEEB] uppercase tracking-[0.3em]">Access_Protocol</span>
              <div className="h-[1px] w-8 bg-[#87CEEB]/30" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Iniciar sesión</h1>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type="email"
                placeholder="USER_EMAIL"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-12 py-3.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/20 focus:border-[#87CEEB] outline-none font-bold"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="USER_PASSWORD"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-12 py-3.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/20 focus:border-[#87CEEB] outline-none font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-slate-900 py-4 text-[11px] font-black text-white uppercase tracking-[0.2em] transition-all mt-4 hover:bg-[#87CEEB] hover:text-slate-900 flex justify-center items-center shadow-xl active:scale-[0.98] disabled:opacity-70 group"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <span className="flex items-center gap-2">Initialize_Session <Send size={14} className="group-hover:translate-x-1 transition-transform" /></span>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-slate-100" />
            <span className="text-[10px] font-black text-slate-300 uppercase">External_Auth</span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl hover:border-[#87CEEB] hover:bg-[#87CEEB]/5 transition-all text-[10px] font-black text-slate-900 uppercase tracking-tighter"
            >
              <img src="/google.svg" alt="G" className="h-4" />
              Google_ID
            </button>
            <Link 
              href="/register"
              className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl hover:border-[#87CEEB] hover:bg-[#87CEEB]/5 transition-all text-[10px] font-black text-slate-900 uppercase tracking-tighter"
            >
              <Image src="/logo2.png" alt="L2" width={16} height={16} />
              New_Account
            </Link>
          </div>

          <Link 
            href="/forgot-password" 
            className="text-center mt-8 text-[10px] text-slate-400 hover:text-[#87CEEB] transition-colors font-black uppercase tracking-widest"
          >
            Forgot_Credentials?
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// Icono pequeño que faltaba para el botón
function Send({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
    </svg>
  );
}