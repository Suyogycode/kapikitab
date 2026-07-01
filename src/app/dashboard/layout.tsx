"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, BrainCircuit, Map, Beaker, Compass, User, Book, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Next.js hook to read the URL

// Create the bridge for our pages to read the active subject
export const DashboardContext = React.createContext({
  activeSubject: 'math',
  setActiveSubject: (subject: string) => {}
});

// --- PROFILE OVERLAY COMPONENT (Kept intact) ---
const ProfileOverlay = ({ isOpen, onClose, activeTab, setActiveTab }: any) => {
  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'library', label: 'Library' },
    { id: 'progress', label: 'Progress' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-60" />
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed top-24 left-4 right-4 bottom-24 lg:left-20 lg:right-20 lg:bottom-10 bg-[#FDFCF8]/95 backdrop-blur-3xl border border-white shadow-2xl rounded-[2.5rem] z-70 flex flex-col overflow-hidden">
            <div className="w-full flex items-center justify-between p-6 bg-white/50 border-b border-stone-100">
              <div className="flex space-x-1 p-1 bg-stone-200/50 backdrop-blur-xl rounded-4xl border border-stone-100">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="relative px-6 py-2 rounded-full text-sm font-medium transition-colors z-10">
                      {isActive && <motion.div layoutId="profileOverlayTab" className="absolute inset-0 bg-white shadow-sm border border-stone-200 rounded-full -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                      <span className={isActive ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700'}>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={onClose} className="h-10 w-10 bg-white border border-stone-200 shadow-sm rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 relative flex items-center justify-center text-stone-400 font-serif text-2xl h-full">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Data Syncing...
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- LIQUID GLASS MENU (Kept intact) ---
const LiquidGlassMenu = ({ items, activeItem, setActiveItem, isHorizontal = true }: any) => {
  return (
    <div className={`flex ${isHorizontal ? 'flex-row space-x-2' : 'flex-col space-y-2'} p-2 bg-white/70 backdrop-blur-2xl border border-white shadow-xl rounded-4xl`}>
      {items.map((item: any) => {
        const isActive = activeItem === item.id;
        return (
          <button key={item.id} onClick={() => setActiveItem(item.id)} className="relative px-6 py-3 rounded-full text-sm font-medium transition-colors z-10 whitespace-nowrap">
            {isActive && <motion.div layoutId={`liquidHighlight-${items[0].id}`} className="absolute inset-0 bg-white/90 shadow-sm border border-white/50 rounded-full -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            <span className={isActive ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700'}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// MASTER DASHBOARD LAYOUT
// ============================================================================
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Reads current URL
  
  const [isProfileOverlayOpen, setIsProfileOverlayOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('profile');
  const [showSubject, setShowSubject] = useState(false);
  const [activeSubject, setActiveSubject] = useState('math');

  const navItems = [
    { id: 'practice', href: '/dashboard/practice', icon: PenTool, label: 'Practice' },
    { id: 'ai', href: '/dashboard/ai', icon: BrainCircuit, label: 'Ai' },
    { id: 'lesson', href: '/dashboard/lesson', icon: Map, label: 'Lesson' },
    { id: 'simulation', href: '/dashboard/simulation', icon: Beaker, label: 'Simulation' },
    { id: 'explore', href: '/dashboard/explore', icon: Compass, label: 'Explore' },
  ];

  const profileTabs = [{ id: 'profile', label: 'Profile' }, { id: 'library', label: 'Library' }, { id: 'progress', label: 'Progress' }];
  const subjectTabs = [{ id: 'math', label: 'Mathematics' }, { id: 'physics', label: 'Physics' }, { id: 'chemistry', label: 'Chemistry' }, { id: 'biology', label: 'Biology' }, { id: 'computer', label: 'Computer Sci' }];

  return (
    <div className="h-screen w-full bg-[#FDFCF8] overflow-hidden flex flex-col relative selection:bg-emerald-100">
      
      {/* TOP FLOATING HEADERS */}
      <header className="absolute top-0 w-full z-50 pointer-events-none p-6 lg:p-8 flex justify-between items-start">
        {/* Profile Widget */}
        <div className="pointer-events-auto relative flex flex-col items-start space-y-4">
          <button onClick={() => { setShowProfile(!showProfile); setShowSubject(false); }} className="h-14 w-14 bg-white/70 backdrop-blur-xl border border-white shadow-lg rounded-full flex items-center justify-center transition-transform hover:scale-105 z-20">
            <User className="text-stone-700" size={24} />
          </button>
          <AnimatePresence>
            {showProfile && (
              <motion.div initial={{ opacity: 0, x: -20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -20, scale: 0.95 }} className="absolute top-16 left-0 origin-top-left">
                <LiquidGlassMenu items={profileTabs} activeItem={activeProfileTab} setActiveItem={(id: string) => { setActiveProfileTab(id); setShowProfile(false); setIsProfileOverlayOpen(true); }} isHorizontal={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subject Widget */}
        <div className="pointer-events-auto relative flex flex-col items-end space-y-4">
          <button onClick={() => { setShowSubject(!showSubject); setShowProfile(false); }} className="h-14 w-14 bg-white/70 backdrop-blur-xl border border-white shadow-lg rounded-full flex items-center justify-center transition-transform hover:scale-105 z-20">
            <Book className="text-emerald-700" size={24} />
          </button>
          <AnimatePresence>
            {showSubject && (
              <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} className="absolute top-16 right-0 origin-top-right">
                <LiquidGlassMenu items={subjectTabs} activeItem={activeSubject} setActiveItem={(id: string) => { setActiveSubject(id); setShowSubject(false); }} isHorizontal={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

{/* MAIN SWIPEABLE CONTENT AREA */}
      {/* MAIN SWIPEABLE CONTENT AREA */}
      <DashboardContext.Provider value={{ activeSubject, setActiveSubject }}>
        <main className="flex-1 relative w-full h-full pt-24 pb-32 overflow-y-auto no-scrollbar px-6">
          {children}
        </main>
      </DashboardContext.Provider>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 w-full z-50 pointer-events-none px-6 pb-8 pt-10 bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/90 to-transparent">
        <div className="max-w-md mx-auto pointer-events-auto bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] flex justify-between items-center px-4 py-3 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            // The icon is active if the current URL matches the button's href
            const isActive = pathname === item.href || (pathname === '/dashboard' && item.id === 'lesson'); 
            
            return (
              <Link href={item.href} key={item.id} className="relative flex flex-col items-center justify-center w-14 h-14 group">
                <motion.div animate={{ scale: isActive ? 1.2 : 1, y: isActive ? -4 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className={`${isActive ? 'text-emerald-600' : 'text-stone-400 group-hover:text-stone-600'}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <AnimatePresence>
                  {isActive && <motion.span initial={{ opacity: 0, y: 10, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.5 }} className="absolute -bottom-1 text-[10px] font-bold text-emerald-600 tracking-wide">{item.label}</motion.span>}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </nav>

      <ProfileOverlay isOpen={isProfileOverlayOpen} onClose={() => setIsProfileOverlayOpen(false)} activeTab={activeProfileTab} setActiveTab={setActiveProfileTab} />
    </div>
  );
}