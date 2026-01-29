"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Award, Home, Mic, MicOff, Send, Volume2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../../src/firebase/config";

export default function SpeakingModule() {
  const router = useRouter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  // Frases de práctica (esto luego lo puedes traer de tu API de IA)
  const [phrases] = useState([
    "Technology is changing the way we communicate every day.",
    "Learning a new language opens many doors for your future career.",
    "Consistency is the key to mastering any new skill in life."
  ]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) { setUserUid(user.uid); setLoading(false); }
      else { router.replace("/login"); }
    });
    return () => unsub();
  }, [router]);

  // Configuración de Reconocimiento de Voz (Web Speech API)
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Tu navegador no soporta reconocimiento de voz.");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const updateFirebaseProgress = async (finalPercentage: number) => {
    if (!userUid) return;
    try {
      const progressRef = doc(db, "user_progress", userUid);
      await setDoc(progressRef, {
        modules: { speaking: finalPercentage },
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) { console.error(e); }
  };

  const handleNext = async () => {
    // Lógica simple de evaluación (puedes mejorarla con IA después)
    const target = phrases[currentStep].toLowerCase().replace(/[.,]/g, "");
    const spoken = transcript.toLowerCase();
    
    // Si la frase grabada incluye al menos el 70% de las palabras, lo damos por bueno
    if (spoken.length > target.length * 0.7) {
      setScore(prev => prev + 1);
    }

    if (currentStep < phrases.length - 1) {
      setCurrentStep(prev => prev + 1);
      setTranscript("");
    } else {
      const finalPercentage = Math.round(((score + 1) / phrases.length) * 100);
      await updateFirebaseProgress(finalPercentage);
      setShowResult(true);
    }
  };

  const playText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <Image src="/logo2.png" alt="X" width={80} height={80} className="animate-pulse" />
    </div>
  );

  if (showResult) {
    const finalScore = Math.round((score / phrases.length) * 100);
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/50 backdrop-blur-3xl border border-emerald-500/20 p-12 rounded-[50px] text-center max-w-md w-full shadow-2xl">
          <Award className="mx-auto text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]" size={80} />
          <h2 className="text-5xl font-black italic uppercase mb-2">{finalScore}%</h2>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-center w-full">Speaking Mastery</p>
          <div className="space-y-4">
            <button onClick={() => router.push("/modulos")} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-xl">Continuar</button>
            <button onClick={() => router.push("/dashboard")} className="w-full py-4 text-slate-500 font-black uppercase text-[9px] tracking-[0.3em] hover:text-white transition-all flex items-center justify-center gap-2"><Home size={14} /> Back to Hub</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden flex flex-col selection:bg-emerald-500/30">
      <style jsx global>{`::-webkit-scrollbar { display: none; }`}</style>
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/modulos" className="p-2 hover:bg-white/5 rounded-lg transition-colors"><ArrowLeft size={22} /></Link>
          <Image src="/logo.png" alt="Logo" width={120} height={30} />
        </div>
        <div className="bg-emerald-500/10 px-5 py-2 rounded-2xl border border-emerald-500/30 text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">
           Speaking Protocol: {currentStep + 1} / {phrases.length}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 mt-16">
        <div className="max-w-2xl w-full">
          {/* Card de la Frase */}
          <motion.div key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-12 rounded-[50px] mb-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Listen and Repeat</p>
            <h2 className="text-3xl font-black italic uppercase leading-tight text-white mb-8">{phrases[currentStep]}</h2>
            <button onClick={() => playText(phrases[currentStep])} className="p-4 bg-emerald-500/10 rounded-full text-emerald-400 hover:bg-emerald-500 hover:text-[#020617] transition-all">
              <Volume2 size={32} />
            </button>
          </motion.div>

          {/* Área de Grabación */}
          <div className="flex flex-col items-center gap-8">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={startSpeechRecognition}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${isListening ? "bg-red-500 animate-pulse shadow-red-500/40" : "bg-emerald-500 shadow-emerald-500/40"}`}
            >
              {isListening ? <MicOff size={40} className="text-white" /> : <Mic size={40} className="text-[#020617]" />}
            </motion.button>

            <div className="h-20 w-full text-center">
              <AnimatePresence>
                {transcript && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 font-bold italic text-lg uppercase tracking-tight">
                    "{transcript}"
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button 
              disabled={!transcript}
              onClick={handleNext}
              className="w-full max-w-xs py-6 bg-white text-[#020617] rounded-3xl font-black uppercase text-xs tracking-[0.3em] disabled:opacity-20 hover:bg-emerald-400 transition-all flex items-center justify-center gap-3"
            >
              Confirm Recording <Send size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
