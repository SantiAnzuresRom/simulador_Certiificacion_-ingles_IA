"use client";

import { motion } from "framer-motion";
import { Calendar, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.replace("/dashboard");
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
        className="relative w-full max-w-[750px] bg-white shadow-2xl shadow-blue-900/10 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-100"
      >
        
        {/* PANEL IZQUIERDO: Branding Sky Blue */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-[#87CEEB] to-[#6eb5d1] p-6 text-slate-900 relative">
          <div className="relative z-10 text-center">
            <motion.img 
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ repeat: Infinity, duration: 3, repeatType: "reverse", ease: "easeInOut" }}
              src="/logo.png" 
              alt="Logo" 
              className="h-28 w-auto mx-auto mb-4 drop-shadow-md" 
            />
            <p className="text-slate-900/80 text-[10px] font-bold uppercase tracking-widest px-4">
              Únete a la mejor comunidad de aprendizaje
            </p>
          </div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>

        {/* PANEL DERECHO: Formulario */}
        <div className="px-8 py-6 flex flex-col justify-center bg-white">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Crear cuenta</h1>
            <p className="text-slate-500 text-[10px]">Completa tus datos para empezar</p>
          </div>

          <form className="space-y-2.5" onSubmit={handleRegister}>
            {/* NOMBRE */}
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
              <input
                type="text"
                placeholder="Nombre completo"
                title="Nombre completo"
                aria-label="Nombre completo"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
              />
            </div>

            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
              <input
                type="email"
                placeholder="Correo electrónico"
                title="Correo electrónico"
                aria-label="Correo electrónico"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* TELÉFONO */}
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  title="Número de teléfono"
                  aria-label="Número de teléfono"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
                />
              </div>
              {/* FECHA (Corregido) */}
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
                <input
                  type="date"
                  title="Fecha de nacimiento"
                  aria-label="Fecha de nacimiento"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                title="Contraseña"
                aria-label="Contraseña"
                required
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

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                title="Confirmar contraseña"
                aria-label="Confirmar contraseña"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-950"
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* BOTÓN CON RESALTO */}
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-all mt-1
                         shadow-[0_0_0_0_rgba(135,206,235,0)] 
                         hover:bg-slate-800 
                         hover:shadow-[0_10px_20px_-5px_rgba(135,206,235,0.6)] 
                         hover:-translate-y-0.5
                         active:scale-[0.96]"
            >
              Crear cuenta ahora
            </button>
          </form>

          {/* DIVISOR */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-slate-100" />
            <span className="text-[9px] uppercase text-slate-400 font-bold">O</span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>

          <button className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-xl hover:border-[#87CEEB] hover:bg-[#87CEEB]/5 transition-all text-[10px] font-bold text-slate-900 w-full mb-4">
            <img src="/google.svg" alt="G" className="h-3.5" />
            Registrarse con Google
          </button>

          <Link href="/login" className="text-center text-[10px] text-slate-400 hover:text-[#87CEEB] transition-colors font-bold">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
