"use client";

import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";
import { Calendar, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";
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
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      // 2. Enviar datos al Backend de FastAPI
      // IMPORTANTE: Asegúrate de que FastAPI esté corriendo en el puerto 8000
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
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#87CEEB]/20 blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-100/40 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[750px] bg-white shadow-2xl shadow-blue-900/10 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-100"
      >
        {/* PANEL IZQUIERDO */}
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
              ÚNETE A LA MEJOR COMUNIDAD DE APRENDIZAJE
            </p>
          </div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>

        {/* PANEL DERECHO */}
        <div className="px-8 py-6 flex flex-col justify-center bg-white">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Crear cuenta</h1>
            <p className="text-slate-500 text-[10px]">Completa tus datos para empezar</p>
          </div>

          <form className="space-y-2.5" onSubmit={handleRegister}>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
              <input
                name="fullName"
                type="text"
                placeholder="Nombre completo"
                title="Nombre completo"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
              <input
                name="email"
                type="email"
                placeholder="Correo electrónico"
                title="Email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Teléfono"
                  title="Teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
                <input
                  name="birthDate"
                  type="date"
                  title="Fecha de nacimiento"
                  required
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
                />
              </div>
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                title="Contraseña"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-950">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 size-3.5" />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                title="Confirmar contraseña"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-2.5 text-xs text-slate-950 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-4 focus:ring-[#87CEEB]/30 focus:border-[#87CEEB] outline-none font-medium"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-950">
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-all mt-1 shadow-md hover:bg-slate-800 flex justify-center items-center"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Crear cuenta ahora"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-slate-100" />
            <span className="text-[9px] uppercase text-slate-400 font-bold">O</span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>

          <button 
            type="button"
            onClick={handleGoogleRegister}
            className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-xl hover:border-[#87CEEB] hover:bg-[#87CEEB]/5 transition-all text-[10px] font-bold text-slate-900 w-full mb-4"
          >
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
