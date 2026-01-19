"use client";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfaf7] px-6">

      {/* MAIN CARD */}
      <div className="w-full max-w-4xl bg-[#fbfaf7] shadow-2xl
                      border border-[#59d2ec] rounded-xl
                      grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT BRAND */}
        <div className="bg-[#fbfaf1] flex items-center justify-center">
          <img
            src="/logo.png"
            alt="X Learning Online"
            className="h-36 drop-shadow-2xl"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="p-10 flex flex-col justify-center">

          <h1 className="text-2xl font-bold text-[#161616] mb-2 text-center">
            Recuperar contraseña
          </h1>

          <p className="text-sm text-[#161616]/70 text-center mb-6">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
          </p>

          <form className="space-y-5">

            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full rounded-lg border border-[#59d2ec]
                         px-4 py-3 text-sm text-[#161616]
                         placeholder:text-[#161616]/60
                         focus:outline-none focus:ring-2 focus:ring-[#59d2ec]"
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-[#161616]
                         py-3 text-sm font-semibold text-white
                         hover:bg-[#029e99] transition"
            >
              Enviar enlace
            </button>
          </form>

          <a
            href="/login"
            className="mt-6 text-xs text-center text-[#161616]/70 hover:underline"
          >
            Volver a iniciar sesión
          </a>

        </div>
      </div>
    </div>
  );
}
