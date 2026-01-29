"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Globe,
  LogIn,
  Shield,
  UserPlus,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-[100] bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Logo Principal con Brillo sutil */}
            <Image 
              src="/logo.png" 
              alt="X-Learning Online Logo" 
              width={180} 
              height={40} 
              className="object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
              priority
            />
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              <LogIn size={16} />
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#020617] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <UserPlus size={16} />
              Crear Cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-44 pb-20 px-6 overflow-hidden">
        {/* Logo2 (la X) con Brillo Azul Neón de fondo */}
        <div className="absolute top-20 right-[-10%] opacity-20 pointer-events-none -z-10 rotate-12 blur-[2px]">
          <Image 
            src="/logo2.png" 
            alt="Decorative X" 
            width={600} 
            height={600} 
            className="drop-shadow-[0_0_50px_rgba(6,182,212,0.3)]"
          />
        </div>
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-8 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            <Shield size={14} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Laboratorio de Certificación Oficial</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter mb-8 leading-[0.9] drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            Habla Inglés <br />
            <span className="text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">Desde la Primera Clase.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-12 leading-relaxed">
            X-Learning ONline es una microempresa dedicada a que aprendas de forma rápida, eliminando el método convencional de libros y gramática.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register" className="w-full sm:w-auto px-10 py-5 bg-cyan-500 text-[#020617] rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              Comenzar Entrenamiento <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* --- QUIÉNES SOMOS SECTION --- */}
      <section className="py-24 px-6 bg-[#070c1b]/50 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
               <Image 
                 src="/logo2.png" 
                 alt="X Icon" 
                 width={50} 
                 height={50} 
                 className="drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
               />
               <h2 className="text-4xl font-black text-white italic uppercase tracking-tight leading-tight">
                Un Enfoque <span className="text-cyan-500">Disruptivo</span>
              </h2>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              No basamos nuestra enseñanza en libros, cuadernos de trabajo ni gramática tradicional. 
              Buscamos que utilices de manera hablada el idioma desde el primer momento.
            </p>
            
            <div className="space-y-4">
              {[
                { text: "Método 100% hablado y dinámico", icon: Zap },
                { text: "Sin libros ni memorización innecesaria", icon: BookOpen },
                { text: "Certificaciones nacionales e internacionales", icon: Award }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0f172a] border border-white/5 hover:border-cyan-500/30 transition-colors shadow-inner">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <item.icon className="text-cyan-400" size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-200 uppercase tracking-tight">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* GLOBAL PRESENCE & STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-8 rounded-[32px] bg-cyan-500 border border-cyan-400 flex flex-col justify-center text-[#020617] shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <Globe size={40} className="mb-4 opacity-80" />
              <div className="text-5xl font-black mb-2 italic uppercase">Global</div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                Presencia en México, Perú, Colombia, USA, Venezuela y Dubái.
              </p>
            </div>

            <div className="p-8 rounded-[32px] bg-[#0f172a] border border-white/5 flex flex-col justify-center text-center items-center group hover:border-cyan-500/50 transition-all">
              <Image 
                src="/logo2.png" 
                alt="X" 
                width={60} 
                height={60} 
                className="mb-4 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform" 
              />
              <div className="text-3xl font-black text-white mb-2 italic tracking-tighter uppercase">X-Learning</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Innovación Educativa 2026
              </p>
            </div>
            
            <div className="sm:col-span-2 p-10 rounded-[32px] bg-gradient-to-br from-slate-900 to-black border border-white/10 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-white font-black italic uppercase text-2xl mb-2">Misión Institucional</h4>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                  Formar personas bilingües altamente competitivas para integrarse con éxito en el ámbito laboral y social.
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-20 transition-transform group-hover:scale-110">
                {/* Logo original en el fondo con su color */}
                <Image src="/logo.png" alt="Logo Background" width={300} height={100} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center">
          {/* Logo en su color original */}
          <Image 
            src="/logo.png" 
            alt="X-Learning Online" 
            width={160} 
            height={40} 
            className="object-contain"
          />
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
            © 2026 X-Learning Online // Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}