"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
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
      // Vereficamos que el correo y la contraseña sean correctos
      await signInWithEmailAndPassword(auth, email, password);
      
      // Si el login es exitoso nos lleva al menu principal
      router.replace("/dashboard");
    } catch (error: unknown) {
      // Manejo de errores amigable para el panita
      const authError = error as AuthError;
      console.error("Código de error:", authError.code);
      
      switch (authError.code) {
        case "auth/invalid-credential":
          alert("¡Bro! El correo o la contraseña no coinciden. Checa bien.");
          break;
        case "auth/user-not-found":
          alert("Ese correo no está registrado, panita.");
          break;
        case "auth/wrong-password":
          alert("Contraseña incorrecta. ¡Inténtalo de nuevo!");
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
      if (error instanceof Error) {
        console.error("Error con Google:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] px-6 overflow-hidden">
      {/* Luces de fondo */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#87CEEB]/20 blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-100/40 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[650px] bg-white shadow-2xl shadow-blue-900/10 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-100"
      >
        {/* PANEL IZQUIERDO */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-[#87CEEB] to-[#6eb5d1] p-6 text-slate-900 relative">
          <div className="relative z-10 text-center">
            <motion.img 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              src="/logo.png" 
              alt="Logo" 
              className="h-28 w-auto mx-auto mb-4 drop-shadow-md" 
            />
            <p className="text-slate-900/80 text-[10px] font-bold uppercase tracking-widest px-4">
              Tu mejor aliado para triunfar
            </p>
          </div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>

        {/* PANEL DERECHO */}
        <div className="px-8 py-8 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Iniciar sesión</h1>
            <p className="text-slate-500 text-[11px]">Ingresa tus credenciales de acceso</p>
          </div>

          <form className="space-y-3" onSubmit={handleLogin}>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
              <input
                type="email"
                placeholder="Correo electrónico"
                aria-label="Correo electrónico"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                aria-label="Contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-950"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-all mt-2 hover:bg-slate-800 flex justify-center items-center shadow-md active:scale-[0.96] disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Entrar"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-slate-100" />
            <span className="text-[9px] uppercase text-slate-400 font-bold">O</span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-xl hover:border-[#87CEEB] hover:bg-[#87CEEB]/5 transition-all text-[10px] font-bold text-slate-900"
            >
              <img src="/google.svg" alt="G" className="h-3.5" />
              Google
            </button>
            <Link 
              href="/register"
              className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-xl hover:border-[#87CEEB] hover:bg-[#87CEEB]/5 transition-all text-[10px] font-bold text-slate-900"
            >
              <img src="/logo2.png" alt="G" className="h-3.5" />
              Registro
            </Link>
          </div>

          <Link 
            href="/forgot-password" 
            className="text-center mt-5 text-[10px] text-slate-400 hover:text-[#87CEEB] transition-colors font-bold"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </motion.div>
    </div>
  );
}