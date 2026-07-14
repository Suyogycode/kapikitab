"use client";

import React, { useEffect, useRef, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, Lock, Play, Compass, Orbit, FlaskConical, Dna, 
  Sigma, FunctionSquare, Triangle, Brackets, Calculator, Atom, Magnet, 
  Zap, Microscope, Leaf, Bug, Plus, Divide, Infinity as InfinityIcon, Pi, 
  Waves, Telescope, Hexagon, Droplets, Sprout, Beaker, Loader2
} from 'lucide-react';
import Link from 'next/link';
// Note: Ensure this context is available in your layout
import { DashboardContext } from '../layout'; 

// ============================================================================
// DECOUPLED THEME DICTIONARY (No Data, Just Visuals)
// ============================================================================
const subjectThemes: Record<string, any> = {
  math: {
    background: 'bg-[#EBE8DD]',
    text: 'text-[#3E423A]',
    accent: 'bg-[#4A5D4E]', 
    pathColor: 'border-[#4A5D4E]/30',
    watermark: <Sigma className="w-[120vw] h-[120vh] text-[#4A5D4E]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />,
    floatingIcons: [Plus, Divide, InfinityIcon, Pi, Triangle, Brackets, Calculator, FunctionSquare, Compass],
  },
  physics: {
    background: 'bg-[#E2E6EB]',
    text: 'text-[#2C3137]',
    accent: 'bg-[#5C6B89]', 
    pathColor: 'border-[#5C6B89]/30',
    watermark: <Orbit className="w-[120vw] h-[120vh] text-[#5C6B89]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />,
    floatingIcons: [Waves, Telescope, Zap, Magnet, Atom, Orbit],
  },
  chemistry: {
    background: 'bg-[#E1EBE7]',
    text: 'text-[#2A3A35]',
    accent: 'bg-[#52796F]',
    pathColor: 'border-[#52796F]/30',
    watermark: <FlaskConical className="w-[120vw] h-[120vh] text-[#52796F]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />,
    floatingIcons: [Hexagon, Droplets, FlaskConical, Atom, Beaker],
  },
  biology: {
    background: 'bg-[#E8E4D5]',
    text: 'text-[#423D33]',
    accent: 'bg-[#8A795D]',
    pathColor: 'border-[#8A795D]/30',
    watermark: <Dna className="w-[120vw] h-[120vh] text-[#8A795D]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />,
    floatingIcons: [Sprout, Leaf, Bug, Dna, Microscope],
  },
  sci: { // General Science for Class 8-10
    background: 'bg-[#E5E3E8]',
    text: 'text-[#36323D]',
    accent: 'bg-[#6A5A82]',
    pathColor: 'border-[#6A5A82]/30',
    watermark: <Beaker className="w-[120vw] h-[120vh] text-[#6A5A82]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />,
    floatingIcons: [Atom, Leaf, Zap, Telescope, Microscope],
  }
};

// ============================================================================
// AMBIENT BACKGROUND COMPONENT
// ============================================================================
const FloatingAmbientBackground = ({ icons, color }: { icons: any[], color: string }) => {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      Icon: icons[Math.floor(Math.random() * icons.length)],
      size: Math.random() * (60 - 16) + 16, 
      left: `${Math.random() * 100}vw`,
      top: `${Math.random() * 100}vh`,
      duration: Math.random() * (80 - 40) + 40, 
      delay: Math.random() * -10, 
    }));
    setParticles(generated);
    setMounted(true);
  }, [icons]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute ${color} opacity-[0.15]`}
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -50, 50, 0], x: [0, 40, -40, 0], rotate: [0, 90, -90, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        >
          <p.Icon size={p.size} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// MASTER COMPONENT
// ============================================================================

const getChapterStatus = (idx: number): 'active' | 'locked' | 'completed' => {
                // Future-proofed for backend progress data
                return idx === 0 ? 'active' : 'locked';
              };

export default function LessonPage() {
  const { activeSubject, currentClassId } = useContext(DashboardContext);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [chapters, setChapters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const theme = subjectThemes[activeSubject] || subjectThemes['math'];

  // FETCH DYNAMIC CHAPTERS FROM BACKEND
  useEffect(() => {
    const fetchChapters = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/content/chapters?classId=${currentClassId}&subjectId=${activeSubject}`);
        const data = await res.json();
        
        if (res.ok) {
          // Ensure they are sorted by chapter number for the linear map
          const sortedData = (data || []).sort((a: any, b: any) => a.chapterNumber - b.chapterNumber);
          setChapters(sortedData);
        }
      } catch (error) {
        console.error("Failed to load chapters dynamically:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeSubject) {
      fetchChapters();
    }
  }, [activeSubject, currentClassId]);

  // Handle Mobile Scrolling
  useEffect(() => {
    if (window.innerWidth < 1024 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [chapters]);


  
  return (
    <div className={`fixed inset-0 w-screen h-screen ${theme.background} overflow-hidden transition-colors duration-500`}>
      
      <div className="pointer-events-none z-0">
        {theme.watermark}
      </div>

      <FloatingAmbientBackground icons={theme.floatingIcons} color={theme.text} />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
          <Loader2 className={`animate-spin mb-4 ${theme.text} opacity-50`} size={32} />
          <p className={`${theme.text} font-serif tracking-widest text-sm opacity-60 uppercase`}>Mounting Curriculum</p>
        </div>
      )}

      {/* The Interactive Map Canvas */}
      {!isLoading && (
        <div 
          ref={scrollContainerRef}
          className="w-full h-full flex flex-col-reverse lg:flex-row items-center justify-start pt-32 pb-48 lg:pt-0 lg:px-48 gap-16 lg:gap-32 overflow-y-auto lg:overflow-x-auto lg:overflow-y-hidden no-scrollbar relative z-10"
        >
          {chapters.length > 0 && (
            <div className={`absolute top-0 bottom-0 left-1/2 w-0.5 border-l-2 border-dashed ${theme.pathColor} lg:w-full lg:h-0.5 lg:border-t-2 lg:border-l-0 lg:top-1/2 lg:left-0 lg:bottom-auto -z-10`} />
          )}

          {chapters.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500 font-serif">
              <p className="text-xl mb-2">No chapters found for Class 9 Mathematics.</p>
              <p className="text-sm opacity-60">Add a chapter in your Admin Command Center to see it appear here.</p>
            </div>
          ) : (
            
          

            chapters.map((chapter: any, index: number) => {
              // Zig-Zag Layout Logic
              const isEven = index % 2 === 0;
              const zigZagClass = isEven 
                ? "translate-x-12 lg:translate-x-0 lg:-translate-y-24" 
                : "-translate-x-12 lg:translate-x-0 lg:translate-y-24";

              // Deterministic Icon Mapping
              const DynamicIcon = theme.floatingIcons[index % theme.floatingIcons.length];
              
              // CALL THE HELPER HERE (TS will now respect all 3 states)
              const status = getChapterStatus(index);

              return (
                <div key={chapter.chapterId} className={`relative flex flex-col items-center justify-center shrink-0 group ${zigZagClass}`}>
                  
                  {/* Tooltip */}
                  <div className="absolute lg:-top-16 -top-12 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-stone-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 transform -translate-y-2 group-hover:translate-y-0 flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-0.5">Chapter {chapter.chapterNumber}</span>
                    <span className={`font-serif font-medium text-lg ${theme.text}`}>{chapter.title}</span>
                  </div>

                  <Link href={status === 'locked' ? '#' : `/learning/${chapter.chapterId}`}>
                    <motion.button 
                      whileHover={status !== 'locked' ? { scale: 1.05 } : {}}
                      whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
                      className={`relative flex items-center justify-center w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-white shadow-xl border border-stone-100 transition-all duration-300 ${
                        status === 'locked' ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <DynamicIcon className={`w-10 h-10 lg:w-14 lg:h-14 ${status === 'locked' ? 'text-stone-300' : theme.text}`} strokeWidth={1.5} />

                     {/* 2. Status Badges */}
                      <div className={`absolute -bottom-3 -right-3 h-10 w-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg z-30 ${
                        status === 'active' ? theme.accent : 
                        status === 'completed' ? 'bg-stone-300' : 'bg-stone-200'
                      }`}>
                        {status === 'completed' && <Check className="text-white" size={18} strokeWidth={3} />}
                        {status === 'active' && <Play className="text-white ml-0.5" size={18} fill="currentColor" />}
                        {status === 'locked' && <Lock className="text-stone-400" size={16} />}
                      </div>

                      {/* Gentle ping animation for active node */}
                      {status === 'active' && (
                        <div className={`absolute inset-0 -m-2 rounded-3xl border-2 ${theme.pathColor} scale-110 animate-ping z-0`} style={{ animationDuration: '3s' }} />
                      )}
                    </motion.button>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}