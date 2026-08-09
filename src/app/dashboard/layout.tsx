"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, BrainCircuit, Map, Beaker, Compass, User, Book, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export const DashboardContext = React.createContext({
  currentClassId: 'c12', 
  activeSubject: 'math',
  setActiveSubject: (subject: string) => {}
});

const LiquidGlassMenu = ({ items, activeItem, setActiveItem, isHorizontal = true }: any) => {
  return (
    <div className={`flex ${isHorizontal ? 'flex-row space-x-2 overflow-x-auto no-scrollbar' : 'flex-col space-y-2'} p-2 bg-white/70 dark:bg-[#282C3D]/80 backdrop-blur-2xl border border-white/40 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-4xl transition-colors duration-500`}>
      {items.map((item: any) => {
        const isActive = activeItem === item.id;
        return (
          <button key={item.id} onClick={() => setActiveItem(item.id)} className="relative px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-light font-serif tracking-wider transition-colors z-10 whitespace-nowrap">
            {isActive && <motion.div layoutId={`liquidHighlight-${items[0].id}`} className="absolute inset-0 bg-white/90 dark:bg-slate-700/80 shadow-sm border border-white/50 dark:border-slate-600/50 rounded-full -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            <span className={isActive ? 'text-stone-800 dark:text-slate-100 font-medium' : 'text-stone-400 dark:text-slate-400 hover:text-stone-600 dark:hover:text-slate-200'}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const ALL_SUBJECTS = {
  math: { id: 'math', label: 'Mathematics' },
  sci: { id: 'sci', label: 'Science' },
  phy: { id: 'phy', label: 'Physics' },
  chem: { id: 'chem', label: 'Chemistry' },
  bio: { id: 'bio', label: 'Biology' }
};

const CLASS_ROUTING_MAP: Record<string, string[]> = {
  c8: ['math', 'sci'],
  c9: ['math', 'sci'],
  c10: ['math', 'sci'],
  c11: ['math', 'phy', 'chem', 'bio'],
  c12: ['math', 'phy', 'chem', 'bio'],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 
  const { data: session, status } = useSession();
  
  const [showSubject, setShowSubject] = useState(false);
  
  const currentClassId = (session?.user as any)?.classId || 'c12'; 
  const allowedSubjects = CLASS_ROUTING_MAP[currentClassId] || ['math', 'sci'];
  
  const [activeSubject, setActiveSubject] = useState(() => allowedSubjects[0]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSubject = localStorage.getItem('kapikitab-active-subject');
      if (savedSubject && allowedSubjects.includes(savedSubject)) {
        setActiveSubject(savedSubject);
      } else if (!allowedSubjects.includes(activeSubject)) {
        setActiveSubject(allowedSubjects[0]);
      }

      const isDarkMode = localStorage.getItem('kapikitab-theme') === 'dark';
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, [currentClassId, allowedSubjects, activeSubject]);

  const handleSubjectChange = (id: string) => {
    setActiveSubject(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kapikitab-active-subject', id);
    }
    setShowSubject(false);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF8] dark:bg-[#1C1F2B] text-stone-800 transition-colors duration-500">
        <Loader2 className="animate-spin text-emerald-600 dark:text-blue-400 mb-4" size={40} strokeWidth={1} />
        <h2 className="font-serif text-xl sm:text-2xl font-light tracking-widest text-stone-400 dark:text-slate-500">Syncing...</h2>
      </div>
    );
  }

  const subjectTabs = allowedSubjects.map((id: string) => ALL_SUBJECTS[id as keyof typeof ALL_SUBJECTS]);

  const navItems = [
    { id: 'practice', href: '/dashboard/practice', icon: PenTool, label: 'Practice' },
    { id: 'ai', href: '/dashboard/ai', icon: BrainCircuit, label: 'Ai' },
    { id: 'lesson', href: '/dashboard/lesson', icon: Map, label: 'Lesson' },
    { id: 'simulation', href: '/dashboard/simulation', icon: Beaker, label: 'Simulation' },
    { id: 'explore', href: '/dashboard/explore', icon: Compass, label: 'Explore' },
  ];

  return (
    <div className="fixed inset-0 h-[100dvh] w-full max-w-[100vw] bg-[#FDFCF8] dark:bg-[#1C1F2B] overflow-hidden flex flex-col selection:bg-emerald-100 dark:selection:bg-blue-500/30 overscroll-none transition-colors duration-500">
      {/* 1. ROOT FIX: 'fixed inset-0', 'h-[100dvh]', and 'max-w-[100vw]' to lock bounds */}
      
      {/* 2. HEADER FIX: Pinned explicitly to the fixed root, z-index elevated */}
      <header className="absolute top-0 left-0 w-full z-[100] pointer-events-none p-6 lg:p-10 flex justify-between items-start">
        
        <div className="pointer-events-auto relative flex flex-col items-center space-y-2">
          <Link href="/dashboard/profile">
            <button className="h-14 w-14 sm:h-16 sm:w-16 bg-white/60 dark:bg-[#282C3D]/80 backdrop-blur-2xl border border-white/60 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full flex items-center justify-center transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 z-20">
              <User className={`${pathname === '/dashboard/profile' ? 'text-emerald-700 dark:text-blue-400' : 'text-stone-500 dark:text-slate-400'} w-5 h-5 sm:w-6 sm:h-6 transition-colors`} strokeWidth={1.5} />
            </button>
          </Link>
          <span className="text-[9px] sm:text-[10px] font-serif font-light text-stone-400 dark:text-slate-500 tracking-[0.2em] uppercase transition-colors">Profile</span>
        </div>

        <div className="pointer-events-auto relative flex flex-col items-center space-y-2">
          <button onClick={() => setShowSubject(!showSubject)} className="h-14 w-14 sm:h-16 sm:w-16 bg-white/60 dark:bg-[#282C3D]/80 backdrop-blur-2xl border border-white/60 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full flex items-center justify-center transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 z-20">
            <Book className="text-emerald-700 dark:text-blue-400 w-5 h-5 sm:w-6 sm:h-6 transition-colors" strokeWidth={1.5} />
          </button>
          <span className="text-[9px] sm:text-[10px] font-serif font-light text-stone-400 dark:text-slate-500 tracking-[0.2em] uppercase transition-colors">Subjects</span>
          
          <AnimatePresence>
            {showSubject && (
              <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.4, ease: "easeOut" }} className="absolute top-24 sm:top-28 right-0 origin-top-right z-30">
                <LiquidGlassMenu items={subjectTabs} activeItem={activeSubject} setActiveItem={handleSubjectChange} isHorizontal={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <DashboardContext.Provider value={{ currentClassId, activeSubject, setActiveSubject: handleSubjectChange }}>
        {/* 3. MAIN WRAPPER FIX: strict 'overflow-x-hidden' stops sideways drift */}
        <main className="flex-1 relative w-full h-full pt-20 pb-28 sm:pt-24 sm:pb-32 overflow-y-auto overflow-x-hidden no-scrollbar overscroll-none">
          {children}
        </main>
      </DashboardContext.Provider>

      {/* 4. FOOTER FIX: Pinned explicitly to the fixed root */}
      <nav className="absolute bottom-0 left-0 w-full z-[100] pointer-events-none px-4 sm:px-6 pb-6 sm:pb-8 pt-20 bg-linear-to-t from-[#FDFCF8] dark:from-[#1C1F2B] via-[#FDFCF8]/80 dark:via-[#1C1F2B]/80 to-transparent transition-colors duration-500">
        <div className="max-w-md mx-auto pointer-events-auto bg-white/70 dark:bg-[#282C3D]/80 backdrop-blur-2xl border border-white/60 dark:border-slate-700/50 shadow-[0_20px_50px_rgb(0,0,0,0.05)] rounded-[2.5rem] flex justify-between items-center px-4 py-3 relative transition-colors duration-500">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname === '/dashboard' && item.id === 'lesson'); 
            
            return (
              <Link href={item.href} key={item.id} className="relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 group">
                <motion.div animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -4 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className={`${isActive ? 'text-emerald-700 dark:text-blue-400' : 'text-stone-400 dark:text-slate-400 group-hover:text-stone-500 dark:group-hover:text-slate-300 transition-colors duration-500'}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={isActive ? 1.5 : 1.5} />
                </motion.div>
                <AnimatePresence>
                  {isActive && <motion.span initial={{ opacity: 0, y: 10, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.5 }} className="absolute -bottom-1 text-[9px] font-serif tracking-[0.1em] text-emerald-700 dark:text-blue-400">{item.label}</motion.span>}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}