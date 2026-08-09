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
import { DashboardContext } from '../layout'; 

// Elegantly mapped dark themes to maintain the premium, breathing aesthetic 
const subjectThemes: Record<string, any> = {
  math: {
    background: 'bg-[#EBE8DD] dark:bg-[#1B1D1A]',
    text: 'text-[#53594D] dark:text-[#A3B19B]',
    accent: 'bg-[#4A5D4E] dark:bg-[#5E7A64]', 
    pathColor: 'border-[#4A5D4E]/20 dark:border-[#5E7A64]/30',
    watermark: <Sigma className="w-[120vw] h-[120vh] text-[#4A5D4E]/3 dark:text-[#5E7A64]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 transition-colors" />,
    floatingIcons: [Plus, Divide, InfinityIcon, Pi, Triangle, Brackets, Calculator, FunctionSquare, Compass],
  },
  phy: { 
    background: 'bg-[#E2E6EB] dark:bg-[#171920]',
    text: 'text-[#485058] dark:text-[#9BA5B1]',
    accent: 'bg-[#5C6B89] dark:bg-[#7285A5]', 
    pathColor: 'border-[#5C6B89]/20 dark:border-[#7285A5]/30',
    watermark: <Orbit className="w-[120vw] h-[120vh] text-[#5C6B89]/3 dark:text-[#7285A5]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 transition-colors" />,
    floatingIcons: [Waves, Telescope, Zap, Magnet, Atom, Orbit],
  },
  chem: { 
    background: 'bg-[#E1EBE7] dark:bg-[#161D1A]',
    text: 'text-[#41544E] dark:text-[#8EB0A4]',
    accent: 'bg-[#52796F] dark:bg-[#689489]',
    pathColor: 'border-[#52796F]/20 dark:border-[#689489]/30',
    watermark: <FlaskConical className="w-[120vw] h-[120vh] text-[#52796F]/3 dark:text-[#689489]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 transition-colors" />,
    floatingIcons: [Hexagon, Droplets, FlaskConical, Atom, Beaker],
  },
  bio: { 
    background: 'bg-[#E8E4D5] dark:bg-[#1E1C17]',
    text: 'text-[#5E574B] dark:text-[#C5B79F]',
    accent: 'bg-[#8A795D] dark:bg-[#A59374]',
    pathColor: 'border-[#8A795D]/20 dark:border-[#A59374]/30',
    watermark: <Dna className="w-[120vw] h-[120vh] text-[#8A795D]/3 dark:text-[#A59374]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 transition-colors" />,
    floatingIcons: [Sprout, Leaf, Bug, Dna, Microscope],
  },
  sci: { 
    background: 'bg-[#E5E3E8] dark:bg-[#19171C]',
    text: 'text-[#504A59] dark:text-[#A298B3]',
    accent: 'bg-[#6A5A82] dark:bg-[#8674A3]',
    pathColor: 'border-[#6A5A82]/20 dark:border-[#8674A3]/30',
    watermark: <Beaker className="w-[120vw] h-[120vh] text-[#6A5A82]/3 dark:text-[#8674A3]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 transition-colors" />,
    floatingIcons: [Atom, Leaf, Zap, Telescope, Microscope],
  }
};

const FloatingAmbientBackground = ({ icons, color }: { icons: any[], color: string }) => {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      Icon: icons[Math.floor(Math.random() * icons.length)],
      size: Math.random() * (50 - 16) + 16, 
      left: `${Math.random() * 100}vw`,
      top: `${Math.random() * 100}vh`,
      duration: Math.random() * (100 - 60) + 60, 
      delay: Math.random() * -20, 
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
          className={`absolute ${color} opacity-[0.08] dark:opacity-[0.05] transition-colors`}
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -40, 40, 0], x: [0, 30, -30, 0], rotate: [0, 45, -45, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
        >
          <p.Icon size={p.size} strokeWidth={1} />
        </motion.div>
      ))}
    </div>
  );
};

const getChapterStatus = (idx: number): 'active' | 'locked' | 'completed' => {
  return 'active';
};

const formatChapterTitle = (title: string, num: number) => {
  const cleanedTitle = title.replace(/^Chapter\s+\d+[:\-]?\s*/i, '');
  return `${num}. ${cleanedTitle}`;
};

export default function LessonPage() {
  const { activeSubject, currentClassId } = useContext(DashboardContext);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [chapters, setChapters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const theme = subjectThemes[activeSubject] || subjectThemes['math'];

  useEffect(() => {
    let isCurrent = true;

    const fetchChapters = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/content/chapters?classId=${currentClassId}&subjectId=${activeSubject}`);
        const data = await res.json();
        
        if (res.ok && isCurrent) {
          const sortedData = (data || []).sort((a: any, b: any) => a.chapterNumber - b.chapterNumber);
          setChapters(sortedData);
        }
      } catch (error) {
        if (isCurrent) console.error("Failed to load chapters dynamically:", error);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    if (activeSubject) {
      fetchChapters();
    }

    return () => {
      isCurrent = false;
    };
  }, [activeSubject, currentClassId]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    
    if (el) {
      if (window.innerWidth < 1024) {
        el.scrollTop = el.scrollHeight;
      }

      const handleWheel = (e: WheelEvent) => {
        if (window.innerWidth >= 1024) {
          if (e.deltaY !== 0) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
          }
        }
      };
      
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [chapters]);

  return (
    <div className={`fixed inset-0 w-screen h-screen ${theme.background} overflow-hidden transition-colors duration-1000`}>
      
      <div className="pointer-events-none z-0">
        {theme.watermark}
      </div>

      <FloatingAmbientBackground icons={theme.floatingIcons} color={theme.text} />

      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
          <Loader2 className={`animate-spin mb-6 ${theme.text} opacity-40 transition-colors`} size={28} strokeWidth={1} />
          <p className={`${theme.text} font-serif tracking-[0.3em] text-xs opacity-50 uppercase transition-colors`}>Preparing</p>
        </div>
      )}

      {!isLoading && (
        <div 
          ref={scrollContainerRef}
          className="w-full h-full flex flex-col-reverse lg:flex-row items-center justify-start pt-32 pb-48 lg:pt-0 lg:px-64 overflow-y-auto lg:overflow-x-auto lg:overflow-y-hidden no-scrollbar relative z-10 scroll-smooth"
        >
          {chapters.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 dark:text-slate-500 font-serif font-light transition-colors">
              <p className="text-lg mb-3 tracking-widest">
                Curriculum Empty
              </p>
            </div>
          ) : (
            <div className="relative flex flex-col-reverse lg:flex-row items-center justify-start gap-24 lg:gap-40 w-full lg:w-max min-h-full py-32 lg:py-0">
              
              <div className={`absolute top-0 bottom-0 left-1/2 w-px border-l border-dashed ${theme.pathColor} lg:h-px lg:border-t lg:border-l-0 lg:top-1/2 lg:left-0 lg:bottom-auto -z-10 transition-colors duration-1000`} style={{ minWidth: '100%' }} />

              {chapters.map((chapter: any, index: number) => {
                const isEven = index % 2 === 0;
                const zigZagClass = isEven 
                  ? "translate-x-12 lg:translate-x-0 lg:-translate-y-32" 
                  : "-translate-x-12 lg:translate-x-0 lg:translate-y-32";

                const DynamicIcon = theme.floatingIcons[index % theme.floatingIcons.length];
                const status = getChapterStatus(index);

                return (
                  <div key={chapter.chapterId} className={`relative flex flex-col items-center justify-center shrink-0 group ${zigZagClass}`}>
                    
                    <div className="absolute lg:-top-12 -top-10 px-4 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-30 transform -translate-y-2 group-hover:translate-y-0 flex flex-col items-center">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 dark:text-slate-400 font-medium mb-0.5">Chapter {chapter.chapterNumber}</span>
                    </div>

                    <Link href={status === 'locked' ? '#' : `/learning/${chapter.chapterId}`}>
                      <motion.button 
                        whileHover={status !== 'locked' ? { scale: 1.02, y: -4 } : {}}
                        whileTap={status !== 'locked' ? { scale: 0.98 } : {}}
                        className={`relative flex items-center justify-center w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] bg-white/90 dark:bg-[#282C3D]/90 backdrop-blur-sm shadow-[0_10px_40px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white dark:border-slate-700/50 transition-all duration-700 ease-out ${
                          status === 'locked' ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <DynamicIcon className={`w-8 h-8 lg:w-10 lg:h-10 ${status === 'locked' ? 'text-stone-300 dark:text-slate-500' : theme.text} opacity-80 transition-colors`} strokeWidth={1} />

                        <div className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-[3px] border-[#FDFCF8] dark:border-[#1C1F2B] flex items-center justify-center shadow-sm z-30 transition-colors duration-500 ${
                          status === 'active' ? theme.accent : 
                          status === 'completed' ? 'bg-stone-200 dark:bg-slate-600' : 'bg-stone-100 dark:bg-slate-700'
                        }`}>
                          {status === 'completed' && <Check className="text-white" size={14} strokeWidth={2} />}
                          {status === 'active' && <Play className="text-white ml-0.5" size={12} fill="currentColor" />}
                          {status === 'locked' && <Lock className="text-stone-300 dark:text-slate-400" size={12} />}
                        </div>
                      </motion.button>
                    </Link>
                    
                    <span className={`absolute lg:-bottom-16 -bottom-14 font-serif font-light text-xs sm:text-sm tracking-[0.1em] ${theme.text} opacity-70 text-center w-[120px] lg:w-[150px] line-clamp-2 leading-relaxed whitespace-normal break-words transition-colors`}>
                      {formatChapterTitle(chapter.title, chapter.chapterNumber)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}