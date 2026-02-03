"use client";

import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "../src/firebase/config";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("¡Bro, las contraseñas no coinciden!");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Tu lógica original de Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      // 2. Tu conexión original a FastAPI
      const response = await fetch("http://localhost:8000/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || "",
          birth_date: formData.birthDate
        }),
      });

      if (response.ok) {
        router.replace("/dashboard");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error Backend:", errorData);
        alert("Cuenta creada en Firebase, pero hubo un error en el servidor. Intenta iniciar sesión.");
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error de Registro:", errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider);
      router.replace("/dashboard");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error en Google";
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] px-6 overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#87CEEB]/20 blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-100/40 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[900px] bg-white shadow-2xl shadow-blue-900/10 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-100"
      >
        {/* PANEL IZQUIERDO: Branding Oscuro con Logo 1 */}
        <div className="hidden md:flex flex-col items-center justify-center bg-[#0f172a] p-12 text-white relative overflow-hidden">
          <div className="relative z-10 text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <Image 
                src="/logo.png" 
                alt="Main Logo" 
                width={200} 
                height={55} 
                className="mx-auto mb-8 drop-shadow-[0_0_15px_rgba(135,206,235,0.3)]" 
              />
            </motion.div>
            <h2 className="text-lg font-black uppercase tracking-[0.3em] italic mb-2 text-[#87CEEB]">
              
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Tu mejor aliado para triunfar
            </p>
          </div>
          
          {/* Logo 2 como decoración sutil */}
          <div className="absolute bottom-[-20px] left-[-20px] opacity-10 pointer-events-none rotate-12">
             <Image src="/logo2.png" alt="Decoration" width={180} height={180} />
          </div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        {/* PANEL DERECHO: Tu formulario original */}
        <div className="px-10 py-10 flex flex-col justify-center bg-white">
          <div className="mb-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="text-[9px] font-black text-[#87CEEB] uppercase tracking-[0.3em]">Registry_Protocol</span>
              <div className="h-[1px] w-8 bg-[#87CEEB]/30" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Crear Cuenta</h1>
          </div>

          <form className="space-y-3" onSubmit={handleRegister}>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                name="fullName"
                type="text"
                placeholder="Nombre completo"
                title="Ingresa tu nombre completo"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-12 py-3 text-xs text-slate-950 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/20 focus:border-[#87CEEB] outline-none font-bold"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                name="email"
                type="email"
                placeholder="Correo electrónico"
                title="Ingresa tu correo"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-12 py-3 text-xs text-slate-950 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/20 focus:border-[#87CEEB] outline-none font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Teléfono"
                  title="Tu número de teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-12 py-3 text-xs text-slate-950 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/20 focus:border-[#87CEEB] outline-none font-bold"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input
                  name="birthDate"
                  type="date"
                  title="Fecha de nacimiento"
                  required
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-12 py-3 text-xs text-slate-950 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/20 focus:border-[#87CEEB] outline-none font-bold"
                />
              </div>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                title="Crea una contraseña"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-12 py-3 text-xs text-slate-950 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/20 focus:border-[#87CEEB] outline-none font-bold"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                title="Repite tu contraseña"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-12 py-3 text-xs text-slate-950 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/20 focus:border-[#87CEEB] outline-none font-bold"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-slate-900 py-4 text-[11px] font-black text-white uppercase tracking-[0.2em] transition-all mt-4 hover:bg-[#87CEEB] hover:text-slate-900 flex justify-center items-center shadow-xl active:scale-[0.98] disabled:opacity-70 group"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <span className="flex items-center gap-2">Registrarme Ahora <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-slate-100" />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">O accede con</span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>

          <button 
            type="button"
            onClick={handleGoogleRegister}
            className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl hover:border-[#87CEEB] hover:bg-[#87CEEB]/5 transition-all text-[10px] font-black text-slate-900 uppercase w-full mb-4"
          >
            <img src="/google.svg" alt="G" className="h-4" />
            Registro con Google
          </button>

          <Link href="/login" className="flex items-center justify-center gap-2 text-center text-[10px] text-slate-400 hover:text-[#87CEEB] transition-colors font-black uppercase tracking-widest group">
            <Image src="/logo2.png" alt="L2" width={14} height={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
}