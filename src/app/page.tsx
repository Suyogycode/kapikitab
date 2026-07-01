"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Brain, ArrowRight, ShieldCheck, 
  Atom, Globe, Rocket, BookOpen
} from 'lucide-react';
import Link from 'next/link'; // Replaces useNavigate

export default function Home() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeRight = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeLeft = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 font-sans overflow-x-hidden selection:bg-emerald-100">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#FDFCF8]/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="text-2xl font-serif font-bold tracking-tight text-emerald-900">
            Kapikitab.
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-stone-500">
            <span className="hover:text-stone-900 cursor-pointer transition-colors">Philosophy</span>
            <span className="hover:text-stone-900 cursor-pointer transition-colors">Simulations</span>
            <span className="hover:text-stone-900 cursor-pointer transition-colors">Community</span>
          </div>
          <Link 
            href="/signup"
            className="text-sm font-medium bg-stone-900 text-white px-5 py-2.5 rounded-full hover:bg-stone-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-8 pt-40 pb-32 flex flex-col lg:flex-row items-center justify-between min-h-screen gap-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeRight}
          className="max-w-2xl z-10 lg:w-1/2"
        >
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm mb-8">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span className="text-sm font-medium text-stone-600">The next generation of learning</span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight text-stone-900 leading-[1.05] mb-8">
            Question <br />
            everything.
          </h1>
          
          <p className="text-xl md:text-2xl text-stone-500 leading-relaxed mb-12 font-light max-w-lg">
            We turn abstract concepts into breathtaking interactive journeys. Don't just memorize the world—explore it, simulate it, and understand it.
          </p>

          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-emerald-800 text-white rounded-full text-lg font-medium overflow-hidden transition-all hover:shadow-2xl hover:shadow-emerald-900/20"
            >
              <span className="mr-2">Start Your Journey</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Floating Cinematic Composition */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeLeft}
          className="relative lg:w-1/2 h-125 w-full flex items-center justify-center"
        >
          <div className="absolute w-100 h-100 bg-emerald-100/50 rounded-full blur-3xl" />
          <div className="absolute w-75 h-75 bg-amber-100/50 rounded-full blur-3xl translate-x-20 translate-y-20" />
          
          <motion.div 
            animate={{ y: [-10, 10, -10], rotate: [0, 2, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-10 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl"
          >
            <Atom size={48} className="text-emerald-700" strokeWidth={1.5} />
          </motion.div>

          <motion.div 
            animate={{ y: [10, -10, 10], rotate: [0, -2, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-10 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl flex flex-col gap-3"
          >
            <Brain size={40} className="text-stone-700" strokeWidth={1.5} />
            <div className="w-24 h-2 bg-stone-200 rounded-full" />
            <div className="w-16 h-2 bg-stone-200 rounded-full" />
          </motion.div>

          <div className="relative z-10 w-64 h-64 bg-stone-900 rounded-full flex items-center justify-center shadow-2xl border-8 border-white">
            <Globe size={80} className="text-white" strokeWidth={1} />
          </div>
        </motion.div>
      </main>

      {/* Gamified Mapping Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 flex flex-col-reverse lg:flex-row items-center gap-20">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeRight}
            className="lg:w-1/2 relative h-100 w-full flex items-center"
          >
             <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px] opacity-50 rounded-3xl" />
             <div className="relative z-10 space-y-6 ml-10">
               <div className="flex items-center gap-4">
                 <div className="h-16 w-16 rounded-full bg-emerald-400 flex items-center justify-center shadow-lg border-4 border-white z-10"><ShieldCheck className="text-white" /></div>
                 <div className="h-1 w-24 bg-emerald-400 -ml-8" />
               </div>
               <div className="flex items-center gap-4 ml-16">
                 <div className="h-16 w-16 rounded-full bg-stone-900 flex items-center justify-center shadow-lg border-4 border-white z-10"><Rocket className="text-white" /></div>
                 <div className="h-1 w-24 bg-stone-200 -ml-8" />
               </div>
               <div className="flex items-center gap-4 ml-32">
                 <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-stone-100 z-10"><BookOpen className="text-stone-300" /></div>
               </div>
             </div>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeLeft}
            className="lg:w-1/2 space-y-8"
          >
            <h2 className="text-5xl font-serif font-medium text-stone-900 leading-tight">
              A map for every mind.
            </h2>
            <p className="text-xl text-stone-500 font-light leading-relaxed">
              Forget endless lists and sterile dashboards. Your curriculum is a living, breathing landscape. Conquer topics like checkpoints, trace your unique path, and watch your knowledge grow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-40 bg-stone-900 text-center px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[length:20px_20px] opacity-20" />
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="relative z-10 max-w-3xl mx-auto space-y-10"
        >
          <h2 className="text-5xl md:text-7xl font-serif font-medium text-white leading-tight">
            Ready to change <br/> how you see the world?
          </h2>
          <Link href="/signup">
            <button className="inline-flex items-center justify-center px-10 py-5 bg-white text-stone-900 rounded-full text-xl font-medium transition-transform hover:scale-105">
              Create Your Profile
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}