"use client";

import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Eye, EyeOff, Facebook, Loader2, Lock, Mail, Phone, User } from "lucide-react";
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
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

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
        alert("Cuenta creada en Firebase, pero hubo un error en el servidor.");
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
        className="relative w-full max-w-[950px] bg-white shadow-2xl shadow-blue-900/10 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-100"
      >
        {/* PANEL IZQUIERDO: Branding Oscuro y Redes */}
        <div className="hidden md:flex flex-col items-center justify-between bg-[#0f172a] p-12 text-white relative overflow-hidden">
          
          {/* Logo Principal Ensanchado */}
          <div className="relative z-10 text-center w-full flex flex-col items-center justify-center">
            <motion.div
              className="w-full flex justify-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <Image 
                src="/logo.png" 
                alt="Main Logo" 
                width={320} 
                height={80} 
                priority
                style={{ objectFit: 'contain' }}
                className="drop-shadow-[0_0_20px_rgba(135,206,235,0.4)] mb-4" 
              />
            </motion.div>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] italic">
              Tu mejor aliado para triunfar.
            </p>
          </div>

          {/* Redes Sociales Visibles */}
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <div className="h-[1px] w-8 bg-white/10" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400">Social_Connect</span>
              <div className="h-[1px] w-8 bg-white/10" />
            </div>
            
            <div className="flex justify-center gap-8">
              <a href="https://www.facebook.com/share/14UxhLcNhg8/" target="_blank" className="group flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-[#1877F2] group-hover:border-[#1877F2] group-hover:shadow-[0_0_25px_rgba(24,119,242,0.5)] group-hover:-translate-y-2">
                  <Facebook size={26} className="text-slate-300 group-hover:text-white" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Facebook</span>
              </a>

              <a href="https://www.tiktok.com/@x_learningonline?_r=1&_" target="_blank" className="group flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-white group-hover:border-white group-hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] group-hover:-translate-y-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300 group-hover:text-black">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.31-2.34-.25-3.41.33-.71.38-1.27 1.03-1.57 1.77-.3.72-.38 1.52-.22 2.29.17.82.61 1.59 1.25 2.11.85.73 2.01.99 3.09.73 1.18-.24 2.19-1.03 2.67-2.1.23-.52.33-1.1.33-1.67-.01-4.71-.01-9.42-.01-14.13z"/>
                  </svg>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">TikTok</span>
              </a>
            </div>
          </div>
          
          <div className="absolute bottom-[-20px] left-[-20px] opacity-10 pointer-events-none rotate-12">
             <Image src="/logo2.png" alt="Decoration" width={180} height={180} />
          </div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        {/* PANEL DERECHO: Formulario */}
        <div className="px-10 py-10 flex flex-col justify-center bg-white overflow-y-auto max-h-[90vh] md:max-h-none">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
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
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-12 py-3 text-xs text-slate-950 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/20 focus:border-[#87CEEB] outline-none font-bold"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-12 py-3 text-xs text-slate-950 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/20 focus:border-[#87CEEB] outline-none font-bold"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
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
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">O accede con</span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>

          <button 
            type="button"
            onClick={handleGoogleRegister}
            className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl hover:border-[#87CEEB] hover:bg-[#87CEEB]/5 transition-all text-[10px] font-black text-slate-900 uppercase w-full mb-4"
          >
            <img src="/google.svg" alt="G" className="h-4" />
            Google_ID Registry
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