"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Sparkles, Brain, ArrowRight, ShieldCheck, 
  Atom, Globe, Rocket, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; // NEW IMPORT

export default function Home() {
  const { data: session, status } = useSession(); // FETCHING USER SESSION

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeRight: Variants = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeLeft: Variants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 font-sans overflow-x-hidden selection:bg-emerald-100">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#FDFCF8]/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center">
          <div className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-emerald-900">
            Kapikitab.
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-stone-500">
            <span className="hover:text-stone-900 cursor-pointer transition-colors">Philosophy</span>
            <span className="hover:text-stone-900 cursor-pointer transition-colors">Simulations</span>
            <span className="hover:text-stone-900 cursor-pointer transition-colors">Community</span>
          </div>
          
          {/* DYNAMIC AUTHENTICATION BUTTON */}
          {status === "loading" ? (
             <div className="w-10 h-10 rounded-full bg-stone-200 animate-pulse" />
          ) : status === "authenticated" && session?.user?.name ? (
             <Link href="/dashboard">
               <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-medium text-lg shadow-md hover:bg-emerald-700 transition-colors">
                 {session.user.name.charAt(0).toUpperCase()}
               </div>
             </Link>
          ) : (
             <Link href="/signup" className="text-xs sm:text-sm font-medium bg-stone-900 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-stone-800 transition-colors">
               Sign In
             </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-32 pb-20 md:pt-40 md:pb-32 flex flex-col lg:flex-row items-center justify-between min-h-screen gap-12 lg:gap-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeRight}
          className="max-w-2xl z-10 lg:w-1/2 mt-12 lg:mt-0"
        >
          <div className="inline-flex items-center space-x-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-stone-200 shadow-sm mb-6 sm:mb-8">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span className="text-xs sm:text-sm font-medium text-stone-600">The next generation of learning</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight text-stone-900 leading-[1.05] mb-6 sm:mb-8">
            Question <br />
            everything.
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-stone-500 leading-relaxed mb-8 sm:mb-12 font-light max-w-lg">
            We turn abstract concepts into breathtaking interactive journeys. Don&apos;t just memorize the world—explore it, simulate it, and understand it.
          </p>

          <Link href={status === "authenticated" ? "/dashboard" : "/signup"}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-4 bg-emerald-800 text-white rounded-full text-base sm:text-lg font-medium overflow-hidden transition-all hover:shadow-2xl hover:shadow-emerald-900/20"
            >
              <span className="mr-2">{status === "authenticated" ? "Go to Dashboard" : "Start Your Journey"}</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Floating Cinematic Composition */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeLeft}
          className="relative lg:w-1/2 h-[20rem] sm:h-[25rem] md:h-[31.25rem] w-full flex items-center justify-center"
        >
          <div className="absolute w-[15rem] h-[15rem] sm:w-[25rem] sm:h-[25rem] bg-emerald-100/50 rounded-full blur-3xl" />
          <div className="absolute w-[12rem] h-[12rem] sm:w-[18.75rem] sm:h-[18.75rem] bg-amber-100/50 rounded-full blur-3xl translate-x-10 translate-y-10 sm:translate-x-20 sm:translate-y-20" />

          <motion.div 
            animate={{ y: [-10, 10, -10], rotate: [0, 2, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-2 right-2 sm:top-10 sm:right-10 bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white shadow-xl"
          >
            <Atom className="text-emerald-700 w-8 h-8 sm:w-12 sm:h-12" strokeWidth={1.5} />
          </motion.div>

          <motion.div 
            animate={{ y: [10, -10, 10], rotate: [0, -2, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-2 left-2 sm:bottom-10 sm:left-10 bg-white/80 backdrop-blur-xl p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white shadow-xl flex flex-col gap-2 sm:gap-3"
          >
            <Brain className="text-stone-700 w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
            <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-stone-200 rounded-full" />
            <div className="w-10 sm:w-16 h-1.5 sm:h-2 bg-stone-200 rounded-full" />
          </motion.div>

          <div className="relative z-10 w-40 h-40 sm:w-64 sm:h-64 bg-stone-900 rounded-full flex items-center justify-center shadow-2xl border-4 sm:border-8 border-white">
            <Globe className="text-white w-16 h-16 sm:w-20 sm:h-20" strokeWidth={1} />
          </div>
        </motion.div>
      </main>

      {/* Gamified Mapping Section */}
      <section className="py-20 md:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeRight}
            className="lg:w-1/2 relative h-[20rem] sm:h-[25rem] w-full flex items-center"
          >
             <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px] opacity-50 rounded-3xl" />
             <div className="relative z-10 space-y-6 ml-4 sm:ml-10">
               <div className="flex items-center gap-2 sm:gap-4">
                 <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-emerald-400 flex items-center justify-center shadow-lg border-2 sm:border-4 border-white z-10"><ShieldCheck className="text-white w-5 h-5 sm:w-6 sm:h-6" /></div>
                 <div className="h-1 w-16 sm:w-24 bg-emerald-400 -ml-6 sm:-ml-8" />
               </div>
               <div className="flex items-center gap-2 sm:gap-4 ml-8 sm:ml-16">
                 <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-stone-900 flex items-center justify-center shadow-lg border-2 sm:border-4 border-white z-10"><Rocket className="text-white w-5 h-5 sm:w-6 sm:h-6" /></div>
                 <div className="h-1 w-16 sm:w-24 bg-stone-200 -ml-6 sm:-ml-8" />
               </div>
               <div className="flex items-center gap-2 sm:gap-4 ml-16 sm:ml-32">
                 <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white flex items-center justify-center shadow-lg border-2 sm:border-4 border-stone-100 z-10"><BookOpen className="text-stone-300 w-5 h-5 sm:w-6 sm:h-6" /></div>
               </div>
             </div>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeLeft}
            className="lg:w-1/2 space-y-6 sm:space-y-8"
          >
            <h2 className="text-4xl sm:text-5xl font-serif font-medium text-stone-900 leading-tight">
              A map for every mind.
            </h2>
            <p className="text-lg sm:text-xl text-stone-500 font-light leading-relaxed">
              Forget endless lists and sterile dashboards. Your curriculum is a living, breathing landscape. Conquer topics like checkpoints, trace your unique path, and watch your knowledge grow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-40 bg-stone-900 text-center px-6 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[length:20px_20px] opacity-20" />
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="relative z-10 max-w-3xl mx-auto space-y-8 sm:space-y-10"
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-medium text-white leading-tight">
            Ready to change <br className="hidden sm:block" /> how you see the world?
          </h2>
          <Link href={status === "authenticated" ? "/dashboard" : "/signup"}>
            <button className="inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 bg-white text-stone-900 rounded-full text-lg sm:text-xl font-medium transition-transform hover:scale-105">
              {status === "authenticated" ? "Return to Dashboard" : "Create Your Profile"}
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}