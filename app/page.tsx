"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Facebook,
  Globe,
  LogIn,
  Shield,
  UserPlus,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    { 
      text: "Método 100% hablado y dinámico", 
      icon: Zap,
      desc: "Olvida las clases aburridas. Aquí interactúas en tiempo real con situaciones reales desde el primer segundo de entrenamiento." 
    },
    { 
      text: "Sin libros ni memorización innecesaria", 
      icon: BookOpen,
      desc: "Aprendizaje orgánico basado en la neurociencia: adquirimos el idioma como aprendiste a hablar de niño, sin gramática tediosa." 
    },
    { 
      text: "Certificaciones nacionales e internacionales", 
      icon: Award,
      desc: "Preparamos tu perfil para obtener certificaciones oficiales que validen tu talento en cualquier empresa global." 
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-[100] bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
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
            X-Learning Online es una microempresa dedicada a que aprendas de forma rápida, eliminando el método convencional de libros y gramática.
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
              {features.map((item, idx) => (
                <div 
                  key={idx} 
                  className="relative"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <AnimatePresence>
                    {hoveredIndex === idx && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-0 mb-4 z-50 w-72 p-5 bg-[#132448] border border-cyan-500/30 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                      >
                        <p className="text-xs font-medium text-cyan-100 leading-relaxed italic">
                          {item.desc}
                        </p>
                        <div className="absolute top-[100%] left-6 w-4 h-4 bg-[#132448] border-r border-b border-cyan-500/30 rotate-45 translate-y-2" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0f172a] border border-white/5 hover:border-cyan-500/30 transition-all cursor-help shadow-inner group">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500 transition-colors">
                      <item.icon className="text-cyan-400 group-hover:text-[#020617]" size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-200 uppercase tracking-tight group-hover:text-white">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

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
          </div>
        </div>
      </section>

      {/* --- SOCIAL MEDIA SECTION --- */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-[#070c1b]">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-block mb-6 px-6 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400">Comunidad Oficial</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase mb-4 tracking-tighter">
            ¡Visítanos en nuestras <span className="text-cyan-500">redes sociales!</span>
          </h2>
          <p className="text-slate-500 mb-16 font-bold uppercase tracking-widest text-xs">
            Únete a la revolución bilingüe de X-Learning Online
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Facebook Card */}
            <a 
              href="https://www.facebook.com/share/14UxhLcNhg8/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative p-10 rounded-[40px] bg-[#0f172a] border border-white/5 transition-all hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-600/30 group-hover:scale-110 transition-transform">
                  <Facebook size={32} className="text-white" />
                </div>
                <span className="text-white font-black italic uppercase text-2xl tracking-tighter">Facebook</span>
                <span className="text-blue-500 text-[10px] font-black uppercase mt-2 tracking-widest">@x_learningonline</span>
              </div>
            </a>

            {/* WhatsApp Card */}
            <a 
              href="https://wa.me/message/TU_LINK_AQUI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative p-10 rounded-[40px] bg-[#0f172a] border border-white/5 transition-all hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.12.553 4.189 1.606 6.011L0 24l6.117-1.605a11.803 11.803 0 005.925 1.597h.005c6.632 0 12.031-5.391 12.035-12.027a11.799 11.799 0 00-3.53-8.508z"/>
                  </svg>
                </div>
                <span className="text-white font-black italic uppercase text-2xl tracking-tighter">WhatsApp</span>
                <span className="text-emerald-500 text-[10px] font-black uppercase mt-2 tracking-widest">Soporte Directo</span>
              </div>
            </a>

            {/* TikTok Card */}
            <a 
              href="https://www.tiktok.com/@x_learningonline?_r=1&_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative p-10 rounded-[40px] bg-[#0f172a] border border-white/5 transition-all hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center mb-6 shadow-xl shadow-white/10 group-hover:scale-110 transition-transform">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="black"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.31-2.34-.25-3.41.33-.71.38-1.27 1.03-1.57 1.77-.3.72-.38 1.52-.22 2.29.17.82.61 1.59 1.25 2.11.85.73 2.01.99 3.09.73 1.18-.24 2.19-1.03 2.67-2.1.23-.52.33-1.1.33-1.67-.01-4.71-.01-9.42-.01-14.13z"/></svg>
                </div>
                <span className="text-white font-black italic uppercase text-2xl tracking-tighter">TikTok</span>
                <span className="text-slate-400 text-[10px] font-black uppercase mt-2 tracking-widest">@x_learningonline</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/5 px-6 bg-[#020617]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
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