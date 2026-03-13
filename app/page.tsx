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
  Zap,
  Instagram,
  Youtube,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    { 
      text: "Inmersión Conversacional", 
      icon: Zap,
      desc: "Desarrollamos fluidez mediante interacción real desde la primera sesión, optimizando el tiempo de aprendizaje." 
    },
    { 
      text: "Metodología Cognitiva", 
      icon: BookOpen,
      desc: "Basado en la adquisición orgánica del lenguaje, eliminando la memorización de gramática técnica innecesaria." 
    },
    { 
      text: "Proyección Internacional", 
      icon: Award,
      desc: "Certificaciones oficiales que validan tus competencias para el mercado laboral global y académico." 
    }
  ];

  const socialLinks = [
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/@xlearningonline", color: "red", handle: "@xlearningonline" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/x_learningonline", color: "pink", handle: "@x_learningonline" },
    { name: "TikTok", icon: "tiktok", href: "https://www.tiktok.com/@x_learningonline", color: "white", handle: "@x_learningonline" },
    { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/share/14UxhLcNhg8/", color: "blue", handle: "@x_learningonline" }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* --- BACKGROUND AMBIENT GLOW --- */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-30 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle 600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.12), transparent 80%)`
        }}
      />

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-[100] bg-[#020617]/60 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Image src="/logo.png" alt="X-Learning Online" width={170} height={45} className="object-contain" priority />
          </motion.div>

          <div className="flex items-center gap-8">
            <Link 
              href="/login" 
              className="group flex items-center gap-2 px-7 py-3 bg-white text-[#020617] rounded-full text-[11px] font-bold tracking-[0.15em]  transition-all hover:bg-cyan-400 shadow-lg shadow-white/5"
            >
              <LogIn size={15} />
              Acceso
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative min-h-[90vh] flex items-center justify-center pt-20 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/20 mb-10"
          >
            <Shield size={14} className="text-cyan-400" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-cyan-400 ">Laboratorio de Especialización Lingüística</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white italic tracking-tighter mb-8 leading-[0.95] "
          >
            Domina el Inglés <br />
            <span className="text-cyan-500">Sin Fronteras.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-12 leading-relaxed"
          >
            Transformamos la enseñanza tradicional en un sistema dinámico de alto rendimiento, diseñado para profesionales que buscan resultados inmediatos.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              href="/login" 
              className="group px-12 py-5 bg-cyan-600 text-white rounded-2xl font-bold text-xs tracking-[0.2em] flex items-center gap-3 hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/20"
            >
              INICIAR PROGRAMA <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </header>

      {/* --- BENTO INFO SECTION --- */}
      <section className="py-24 px-6 bg-[#03081a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card: Metodología */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}
              className="lg:col-span-2 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-cyan-500" />
                </div>
                <h2 className="text-4xl font-black text-white italic  tracking-tighter">
                  Educación <span className="text-cyan-500">Disruptiva</span>
                </h2>
                <p className="max-w-lg text-slate-400 leading-relaxed font-medium">
                  Nuestro enfoque prescinde de los métodos convencionales basados en la teoría pasiva. Priorizamos la práctica activa y el uso del idioma en contextos reales y corporativos.
                </p>
              </div>
            </motion.div>

            {/* Card: Alcance Global */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}
              className="p-10 rounded-[2.5rem] bg-cyan-500 text-[#020617] flex flex-col justify-between"
            >
              <Globe size={40} />
              <div>
                <h3 className="text-4xl font-black italic mb-2 tracking-tighter">ALCANCE</h3>
                <p className="text-[10px] font-black tracking-widest  opacity-80">Presencia Internacional: MX, PE, CO, US, AE.</p>
              </div>
            </motion.div>

            {/* Features loop */}
            {features.map((item, i) => (
              <motion.div 
                key={i}
                whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 group hover:border-cyan-500/30 transition-colors"
              >
                <item.icon className="text-cyan-500 mb-6" size={28} />
                <h4 className="text-lg font-black text-white italic mb-3 ">{item.text}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SOCIAL ECOSYSTEM --- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-16 ">
            Ecosistema <span className="text-cyan-500">Digital</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {socialLinks.map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -8 }}
                className="p-10 rounded-[2.5rem] bg-[#0f172a]/30 border border-white/5 flex flex-col items-center group transition-all"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110
                  ${social.color === 'red' ? 'bg-red-600' : ''}
                  ${social.color === 'pink' ? 'bg-gradient-to-tr from-yellow-400 via-pink-600 to-purple-600' : ''}
                  ${social.color === 'white' ? 'bg-white text-black' : ''}
                  ${social.color === 'blue' ? 'bg-blue-600' : ''}
                `}>
                   {social.name === "TikTok" ? (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.31-2.34-.25-3.41.33-.71.38-1.27 1.03-1.57 1.77-.3.72-.38 1.52-.22 2.29.17.82.61 1.59 1.25 2.11.85.73 2.01.99 3.09.73 1.18-.24 2.19-1.03 2.67-2.1.23-.52.33-1.1.33-1.67-.01-4.71-.01-9.42-.01-14.13z"/>
                      </svg>
                    ) : (
                      // @ts-ignore
                      <social.icon size={30} className={social.color === 'white' ? 'text-black' : 'text-white'} />
                    )}
                </div>
                <span className="text-white font-black italic tracking-tight  text-lg">{social.name}</span>
                <span className="text-[10px] font-bold text-slate-500 tracking-widest mt-1">{social.handle}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-16 border-t border-white/5 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <Image src="/logo.png" alt="X-Learning" width={150} height={40} className="opacity-70 mb-4 mx-auto md:mx-0" />
            <p className="text-[9px] font-bold text-slate-600 tracking-[0.4em] ">Excelencia en Capacitación Lingüística</p>
          </div>
          <div className="text-center md:text-right space-y-2">
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.1em]">© 2026 X-Learning Online System. Todos los derechos reservados.</p>
            <p className="text-[9px] font-bold text-cyan-500/50 italic tracking-widest ">Innovación Educativa de Clase Mundial</p>
          </div>
        </div>
      </footer>
    </div>
  );
}