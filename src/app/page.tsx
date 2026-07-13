"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Cuboid, FileText, 
  PenTool, BrainCircuit, ArrowRight, PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  // Enable smooth scrolling for the entire page
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 font-sans selection:bg-emerald-100 relative">
      
      {/* Sticky Anchor Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#FDFCF8]/90 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-serif font-bold tracking-tight text-emerald-900">
            Kapikitab.
          </Link>
          <div className="hidden md:flex space-x-10 text-sm font-medium text-stone-500">
            <a href="#philosophy" className="hover:text-emerald-800 transition-colors">Philosophy</a>
            <a href="#simulation" className="hover:text-emerald-800 transition-colors">Simulation</a>
            <a href="#solution" className="hover:text-emerald-800 transition-colors">Solution</a>
          </div>
          
          {/* Auth Button */}
          {status === "loading" ? (
             <div className="w-10 h-10 rounded-full bg-stone-200 animate-pulse" />
          ) : status === "authenticated" && session?.user?.name ? (
             <Link href="/dashboard">
               <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-medium shadow-sm hover:bg-emerald-700 transition-colors">
                 {session.user.name.charAt(0).toUpperCase()}
               </div>
             </Link>
          ) : (
             <Link href="/signup" className="text-sm font-medium bg-stone-900 text-white px-6 py-2.5 rounded-full hover:bg-stone-800 transition-colors shadow-sm">
               Sign In
             </Link>
          )}
        </div>
      </nav>

      {/* Hero Section (NotebookLM Style: Minimal, Centered) */}
      <header className="relative pt-48 pb-32 flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl z-10"
        >
          <h1 className="text-6xl md:text-8xl font-serif font-medium text-stone-900 tracking-tight leading-tight mb-8">
            Visualise your <br className="hidden md:block"/> Concepts.
          </h1>
          <p className="text-xl md:text-2xl text-stone-500 font-light max-w-2xl mx-auto mb-12">
            Excel in your studies. Concept Videos, Practice and Quiz, <br/> AI Study Tools, Graphics, AR.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={status === "authenticated" ? "/dashboard" : "/signup"}>
              <button className="px-10 py-4 bg-emerald-800 text-white rounded-full text-lg font-medium hover:bg-emerald-950 transition-colors shadow-xl hover:shadow-2xl">
                Try Kapikitab
              </button>
            </Link>
          </div>
        </motion.div>
      </header>

      {/* 1. Philosophy Section */}
      <section id="philosophy" className="py-24 md:py-32 border-t border-stone-200/50 bg-white px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-emerald-700 uppercase mb-4">Our Philosophy</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight mb-6">
              Building intuition <br/> by experiencing the concept.
            </h3>
            <div className="space-y-6 text-lg text-stone-500 font-light leading-relaxed">
              <p>
                Learning should not be limited to books and classrooms. At Kapikitab, we combine traditional learning with modern technology, helping students master concepts by visualizing them in 3D and practicing to excel in their goals.
              </p>
              <p>
                By integrating artificial intelligence and augmented reality, we aren't just digitizing textbooks—we are creating a personalized, interactive environment where understanding comes naturally, and every student receives personalized tutoring.
              </p>
            </div>
          </div>
          <div className="relative h-96 rounded-3xl bg-[#FDFCF8] border border-stone-100 shadow-sm flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:20px_20px] opacity-60" />
            <div className="relative z-10 flex items-center gap-8">
              <BookOpen className="w-16 h-16 text-stone-300" strokeWidth={1} />
              <ArrowRight className="w-8 h-8 text-emerald-400" />
              <BrainCircuit className="w-16 h-16 text-emerald-700" strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Simulation Section */}
      <section id="simulation" className="py-24 md:py-32 bg-emerald-950 text-emerald-50 px-6 scroll-mt-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-800/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-emerald-400 uppercase mb-4">The Simulation Engine</h2>
          <h3 className="text-4xl md:text-6xl font-serif text-white leading-tight max-w-3xl mx-auto">
            Crisp graphics. <br /> AI-guided exploration.
          </h3>
          <p className="mt-6 text-xl text-emerald-200/80 font-light max-w-2xl mx-auto">
            Step inside our AR labs. Don't just read about molecular structures or physical forces—interact with them in 3D space while Kapi guides your path to mastery.
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-emerald-900/40 border border-emerald-800/50 rounded-3xl p-8 md:p-12 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 aspect-square bg-emerald-950 rounded-2xl border border-emerald-800/50 flex items-center justify-center relative overflow-hidden">
            <Cuboid className="w-24 h-24 text-emerald-400 animate-pulse" strokeWidth={1} />
            <div className="absolute inset-0 border border-emerald-400/20 rounded-2xl scale-[0.8] opacity-50" />
            <div className="absolute inset-0 border border-emerald-400/10 rounded-2xl scale-[0.6] opacity-30" />
          </div>
          <div className="w-full md:w-1/2 space-y-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-emerald-800/50 flex items-center justify-center shrink-0 border border-emerald-700/50">1</div>
              <div>
                <h4 className="text-xl font-medium text-white mb-2">Visualize in AR</h4>
                <p className="text-emerald-200/70 font-light">Bring complex concepts into your physical room using your device.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-emerald-800/50 flex items-center justify-center shrink-0 border border-emerald-700/50">2</div>
              <div>
                <h4 className="text-xl font-medium text-white mb-2">AI-Guided Pathways</h4>
                <p className="text-emerald-200/70 font-light">Get real-time feedback and hints from our intelligence engine as you interact.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Solution Section */}
      <section id="solution" className="py-24 md:py-32 bg-[#FDFCF8] px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-emerald-700 uppercase mb-4">The Solution</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6">Your complete toolkit for excellence.</h3>
            <p className="text-lg text-stone-500 font-light max-w-2xl mx-auto">
              Everything you need to study, practice, and excel, unified in one minimalist workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <PlayCircle className="w-10 h-10 text-emerald-700 mb-6" />
              <h4 className="text-xl font-medium text-stone-900 mb-3">Animated Videos</h4>
              <p className="text-stone-500 font-light max-w-2xl">High-quality, distraction-free cinematic lessons that break down heavy topics into digestible concepts.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <FileText className="w-10 h-10 text-emerald-700 mb-6" />
              <h4 className="text-xl font-medium text-stone-900 mb-3">PYQ & Resources</h4>
              <p className="text-stone-500 font-light max-w-2xl">Deeply cataloged Previous Year Questions, structured notes, and tailored resources to align with your exact curriculum.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <PenTool className="w-10 h-10 text-emerald-700 mb-6" />
              <h4 className="text-xl font-medium text-stone-900 mb-3">Practice Questions</h4>
              <p className="text-stone-500 font-light max-w-2xl">A rigorous, adaptive practice arena that tests your knowledge and fortifies your weak points dynamically.</p>
            </div>

            <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow lg:col-span-3 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h4 className="text-2xl font-serif text-emerald-900 mb-3">AI Homework Solver</h4>
                <p className="text-emerald-700 font-light max-w-2xl">
                  Stuck on a problem? Upload a photo of your handwritten equation. Our logic engine will break it down into a step-by-step pathway, helping you understand the 'how' and 'why', not just the final answer.
                </p>
              </div>
              <Link href={status === "authenticated" ? "/dashboard" : "/signup"}>
                <button className="px-6 py-3 bg-emerald-800 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap">
                  Try the Solver
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Motivational CTA */}
      <section className="py-32 bg-stone-900 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[length:20px_20px] opacity-20" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-10">
          <h2 className="text-5xl md:text-7xl font-serif font-medium text-white leading-tight">
            Your foundation for deeper learning.
          </h2>
          <p className="text-xl text-stone-400 font-light">
            Stop waiting. Start building your intuition today.
          </p>
          <div className="pt-4">
            <Link href={status === "authenticated" ? "/dashboard" : "/signup"}>
              <button className="px-10 py-5 bg-white text-stone-900 rounded-full text-xl font-medium hover:scale-105 transition-transform shadow-2xl">
                Jump Start Your Learning
              </button>
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}