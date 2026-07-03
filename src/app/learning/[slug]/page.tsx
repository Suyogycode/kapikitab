"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation'; 
import { 
  BookOpen, PlayCircle, Beaker, PenTool, Library, 
  ArrowLeft, ChevronRight, Sparkles, Send, Loader2,
  CheckCircle2, XCircle, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// --- KAPI AVATAR COMPONENT ---
const KapiAvatar = ({ isTyping = false, className = "w-8 h-8" }: { isTyping?: boolean, className?: string }) => (
  <motion.svg viewBox="0 0 200 200" className={`drop-shadow-sm ${className}`}>
    <rect x="40" y="60" width="120" height="100" rx="40" fill="#0d3827" /> 
    <rect x="55" y="80" width="90" height="60" rx="20" fill="#FAF9F5" />
    <motion.circle cx="75" cy="110" r="8" fill="#1c1917" 
      animate={isTyping ? { scaleY: [1, 0.2, 1] } : { scaleY: 1 }} 
      transition={{ duration: 0.4, repeat: isTyping ? Infinity : 0, repeatDelay: 0.8 }}
    />
    <motion.circle cx="125" cy="110" r="8" fill="#1c1917" 
      animate={isTyping ? { scaleY: [1, 0.2, 1] } : { scaleY: 1 }} 
      transition={{ duration: 0.4, repeat: isTyping ? Infinity : 0, repeatDelay: 0.8 }}
    />
    <rect x="60" y="95" width="30" height="30" rx="10" fill="none" stroke="#d97706" strokeWidth="4" />
    <rect x="110" y="95" width="30" height="30" rx="10" fill="none" stroke="#d97706" strokeWidth="4" />
    <line x1="90" y1="110" x2="110" y2="110" stroke="#d97706" strokeWidth="4" />
    <line x1="100" y1="60" x2="100" y2="30" stroke="#0d3827" strokeWidth="6" strokeLinecap="round" />
    <circle cx="100" cy="25" r="8" fill="#d97706" />
  </motion.svg>
);

const ZONES = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'cinema', label: 'Cinema', icon: PlayCircle },
  { id: 'lab', label: 'Lab', icon: Beaker },
  { id: 'practice', label: 'Practice', icon: PenTool },
  { id: 'reference', label: 'Up Next', icon: Library },
];

export default function VerticalLearningWorkspace() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [chapter, setChapter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeZone, setActiveZone] = useState('overview');
  
  // --- KAPI INLINE CHAT STATE ---
  const [kapiInput, setKapiInput] = useState("");
  const [kapiResponse, setKapiResponse] = useState<string | null>(null);
  const [isKapiThinking, setIsKapiThinking] = useState(false);

  // --- PRACTICE SECTION STATE ---
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<string | null>(null);
  const [isPracticeAnswered, setIsPracticeAnswered] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);

  // Fetch Data
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await fetch(`/api/content/chapter?id=${slug}`);
        if (!res.ok) throw new Error("Failed to fetch chapter");
        const data = await res.json();
        setChapter(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchChapter();
  }, [slug]);

  // Handle AI Submission
  const handleKapiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kapiInput.trim() || !chapter) return;
    setIsKapiThinking(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: kapiInput,
          threadId: `chapter_${slug}`,
          chapterContext: chapter.zones.overview.content 
        }),
      });
      if (!res.ok) throw new Error("Failed to reach Kapi");
      const data = await res.json();
      setKapiResponse(data.text);
      setKapiInput(""); 
    } catch (error) {
      setKapiResponse("My neural link is fluctuating. Could you try asking that again?");
    } finally {
      setIsKapiThinking(false);
    }
  };

  // Handle Practice Logic
  const practiceQuestions = chapter?.zones?.practice?.questions || [];
  const currentQ = practiceQuestions[practiceIndex];

  const handlePracticeSelect = (opt: string) => {
    if (isPracticeAnswered || !currentQ) return;
    setSelectedPracticeOption(opt);
    setIsPracticeAnswered(true);
    if (opt === currentQ.correctAnswer) {
      setPracticeScore(prev => prev + 1);
    }
  };

  const handlePracticeNext = () => {
    if (practiceIndex < practiceQuestions.length - 1) {
      setPracticeIndex(prev => prev + 1);
      setSelectedPracticeOption(null);
      setIsPracticeAnswered(false);
    }
  };

  // Scroll Animations
  const { scrollYProgress } = useScroll();
  const backgroundColor = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], ["#FDFCF8", "#1c1917", "#e6efe9", "#FFFFFF", "#f4f2eb"]);
  const textColor = useTransform(scrollYProgress, [0, 0.15, 0.35, 0.5, 1], ["#1c1917", "#f5f5f4", "#f5f5f4", "#1c1917", "#1c1917"]);

  // Intersection Observer
  useEffect(() => {
    if (isLoading) return; 
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveZone(entry.target.id);
        });
      }, { threshold: 0.4 } 
    );
    ZONES.forEach((zone) => {
      const element = document.getElementById(zone.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [isLoading]);

  const scrollToZone = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF8] text-stone-800">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <h2 className="font-serif text-xl sm:text-2xl font-medium">Loading Chapter...</h2>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF8] text-stone-800">
        <h2 className="font-serif text-2xl sm:text-3xl font-medium mb-4">Chapter Not Found</h2>
        <Link href="/dashboard/lesson">
          <button className="bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-black transition-colors">Return to Map</button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div className="relative w-full transition-colors duration-200" style={{ backgroundColor, color: textColor }}>
      
      {/* 1. TOP FLOATING CONTROLS */}
      <div className="sticky top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-start z-50 pointer-events-none">
        <Link href="/dashboard/lesson" className="pointer-events-auto">
          <button className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center backdrop-blur-xl bg-stone-500/10 text-current border border-current/10 hover:scale-105 transition-all shadow-sm">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </button>
        </Link>

        <div className="pointer-events-auto p-1.5 rounded-full flex items-center shadow-lg backdrop-blur-xl bg-stone-500/10 border border-current/10 text-current text-xs sm:text-sm font-medium">
          {ZONES.map((zone) => {
            const isActive = activeZone === zone.id;
            const Icon = zone.icon;
            
            return (
              <button key={zone.id} onClick={() => scrollToZone(zone.id)} className={`relative px-3 py-2 md:px-5 md:py-2.5 rounded-full flex items-center transition-colors duration-300 ${isActive ? 'text-current' : 'opacity-50 hover:opacity-100'}`}>
                {isActive && <motion.div layoutId="activeNavPill" className="absolute inset-0 rounded-full bg-current opacity-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <span className="relative z-10 flex items-center space-x-1.5 sm:space-x-2">
                  <Icon size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden md:block">{zone.label}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="w-10 sm:w-12" />
      </div>

      {/* --- ZONE 1: OVERVIEW --- */}
      <div id="overview" className="min-h-screen w-full flex flex-col items-center pt-6 sm:pt-10 px-4 sm:px-6 pb-24 sm:pb-32 scroll-mt-24">
        <div className="max-w-3xl w-full">
          <span className="text-emerald-600 font-bold tracking-widest text-[10px] sm:text-xs uppercase mb-3 sm:mb-4 block">Chapter {chapter.order}</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif mb-8 sm:mb-12 leading-tight">{chapter.title}</h1>
          
          {/* THE KAPI SEARCH/GUIDE BAR */}
          <div className="w-full mb-12 sm:mb-16 relative">
            <form 
              onSubmit={handleKapiAsk}
              className="w-full bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-xl shadow-stone-200/50 border border-stone-100 flex items-center relative overflow-hidden group z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-transparent opacity-50 pointer-events-none" />
              <div className="shrink-0 z-10 mx-2 flex items-center justify-center">
                 <KapiAvatar isTyping={isKapiThinking} className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <input 
                type="text" 
                value={kapiInput}
                onChange={(e) => setKapiInput(e.target.value)}
                placeholder={`Ask Kapi about ${chapter.title}...`}
                className="flex-grow bg-transparent border-none outline-none text-stone-800 placeholder-stone-400 px-2 sm:px-4 py-3 sm:py-4 z-10 font-light text-sm sm:text-base"
                disabled={isKapiThinking}
              />
              <button 
                type="submit"
                disabled={isKapiThinking || !kapiInput.trim()}
                className="h-10 w-10 sm:h-12 sm:w-12 bg-stone-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-colors z-10 mr-1 sm:mr-2 shrink-0 disabled:opacity-50"
              >
                {isKapiThinking ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Loader2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </motion.div>
                ) : (
                  <Send size={16} className="ml-0.5 sm:ml-1 sm:w-[18px] sm:h-[18px]" />
                )}
              </button>
            </form>

            <AnimatePresence>
              {kapiResponse && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="bg-emerald-50 border-x border-b border-emerald-100 rounded-b-2xl sm:rounded-b-3xl -mt-6 pt-10 px-5 sm:px-8 pb-6 sm:pb-8 shadow-lg shadow-emerald-900/5 relative z-0 overflow-hidden"
                >
                  <button 
                    onClick={() => setKapiResponse(null)}
                    className="absolute top-8 right-4 sm:right-6 text-emerald-400 hover:text-emerald-700 text-xs sm:text-sm font-medium"
                  >
                    Dismiss
                  </button>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="shrink-0 mt-1 hidden sm:block">
                      <KapiAvatar className="w-6 h-6 opacity-70" />
                    </div>
                    <div className="prose prose-stone prose-sm md:prose-base max-w-none text-stone-700 font-light leading-relaxed whitespace-pre-wrap pr-4 sm:pr-8">
                      {kapiResponse}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="prose prose-stone prose-base sm:prose-lg max-w-none">
            <p className="leading-relaxed text-lg sm:text-xl font-light opacity-90 whitespace-pre-wrap">
              {chapter.zones?.overview?.content || "Concept material is currently syncing..."}
            </p>
          </div>
        </div>
      </div>

      {/* --- ZONE 2: CINEMA --- */}
      <div id="cinema" className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 scroll-mt-24">
        <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative group border border-white/10 flex items-center justify-center">
          {chapter.zones?.cinema?.videoUrl ? (
            <iframe 
              src={chapter.zones.cinema.videoUrl}
              className="w-full h-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
              allowFullScreen
            />
          ) : (
            <div className="text-center text-white/50 px-4">
              <PlayCircle size={40} className="mx-auto mb-3 opacity-50 sm:w-12 sm:h-12" />
              <p className="text-sm sm:text-base">HD Video missing from database</p>
            </div>
          )}
        </div>
      </div>

      {/* --- ZONE 3: THE LAB --- */}
      <div id="lab" className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 scroll-mt-24">
        <div className="w-full max-w-6xl h-[60vh] sm:h-[75vh] bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 flex overflow-hidden relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#1c1917 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="m-auto text-center relative z-10 px-4">
            <div className="h-16 w-16 sm:h-24 sm:w-24 bg-emerald-50 text-emerald-600 rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center mb-4 sm:mb-6 border-2 border-emerald-100 rotate-12">
              <Beaker size={32} className="sm:w-10 sm:h-10" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-stone-800">Interactive Lab</h3>
            <p className="text-stone-500 mt-2 sm:mt-4 font-light max-w-md mx-auto text-base sm:text-lg">Physics engine mounting soon.</p>
          </div>
        </div>
      </div>

      {/* --- ZONE 4: PRACTICE --- */}
      <div id="practice" className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 scroll-mt-24">
        <div className="max-w-3xl w-full">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif">Knowledge Check</h2>
            <span className="px-4 py-1.5 sm:px-5 sm:py-2 bg-stone-100 text-stone-600 rounded-full text-xs sm:text-sm font-medium border border-stone-200">
              {practiceIndex + 1} / {practiceQuestions.length || 0}
            </span>
          </div>

          {practiceQuestions.length > 0 && currentQ ? (
             <div className="bg-stone-50 border border-stone-200 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 shadow-sm relative overflow-hidden">
                <p className="text-xl sm:text-2xl font-medium mb-8 sm:mb-10 leading-snug">{currentQ.questionText}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {currentQ.options.map((opt: string, i: number) => {
                    const isSelected = selectedPracticeOption === opt;
                    const isCorrect = opt === currentQ.correctAnswer;
                    
                    let buttonStyle = "border-stone-200 text-stone-700 hover:border-emerald-400 bg-white";
                    
                    if (isPracticeAnswered) {
                      if (isCorrect) buttonStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm";
                      else if (isSelected && !isCorrect) buttonStyle = "border-red-400 bg-red-50 text-red-800 opacity-90";
                      else buttonStyle = "border-stone-100 text-stone-400 bg-stone-50 opacity-50";
                    }

                    return (
                      <button 
                        key={i} 
                        disabled={isPracticeAnswered}
                        onClick={() => handlePracticeSelect(opt)}
                        className={`p-4 sm:p-6 text-left rounded-xl sm:rounded-2xl border-2 transition-all duration-300 font-mono text-base sm:text-xl flex justify-between items-center ${buttonStyle}`}
                      >
                        <span className="pr-2">{opt}</span>
                        {isPracticeAnswered && isCorrect && <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />}
                        {isPracticeAnswered && isSelected && !isCorrect && <XCircle size={20} className="text-red-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button Footer */}
                <div className="mt-8 flex justify-end min-h-[44px]">
                  <AnimatePresence>
                    {isPracticeAnswered && (
                      <motion.button 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        onClick={handlePracticeNext}
                        disabled={practiceIndex >= practiceQuestions.length - 1}
                        className="flex items-center space-x-2 bg-stone-900 text-white px-6 sm:px-8 py-3 rounded-full hover:bg-black transition-colors shadow-md text-sm sm:text-base disabled:opacity-50"
                      >
                        <span className="font-medium">{practiceIndex === practiceQuestions.length - 1 ? 'Finished' : 'Next Question'}</span>
                        <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
             </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center text-stone-500 text-sm sm:text-base">
               No practice questions uploaded yet.
            </div>
          )}
        </div>
      </div>

      {/* --- ZONE 5: UP NEXT --- */}
      <div id="reference" className="min-h-[80vh] w-full flex flex-col items-center justify-center p-4 sm:p-6 pb-24 scroll-mt-24">
        <div className="max-w-4xl w-full text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-serif mb-3 sm:mb-4">Reference & Resources</h2>
          <p className="opacity-60 mb-8 sm:mb-12 font-light text-base sm:text-xl">Download high-resolution guides directly to your device.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {chapter.zones?.reference?.resources?.map((resource: any, index: number) => (
               <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer">
                  <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-stone-200 group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 text-left">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                      <Library size={24} className="sm:w-7 sm:h-7" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-medium mb-2 sm:mb-3 text-stone-900 leading-tight">{resource.title}</h3>
                    <p className="opacity-60 font-light mb-6 sm:mb-8 text-sm sm:text-lg text-stone-900">Securely hosted via Edge CDN.</p>
                    <div className="flex items-center text-blue-600 font-medium text-sm sm:text-base group-hover:translate-x-2 transition-transform">
                      Download PDF <ChevronRight size={16} className="ml-1 sm:w-5 sm:h-5" />
                    </div>
                  </div>
               </a>
            ))}
            
            {(!chapter.zones?.reference?.resources || chapter.zones.reference.resources.length === 0) && (
              <div className="text-stone-500 text-sm sm:text-base col-span-1 sm:col-span-2 text-center py-10 bg-stone-50 rounded-3xl border border-stone-200">
                No external resources linked to this chapter yet.
              </div>
            )}
          </div>
        </div>
      </div>

    </motion.div>
  );
}