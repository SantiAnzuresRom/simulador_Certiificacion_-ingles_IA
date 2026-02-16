"use client";

import {
  AuthError,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff, Facebook, Loader2, Lock, Mail } from "lucide-react";
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
      const authError = error as AuthError;
      switch (authError.code) {
        case "auth/invalid-credential":
          alert("El correo y la contraseña no coinciden, bro.");
          break;
        case "auth/user-not-found":
          alert("Ese correo no está registrado en la base de datos.");
          break;
        default:
          alert("Hubo un fallo en la matriz. Intenta de nuevo.");
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
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] px-6 overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full bg-sky-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-blue-100/50 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-[900px] bg-white shadow-[0_32px_64px_-12px_rgba(15,23,42,0.1)] rounded-[3rem] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-100"
      >
        {/* PANEL IZQUIERDO: Branding */}
        <div className="hidden md:flex flex-col items-center justify-between bg-[#0f172a] p-16 text-white relative">
          <div className="relative z-10 text-center w-full">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="mb-6 flex justify-center"
            >
              <Image
                src="/logo.png"
                alt="Certifica AI Logo"
                width={300}
                height={80}
                priority
                className="drop-shadow-[0_0_25px_rgba(135,206,235,0.3)] object-contain"
              />
            </motion.div>
            {/* LIMPIEZA: Texto de branding en minúsculas con estilo */}
            <p className="text-slate-400 text-[11px] font-bold tracking-tight italic leading-relaxed">
              Tu mejor aliado para triunfar
            </p>
          </div>

          {/* SOCIAL CONNECT */}
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-4 mb-8 justify-center">
              <div className="h-[1px] w-10 bg-white/10" />
              <span className="text-[10px] font-bold text-sky-400 italic">
                Redes sociales
              </span>
              <div className="h-[1px] w-10 bg-white/10" />
            </div>

            <div className="flex justify-center gap-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-[#1877F2] group-hover:border-[#1877F2] group-hover:scale-110">
                  <Facebook
                    size={22}
                    className="text-slate-400 group-hover:text-white"
                  />
                </div>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-white group-hover:border-white group-hover:scale-110">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-slate-400 group-hover:text-black"
                  >
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.31-2.34-.25-3.41.33-.71.38-1.27 1.03-1.57 1.77-.3.72-.38 1.52-.22 2.29.17.82.61 1.59 1.25 2.11.85.73 2.01.99 3.09.73 1.18-.24 2.19-1.03 2.67-2.1.23-.52.33-1.1.33-1.67-.01-4.71-.01-9.42-.01-14.13z" />
                  </svg>
                </div>
              </a>
            </div>
          </div>

          <div className="absolute bottom-[-40px] right-[-40px] opacity-[0.03] pointer-events-none scale-150">
            <Image src="/logo2.png" alt="X Decor" width={250} height={250} />
          </div>
        </div>

        {/* PANEL DERECHO: Formulario */}
        <div className="p-12 md:p-16 flex flex-col justify-center bg-white">
          <header className="mb-10 text-center md:text-left">
            <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
              <span className="text-[10px] font-bold text-sky-500 italic">
                Acceso seguro
              </span>
              <div className="h-[1px] w-6 bg-sky-200" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
              Bienvenido
            </h1>
          </header>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="group relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="email"
                placeholder="Correo electrónico"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-12 py-4 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-sky-100 focus:border-sky-400 outline-none font-bold"
              />
            </div>

            <div className="group relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-sky-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña secreta"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-12 py-4 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-sky-100 focus:border-sky-400 outline-none font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-[#0f172a] py-4 text-xs font-bold text-white transition-all mt-6 hover:bg-sky-500 hover:text-white flex justify-center items-center shadow-lg active:scale-[0.98] disabled:opacity-50 group overflow-hidden"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="flex items-center gap-3">
                  Entrar al sistema{" "}
                  <SendIcon className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-300 italic">
              O entrar con
            </span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 py-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-[10px] font-bold text-slate-700"
            >
              <img src="/google.svg" alt="" className="w-4 h-4" />
              Google ID
            </button>
            <Link
              href="/register"
              className="flex items-center justify-center gap-3 py-3.5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-[10px] font-bold text-slate-700"
            >
              <Image src="/logo2.png" alt="" width={16} height={16} />
              Registro
            </Link>
          </div>

          <Link
            href="/forgot-password"
            className="text-center mt-10 text-[11px] text-slate-400 hover:text-sky-500 transition-colors font-bold italic"
          >
            ¿Olvidaste tu acceso?
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}
