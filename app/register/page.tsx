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
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, db } from "../src/firebase/config"; // Importamos db para Firestore

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // PASO 1: Enviar OTP vía Backend
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
      alert("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // PASO 2: Verificar OTP y Guardar en Auth + Firestore + Backend
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 8) {
      alert("El código debe ser de 8 dígitos");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verificar OTP en Backend
      const verifyRes = await fetch(`${BACKEND_URL}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          code: otp,
        }),
      });

      if (verifyRes.ok) {
        // 2. Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email.trim().toLowerCase(),
          formData.password,
        );

        const uid = userCredential.user.uid;

        // 3. Sincronizar con Firestore (Colección 'users')
        await setDoc(doc(db, "users", uid), {
          nombre: formData.fullName,
          correo: formData.email.trim().toLowerCase(),
          telefono: formData.phone || "",
          nacimiento: formData.birthDate,
          nivelingles: "A1", // Nivel inicial por defecto
          average_score: "0",
          total_exams: "0",
          created_at: new Date().toISOString(),
        });

        // 4. Registrar en Base de Datos SQL vía Backend
        await fetch(`${BACKEND_URL}/api/v1/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: uid,
            full_name: formData.fullName,
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone || "",
            birth_date: formData.birthDate,
          }),
        });

        router.replace("/dashboard");
      } else {
        alert("Código incorrecto o expirado, bro.");
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error en el registro final.");
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTRO CON GOOGLE
  const handleGoogleRegister = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Guardamos en Firestore (si ya existe, actualiza con merge)
      await setDoc(
        doc(db, "users", user.uid),
        {
          nombre: user.displayName || "Sin nombre",
          correo: user.email,
          telefono: user.phoneNumber || "",
          nivelingles: "A1",
          created_at: new Date().toISOString(),
        },
        { merge: true },
      );

      router.replace("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error con Google, bro.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200 px-12 py-3 text-xs font-bold text-black placeholder:text-slate-500 focus:outline-none focus:border-slate-400 transition-colors";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] px-6 overflow-hidden">
      {/* DECORACIÓN */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#87CEEB]/20 blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-100/40 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[950px] bg-white shadow-2xl rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-100"
      >
        {/* PANEL IZQUIERDO */}
        <div className="hidden md:flex flex-col items-center justify-between bg-[#0f172a] p-12 text-white relative">
          <div className="relative z-10 text-center w-full">
            <Image
              src="/logo.png"
              alt="Main Logo"
              width={320}
              height={80}
              priority
              className="mb-4 mx-auto"
            />
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] italic">
              Tu mejor aliado para triunfar.
            </p>
          </div>

          <div className="relative z-10 w-full text-center">
            <div className="flex justify-center gap-8">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-[#1877F2]">
                  <Facebook
                    size={26}
                    className="text-slate-300 group-hover:text-white"
                  />
                </div>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-white group-hover:text-black">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.31-2.34-.25-3.41.33-.71.38-1.27 1.03-1.57 1.77-.3.72-.38 1.52-.22 2.29.17.82.61 1.59 1.25 2.11.85.73 2.01.99 3.09.73 1.18-.24 2.19-1.03 2.67-2.1.23-.52.33-1.1.33-1.67-.01-4.71-.01-9.42-.01-14.13z" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="px-10 py-10 flex flex-col justify-center bg-white">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="text-2xl font-black text-slate-900 mb-6 uppercase">
                  Crear Cuenta
                </h1>
                <form className="space-y-3" onSubmit={handleInitialSubmit}>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input
                      name="fullName"
                      type="text"
                      placeholder="Nombre completo"
                      aria-label="Nombre completo"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input
                      name="email"
                      type="email"
                      placeholder="Correo electrónico"
                      aria-label="Correo electrónico"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Teléfono"
                        aria-label="Teléfono"
                        value={formData.phone}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                      <input
                        name="birthDate"
                        type="date"
                        aria-label="Fecha de nacimiento"
                        required
                        value={formData.birthDate}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input
                      name="password"
                      type="password"
                      placeholder="Contraseña"
                      aria-label="Contraseña"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirmar Contraseña"
                      aria-label="Confirmar Contraseña"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-slate-900 py-4 text-white font-black uppercase hover:bg-black transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      "Enviar Código"
                    )}
                  </button>
                </form>

                <div className="my-5 flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-slate-100" />
                  <span className="text-[9px] font-black text-slate-300 uppercase">
                    O accede con
                  </span>
                  <div className="h-[1px] flex-1 bg-slate-100" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  aria-label="Registrarse con Google"
                  className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl w-full text-[10px] font-black text-black hover:bg-slate-50 transition-all"
                >
                  <Image src="/google.svg" alt="G" width={16} height={16} />{" "}
                  GOOGLE_ID REGISTRY
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <ShieldCheck size={48} className="mx-auto text-blue-500 mb-4" />
                <h2 className="text-xl font-black mb-4 text-black uppercase">
                  Verifica tu correo
                </h2>
                <form onSubmit={handleVerifyAndRegister}>
                  <input
                    type="text"
                    maxLength={8}
                    aria-label="Código de verificación"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-3xl font-black py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl mb-4 text-black focus:border-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-slate-900 py-4 text-white font-black uppercase tracking-widest hover:bg-black transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      "Finalizar Registro"
                    )}
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
