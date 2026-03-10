"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Facebook,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  MessageSquare,
  ShieldAlert,
  Zap,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, db } from "../src/firebase/config";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requestAdmin, setRequestAdmin] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
    adminReason: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInitialSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("¡Bro, las contraseñas no coinciden!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      });

      if (response.ok) {
        setStep(2);
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Error al enviar el código.");
      }
    } catch (error) {
      alert("Error de conexión: Revisa si tu backend está encendido, pa.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const verifyRes = await fetch(`${BACKEND_URL}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          code: otp,
        }),
      });

      if (!verifyRes.ok) throw new Error("Código incorrecto, bro.");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password,
      );

      const uid = userCredential.user.uid;

      // Firestore Users
      await setDoc(doc(db, "users", uid), {
        nombre: formData.fullName,
        correo: formData.email.trim().toLowerCase(),
        telefono: formData.phone || "",
        nacimiento: formData.birthDate,
        nivelingles: "A1",
        role: "student",
        created_at: new Date().toISOString(),
      });

      // Admin Request
      if (requestAdmin) {
        await setDoc(doc(db, "admin_requests", uid), {
          nombre: formData.fullName,
          email: formData.email.trim().toLowerCase(),
          motivo: formData.adminReason,
          status: "pending",
          requested_at: new Date().toISOString(),
        });
      }

      router.replace("/dashboard");
    } catch (error: any) {
      alert(error.message || "Error en el registro final.");
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
    } catch (error) {
      alert("Error con Google, pa.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clase actualizada con texto NEGRO fuerte
  const inputClass = "w-full rounded-2xl border border-slate-300 px-12 py-3 text-sm font-bold text-black placeholder:text-slate-400 focus:outline-none focus:border-black transition-all bg-white";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f1f5f9] px-6 overflow-hidden font-sans">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-[1000px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-200">
        
        {/* PANEL IZQUIERDO */}
        <div className="hidden md:flex flex-col items-center justify-between bg-[#0f172a] p-12 text-white relative">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center w-full">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative w-[320px] h-[80px] mb-4 mx-auto">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
            </motion.div>
            <p className="text-slate-400 text-[11px] font-black tracking-[0.3em] mb-1 ">Security Protocol v3.0</p>
            <p className="text-[12px] font-black text-white italic mt-1  tracking-widest">Tu mejor aliado para triunfar.</p>
          </motion.div>

          <div className="flex justify-center gap-8 relative z-10">
            <Facebook className="text-slate-400 hover:text-blue-500 cursor-pointer transition-colors" />
            <div className="w-6 h-6 text-slate-400 hover:text-white cursor-pointer transition-colors font-bold">TikTok</div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="px-10 py-10 flex flex-col justify-center bg-white overflow-y-auto max-h-[95vh]">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h1 className="text-3xl font-black text-black  italic tracking-tighter flex items-center gap-3">
                  <Zap size={24} className="text-purple-600 fill-purple-600" /> Registry_Portal
                </h1>
                
                <form className="space-y-3" onSubmit={handleInitialSubmit}>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black size-4" />
                    <input name="fullName" type="text" placeholder="NOMBRE COMPLETO" required value={formData.fullName} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black size-4" />
                    <input name="email" type="email" placeholder="CORREO@EJEMPLO.COM" required value={formData.email} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-black size-4" /><input name="phone" type="tel" placeholder="TELÉFONO" value={formData.phone} onChange={handleChange} className={inputClass} /></div>
                    <div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-black size-4" /><input name="birthDate" type="date" required value={formData.birthDate} onChange={handleChange} className={inputClass} /></div>
                  </div>
                  <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black size-4" /><input name="password" type="password" placeholder="CONTRASEÑA" required value={formData.password} onChange={handleChange} className={inputClass} /></div>
                  <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black size-4" /><input name="confirmPassword" type="password" placeholder="CONFIRMAR" required value={formData.confirmPassword} onChange={handleChange} className={inputClass} /></div>

                  {/* ADMIN BOX */}
                  <div className="bg-slate-100 p-5 rounded-3xl border-2 border-slate-200 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setRequestAdmin(!requestAdmin)} className={`w-12 h-6 rounded-full transition-all relative ${requestAdmin ? 'bg-purple-600' : 'bg-slate-400'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${requestAdmin ? 'left-7' : 'left-1'}`} />
                      </div>
                      <span className="text-[11px] font-black text-black  tracking-widest flex items-center gap-2">Solicitar Instructor <ShieldAlert size={14} /></span>
                    </label>
                    {requestAdmin && (
                      <textarea name="adminReason" placeholder="¿MOTIVO PARA SER ADMIN?" required value={formData.adminReason} onChange={handleChange} className="w-full rounded-xl border border-slate-300 p-4 text-xs font-bold text-black focus:border-purple-500 outline-none bg-white min-h-[90px]" />
                    )}
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-black py-4 text-white font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-[12px]  tracking-[0.2em] shadow-xl">
                    {isLoading ? <Loader2 className="animate-spin" /> : <>ENVIAR CÓDIGO <Mail size={18} /></>}
                  </button>
                </form>

                <button onClick={handleGoogleRegister} className="w-full py-4 border-2 border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black text-black hover:bg-slate-50 transition-all ">
                  <Image src="/google.svg" alt="G" width={18} height={18} /> Google Registry
                </button>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-200">
                  <ShieldCheck size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-black ">Verifica tu correo</h2>
                <form onSubmit={handleVerifyAndRegister}>
                  <input type="text" maxLength={8} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="w-full text-center text-5xl font-black py-6 bg-slate-50 border-4 border-black rounded-[2rem] mb-6 text-black focus:outline-none" />
                  <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-black py-4 text-white font-black tracking-widest flex items-center justify-center gap-3 shadow-2xl">
                    {isLoading ? <Loader2 className="animate-spin" /> : <>FINALIZAR <ArrowRight size={20} /></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
