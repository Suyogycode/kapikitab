"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Cuboid, FileText, 
  PenTool, BrainCircuit, ArrowRight, PlayCircle,
  Sun, Moon
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] dark:bg-[#1C1F2B] text-stone-800 dark:text-slate-200 font-sans selection:bg-emerald-100 dark:selection:bg-blue-500/30 relative transition-colors duration-500">
      {/* Base Background: Lifted to #1C1F2B */}
      
      {/* Sticky Anchor Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#FDFCF8]/90 dark:bg-[#1C1F2B]/90 backdrop-blur-md border-b border-stone-200/50 dark:border-slate-700/50 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-serif font-bold tracking-tight text-emerald-900 dark:text-blue-100">
            Kapikitab.
          </Link>
          
          <div className="hidden md:flex items-center space-x-10 text-sm font-medium text-stone-500 dark:text-slate-400">
            <a href="#philosophy" className="hover:text-emerald-800 dark:hover:text-blue-300 transition-colors">Philosophy</a>
            <a href="#simulation" className="hover:text-emerald-800 dark:hover:text-blue-300 transition-colors">Simulation</a>
            <a href="#solution" className="hover:text-emerald-800 dark:hover:text-blue-300 transition-colors">Solution</a>
          </div>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={toggleTheme} 
              className="relative w-14 h-8 flex items-center bg-stone-200 dark:bg-[#0E1017] rounded-full p-1 transition-colors duration-300"
              aria-label="Toggle Dark Mode"
            >
              <motion.div
                layout
                className="w-6 h-6 bg-white dark:bg-[#282C3D] rounded-full shadow-sm flex items-center justify-center"
                animate={{ x: isDark ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
              >
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
                )}
              </motion.div>
            </button>

            {status === "loading" ? (
               <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-slate-700 animate-pulse" />
            ) : status === "authenticated" && session?.user?.name ? (
               <Link href="/dashboard">
                 <div className="w-10 h-10 rounded-full bg-emerald-800 dark:bg-blue-600/80 text-white flex items-center justify-center font-medium shadow-sm hover:bg-emerald-700 dark:hover:bg-blue-500 transition-colors">
                   {session.user.name.charAt(0).toUpperCase()}
                 </div>
               </Link>
            ) : (
               <Link href="/signup" className="text-sm font-medium bg-stone-900 dark:bg-[#282C3D] text-white px-6 py-2.5 rounded-full hover:bg-stone-800 dark:hover:bg-[#34394F] transition-colors shadow-sm border border-transparent dark:border-slate-700">
                 Sign In
               </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-48 pb-32 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl z-10"
        >
          <h1 className="text-6xl md:text-8xl font-serif font-medium text-stone-900 dark:text-slate-100 tracking-tight leading-tight mb-8">
            Visualise your <br className="hidden md:block"/> Concepts.
          </h1>
          <p className="text-xl md:text-2xl text-stone-500 dark:text-slate-400 font-light max-w-2xl mx-auto mb-12">
            Excel in your studies with concept videos, practice quizzes, AI study tools, and interactive AR graphics.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={status === "authenticated" ? "/dashboard" : "/signup"}>
              <button className="px-10 py-4 bg-emerald-800 dark:bg-blue-500 text-white rounded-full text-lg font-medium hover:bg-emerald-950 dark:hover:bg-blue-600 transition-colors shadow-xl dark:shadow-blue-900/20">
                Try Kapikitab
              </button>
            </Link>
          </div>
        </motion.div>
      </header>

      {/* 1. Philosophy Section */}
      <section id="philosophy" className="py-24 md:py-32 border-t border-stone-200/50 dark:border-slate-700/50 bg-white dark:bg-[#222534] px-6 scroll-mt-20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-emerald-700 dark:text-blue-400 uppercase mb-4">Our Philosophy</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-stone-900 dark:text-slate-100 leading-tight mb-6">
              Building intuition <br/> by experiencing the concept.
            </h3>
            <div className="space-y-6 text-lg text-stone-500 dark:text-slate-300 font-light leading-relaxed">
              <p>
                Learning should not be limited to books and classrooms. At Kapikitab, we combine traditional learning with modern technology, helping students master concepts by visualizing them in 3D and practicing to excel in their goals.
              </p>
              <p>
                By integrating artificial intelligence and augmented reality, we aren't just digitizing textbooks—we are creating a personalized, interactive environment where understanding comes naturally, and every student receives personalized tutoring.
              </p>
            </div>
          </div>
          <div className="relative h-96 rounded-3xl bg-[#FDFCF8] dark:bg-[#1C1F2B] border border-stone-100 dark:border-slate-700/80 shadow-sm flex items-center justify-center overflow-hidden transition-colors duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#393E54_1px,transparent_1px)] bg-[length:20px_20px] opacity-60" />
            <div className="relative z-10 flex items-center gap-8">
              <BookOpen className="w-16 h-16 text-stone-300 dark:text-slate-500" strokeWidth={1} />
              <ArrowRight className="w-8 h-8 text-emerald-400 dark:text-blue-400" />
              <BrainCircuit className="w-16 h-16 text-emerald-700 dark:text-blue-300" strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Simulation Section - Lifted slightly to #151821 to prevent true black */}
      <section id="simulation" className="py-24 md:py-32 bg-emerald-950 dark:bg-[#151821] text-emerald-50 dark:text-slate-200 px-6 scroll-mt-20 relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-800/20 dark:bg-blue-900/15 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-emerald-400 dark:text-blue-400 uppercase mb-4">The Simulation Engine</h2>
          <h3 className="text-4xl md:text-6xl font-serif text-white dark:text-slate-100 leading-tight max-w-3xl mx-auto">
            Crisp graphics. <br /> AI-guided exploration.
          </h3>
          <p className="mt-6 text-xl text-emerald-200/80 dark:text-slate-400 font-light max-w-2xl mx-auto">
            Step inside our AR labs. Don't just read about molecular structures or physical forces—interact with them in 3D space while Kapi guides your path to mastery.
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-emerald-900/40 dark:bg-[#1C1F2B]/60 border border-emerald-800/50 dark:border-slate-700/50 rounded-3xl p-8 md:p-12 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center gap-12 transition-colors duration-500">
          <div className="w-full md:w-1/2 aspect-square bg-emerald-950 dark:bg-[#151821] rounded-2xl border border-emerald-800/50 dark:border-slate-700 flex items-center justify-center relative overflow-hidden">
            <Cuboid className="w-24 h-24 text-emerald-400 dark:text-blue-400 animate-pulse" strokeWidth={1} />
            <div className="absolute inset-0 border border-emerald-400/20 dark:border-blue-400/15 rounded-2xl scale-[0.8] opacity-50" />
            <div className="absolute inset-0 border border-emerald-400/10 dark:border-blue-400/10 rounded-2xl scale-[0.6] opacity-30" />
          </div>
          <div className="w-full md:w-1/2 space-y-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-emerald-800/50 dark:bg-[#282C3D] flex items-center justify-center shrink-0 border border-emerald-700/50 dark:border-slate-600">1</div>
              <div>
                <h4 className="text-xl font-medium text-white dark:text-slate-200 mb-2">Visualize in AR</h4>
                <p className="text-emerald-200/70 dark:text-slate-400 font-light">Bring complex concepts into your physical room using your device.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-emerald-800/50 dark:bg-[#282C3D] flex items-center justify-center shrink-0 border border-emerald-700/50 dark:border-slate-600">2</div>
              <div>
                <h4 className="text-xl font-medium text-white dark:text-slate-200 mb-2">AI-Guided Pathways</h4>
                <p className="text-emerald-200/70 dark:text-slate-400 font-light">Get real-time feedback and hints from our intelligence engine as you interact.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Solution Section */}
      <section id="solution" className="py-24 md:py-32 bg-[#FDFCF8] dark:bg-[#1C1F2B] px-6 scroll-mt-20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-emerald-700 dark:text-blue-400 uppercase mb-4">The Solution</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-stone-900 dark:text-slate-100 mb-6">Your complete toolkit for excellence.</h3>
            <p className="text-lg text-stone-500 dark:text-slate-400 font-light max-w-2xl mx-auto">
              Everything you need to study, practice, and excel, unified in one minimalist workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cards changed from #1A1D27 to #282C3D */}
            <div className="bg-white dark:bg-[#282C3D] p-8 rounded-3xl border border-stone-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
              <PlayCircle className="w-10 h-10 text-emerald-700 dark:text-blue-400 mb-6" />
              <h4 className="text-xl font-medium text-stone-900 dark:text-slate-100 mb-3">Animated Videos</h4>
              <p className="text-stone-500 dark:text-slate-400 font-light max-w-2xl">High-quality, distraction-free cinematic lessons that break down heavy topics into digestible concepts.</p>
            </div>

            <div className="bg-white dark:bg-[#282C3D] p-8 rounded-3xl border border-stone-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
              <FileText className="w-10 h-10 text-emerald-700 dark:text-blue-400 mb-6" />
              <h4 className="text-xl font-medium text-stone-900 dark:text-slate-100 mb-3">PYQ & Resources</h4>
              <p className="text-stone-500 dark:text-slate-400 font-light max-w-2xl">Deeply cataloged Previous Year Questions, structured notes, and tailored resources to align with your exact curriculum.</p>
            </div>

            <div className="bg-white dark:bg-[#282C3D] p-8 rounded-3xl border border-stone-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
              <PenTool className="w-10 h-10 text-emerald-700 dark:text-blue-400 mb-6" />
              <h4 className="text-xl font-medium text-stone-900 dark:text-slate-100 mb-3">Practice Questions</h4>
              <p className="text-stone-500 dark:text-slate-400 font-light max-w-2xl">A rigorous, adaptive practice arena that tests your knowledge and fortifies your weak points dynamically.</p>
            </div>

            <div className="bg-emerald-50 dark:bg-[#222534] p-8 rounded-3xl border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow lg:col-span-3 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h4 className="text-2xl font-serif text-emerald-900 dark:text-blue-100 mb-3">AI Homework Solver</h4>
                <p className="text-emerald-700 dark:text-slate-300 font-light max-w-2xl">
                  Stuck on a problem? Upload a photo of your handwritten equation. Our logic engine will break it down into a step-by-step pathway, helping you understand the 'how' and 'why', not just the final answer.
                </p>
              </div>
              <Link href={status === "authenticated" ? "/dashboard" : "/signup"}>
                <button className="px-6 py-3 bg-emerald-800 dark:bg-blue-500 text-white rounded-full font-medium hover:bg-emerald-700 dark:hover:bg-blue-600 transition-colors whitespace-nowrap shadow-sm dark:shadow-blue-900/20">
                  Try the Solver
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Motivational CTA - Lifted from #07080A to #151821 */}
      <section className="py-32 bg-stone-900 dark:bg-[#151821] text-center px-6 relative overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] dark:bg-[radial-gradient(#393E54_1px,transparent_1px)] bg-[length:20px_20px] opacity-20" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-10">
          <h2 className="text-5xl md:text-7xl font-serif font-medium text-white dark:text-slate-100 leading-tight">
            Your foundation for deeper learning.
          </h2>
          <p className="text-xl text-stone-400 dark:text-slate-400 font-light">
            Stop waiting. Start building your intuition today.
          </p>
          <div className="pt-4">
            <Link href={status === "authenticated" ? "/dashboard" : "/signup"}>
              <button className="px-10 py-5 bg-white dark:bg-blue-500 text-stone-900 dark:text-white rounded-full text-xl font-medium hover:scale-105 transition-transform shadow-2xl dark:shadow-blue-900/30">
                Jump Start Your Learning
              </button>
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}