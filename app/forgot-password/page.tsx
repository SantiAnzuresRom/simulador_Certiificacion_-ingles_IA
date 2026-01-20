"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí iría la lógica de envío
    console.log("Enlace enviado");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] px-6 overflow-hidden">
      {/* Luces de fondo coherentes */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#87CEEB]/20 blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-100/40 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[650px] bg-white shadow-2xl shadow-blue-900/10 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-100"
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
              Recupera tu acceso fácilmente
            </p>
          </div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>

        {/* PANEL DERECHO: Formulario */}
        <div className="px-8 py-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Recuperar contraseña</h1>
            <p className="text-slate-500 text-[11px] mt-2 leading-relaxed">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu acceso.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleReset}>
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

            {/* BOTÓN CON RESALTO BRILLANTE */}
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-all mt-2
                         shadow-[0_0_0_0_rgba(135,206,235,0)] 
                         hover:bg-slate-800 
                         hover:shadow-[0_10px_20px_-5px_rgba(135,206,235,0.6)] 
                         hover:-translate-y-0.5
                         active:scale-[0.96]"
            >
              Enviar enlace
            </button>
          </form>

          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 mt-8 text-[10px] text-slate-400 hover:text-slate-950 transition-colors font-bold"
          >
            <ArrowLeft size={12} />
            Volver a iniciar sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
}