"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfaf7] px-6">

      {/* MAIN CARD */}
      <div className="w-full max-w-5xl bg-[#fbfaf7] shadow-2xl
                      border border-[#59d2ec] rounded-xl
                      grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT BRAND */}
        <div className="bg-[#fbfaf1] flex items-center justify-center">
          <img
            src="/logo.png"
            alt="X Learning Online"
            className="h-40 drop-shadow-2xl"
          />
        </div>

        {/* RIGHT REGISTER */}
        <div className="p-10 flex flex-col justify-center">

          <h1 className="text-2xl font-bold text-[#161616] mb-6 text-center">
            Crear cuenta
          </h1>

          {/* FORM */}
          <form className="space-y-4">

            <input
              type="text"
              placeholder="Nombre completo"
              className="w-full rounded-lg border border-[#59d2ec]
                         px-4 py-3 text-sm text-[#161616]
                         placeholder:text-[#161616]/60
                         focus:outline-none focus:ring-2 focus:ring-[#59d2ec]"
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full rounded-lg border border-[#59d2ec]
                         px-4 py-3 text-sm text-[#161616]
                         placeholder:text-[#161616]/60
                         focus:outline-none focus:ring-2 focus:ring-[#59d2ec]"
            />

            {/* TELÉFONO */}
            <input
              type="tel"
              placeholder="Número de teléfono"
              className="w-full rounded-lg border border-[#59d2ec]
                         px-4 py-3 text-sm text-[#161616]
                         placeholder:text-[#161616]/60
                         focus:outline-none focus:ring-2 focus:ring-[#59d2ec]"
            />

            {/* FECHA NACIMIENTO (ACCESIBLE) */}
            <div>
              <label htmlFor="birthdate" className="sr-only">
                Fecha de nacimiento
              </label>
              <input
                id="birthdate"
                type="date"
                className="w-full rounded-lg border border-[#59d2ec]
                           px-4 py-3 text-sm text-[#161616]
                           focus:outline-none focus:ring-2 focus:ring-[#59d2ec]"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                className="w-full rounded-lg border border-[#59d2ec]
                           px-4 py-3 text-sm text-[#161616]
                           placeholder:text-[#161616]/60
                           focus:outline-none focus:ring-2 focus:ring-[#59d2ec]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#161616]/70"
              >
                {showPassword ? "😲" : "😌"}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                className="w-full rounded-lg border border-[#59d2ec]
                           px-4 py-3 text-sm text-[#161616]
                           placeholder:text-[#161616]/60
                           focus:outline-none focus:ring-2 focus:ring-[#59d2ec]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#161616]/70"
              >
                {showConfirmPassword ? "😲" : "😌"}
              </button>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#161616]
                         py-3 text-sm font-semibold text-white
                         hover:bg-[#029e99] transition"
            >
              Crear cuenta
            </button>
          </form>

          {/* DIVIDER */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#59d2ec]" />
            <span className="text-xs text-[#161616]/60">o</span>
            <div className="h-px flex-1 bg-[#59d2ec]" />
          </div>

          {/* GOOGLE */}
          <button
            className="w-full rounded-lg border border-[#59d2ec]
                       py-3 text-sm flex items-center justify-center gap-3
                       hover:bg-[#59d2ec]/10 transition text-[#161616]"
          >
            <img src="/google.svg" alt="Google" className="h-5" />
            Registrarse con Google
          </button>

          {/* FOOTER */}
          <a
            href="/login"
            className="mt-6 text-xs text-center text-[#161616]/70 hover:underline"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </a>

        </div>
      </div>
    </div>
  );
}
