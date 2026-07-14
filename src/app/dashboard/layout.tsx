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

// --- LIQUID GLASS MENU ---
const LiquidGlassMenu = ({ items, activeItem, setActiveItem, isHorizontal = true }: any) => {
  return (
    <div className={`flex ${isHorizontal ? 'flex-row space-x-2 overflow-x-auto no-scrollbar' : 'flex-col space-y-2'} p-2 bg-white/70 backdrop-blur-2xl border border-white shadow-xl rounded-4xl`}>
      {items.map((item: any) => {
        const isActive = activeItem === item.id;
        return (
          <button key={item.id} onClick={() => setActiveItem(item.id)} className="relative px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-colors z-10 whitespace-nowrap">
            {isActive && <motion.div layoutId={`liquidHighlight-${items[0].id}`} className="absolute inset-0 bg-white/90 shadow-sm border border-white/50 rounded-full -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            <span className={isActive ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700'}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const ALL_SUBJECTS = {
  math: { id: 'math', label: 'Mathematics' },
  sci: { id: 'sci', label: 'Science' },
  physics: { id: 'physics', label: 'Physics' },
  chemistry: { id: 'chemistry', label: 'Chemistry' },
  biology: { id: 'biology', label: 'Biology' }
};

const CLASS_ROUTING_MAP: Record<string, string[]> = {
  c8: ['math', 'sci'],
  c9: ['math', 'sci'],
  c10: ['math', 'sci'],
  c11: ['math', 'physics', 'chemistry', 'biology'],
  c12: ['math', 'physics', 'chemistry', 'biology'],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 
  const { data: session, status } = useSession();
  
  const [showSubject, setShowSubject] = useState(false);
  
  const currentClassId = (session?.user as any)?.classId || 'c12'; 
  const allowedSubjects = CLASS_ROUTING_MAP[currentClassId] || ['math', 'sci'];
  
  const [activeSubject, setActiveSubject] = useState(() => allowedSubjects[0]);

  useEffect(() => {
    if (!allowedSubjects.includes(activeSubject)) {
      setActiveSubject(allowedSubjects[0]);
    }
  }, [currentClassId, activeSubject, allowedSubjects]);

  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF8] text-stone-800">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <h2 className="font-serif text-xl sm:text-2xl font-medium">Syncing Student Profile...</h2>
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
    <div className="h-screen w-full bg-[#FDFCF8] overflow-hidden flex flex-col relative selection:bg-emerald-100 overscroll-none">
      
      <header className="absolute top-0 w-full z-50 pointer-events-none p-4 sm:p-6 lg:p-8 flex justify-between items-start">
        
        {/* REPLACED PROFILE OVERLAY TRIGGER WITH A LINK */}
        <div className="pointer-events-auto relative flex flex-col items-start space-y-4">
          <Link href="/dashboard/profile">
            <button className="h-12 w-12 sm:h-14 sm:w-14 bg-white/70 backdrop-blur-xl border border-white shadow-lg rounded-full flex items-center justify-center transition-transform hover:scale-105 z-20">
              <User className={`${pathname === '/dashboard/profile' ? 'text-emerald-600' : 'text-stone-700'} w-5 h-5 sm:w-6 sm:h-6`} />
            </button>
          </Link>
        </div>

        <div className="pointer-events-auto relative flex flex-col items-end space-y-4">
          <button onClick={() => setShowSubject(!showSubject)} className="h-12 w-12 sm:h-14 sm:w-14 bg-white/70 backdrop-blur-xl border border-white shadow-lg rounded-full flex items-center justify-center transition-transform hover:scale-105 z-20">
            <Book className="text-emerald-700 w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <AnimatePresence>
            {showSubject && (
              <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} className="absolute top-14 sm:top-16 right-0 origin-top-right">
                <LiquidGlassMenu items={subjectTabs} activeItem={activeSubject} setActiveItem={(id: string) => { setActiveSubject(id); setShowSubject(false); }} isHorizontal={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <DashboardContext.Provider value={{ currentClassId, activeSubject, setActiveSubject }}>
        <main className="flex-1 relative w-full h-full pt-20 pb-28 sm:pt-24 sm:pb-32 overflow-y-auto no-scrollbar overscroll-none">
          {children}
        </main>
      </DashboardContext.Provider>

      <nav className="fixed bottom-0 w-full z-50 pointer-events-none px-4 sm:px-6 pb-6 sm:pb-8 pt-10 bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/90 to-transparent">
        <div className="max-w-md mx-auto pointer-events-auto bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname === '/dashboard' && item.id === 'lesson'); 
            
            return (
              <Link href={item.href} key={item.id} className="relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 group">
                <motion.div animate={{ scale: isActive ? 1.2 : 1, y: isActive ? -4 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className={`${isActive ? 'text-emerald-600' : 'text-stone-400 group-hover:text-stone-600'}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <AnimatePresence>
                  {isActive && <motion.span initial={{ opacity: 0, y: 10, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.5 }} className="absolute -bottom-1 text-[9px] sm:text-[10px] font-bold text-emerald-600 tracking-wide">{item.label}</motion.span>}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}