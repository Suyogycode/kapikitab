"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation'; // NEW: To grab the slug from the URL
import { 
  BookOpen, 
  PlayCircle, 
  Beaker, 
  PenTool, 
  Library, 
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Send,
  Loader2 // NEW: For the loading state
} from 'lucide-react';
import Link from 'next/link';

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
  
  // --- DATABASE STATE ---
  const [chapter, setChapter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeZone, setActiveZone] = useState('overview');
  
  // --- FETCH DATA FROM MONGODB ---
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

  // --- KAPI INLINE CHAT STATE ---
  const [kapiInput, setKapiInput] = useState("");
  const [kapiResponse, setKapiResponse] = useState<string | null>(null);
  const [isKapiThinking, setIsKapiThinking] = useState(false);

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
          threadId: `chapter_${slug}`, // This creates the isolated room!
          chapterContext: chapter.zones.overview.content // Feeds the specific text to the Mask
        }),
      });

      if (!res.ok) throw new Error("Failed to reach Kapi");
      const data = await res.json();
      setKapiResponse(data.text);
      setKapiInput(""); // Clear input after asking
    } catch (error) {
      setKapiResponse("My neural link is fluctuating. Could you try asking that again?");
    } finally {
      setIsKapiThinking(false);
    }
  };

  // Framer Motion Scroll Tracking
  const { scrollYProgress } = useScroll();

  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["#FDFCF8", "#1c1917", "#e6efe9", "#FFFFFF", "#f4f2eb"]
  );

  const textColor = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.5, 1],
    ["#1c1917", "#f5f5f4", "#f5f5f4", "#1c1917", "#1c1917"]
  );

  // Intersection Observer for the Dynamic Island
  useEffect(() => {
    if (isLoading) return; // Wait until content exists
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveZone(entry.target.id);
        });
      },
      { threshold: 0.4 } 
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

  // --- LOADING SCREEN ---
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FDFCF8] text-stone-800">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <h2 className="font-serif text-2xl font-medium">Loading Universe...</h2>
      </div>
    );
  }

  // --- ERROR SCREEN ---
  if (!chapter) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FDFCF8] text-stone-800">
        <h2 className="font-serif text-3xl font-medium mb-4">Chapter Not Found</h2>
        <Link href="/dashboard/lesson">
          <button className="bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-black transition-colors">Return to Map</button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div className="relative w-full transition-colors duration-200" style={{ backgroundColor, color: textColor }}>
      
      {/* 1. TOP FLOATING CONTROLS (Sticky Dynamic Island) */}
      <div className="sticky top-0 left-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        <Link href="/dashboard/lesson" className="pointer-events-auto">
          <button className="h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-xl bg-stone-500/10 text-current border border-current/10 hover:scale-105 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
        </Link>

        <div className="pointer-events-auto p-1.5 rounded-full flex items-center shadow-lg backdrop-blur-xl bg-stone-500/10 border border-current/10 text-current text-sm font-medium">
          {ZONES.map((zone) => {
            const isActive = activeZone === zone.id;
            const Icon = zone.icon;
            
            return (
              <button key={zone.id} onClick={() => scrollToZone(zone.id)} className={`relative px-4 py-2 md:px-5 md:py-2.5 rounded-full flex items-center transition-colors duration-300 ${isActive ? 'text-current' : 'opacity-50 hover:opacity-100'}`}>
                {isActive && <motion.div layoutId="activeNavPill" className="absolute inset-0 rounded-full bg-current opacity-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <span className="relative z-10 flex items-center space-x-2">
                  <Icon size={16} />
                  <span className="hidden md:block">{zone.label}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="w-12" />
      </div>

      

      {/* --- ZONE 1: OVERVIEW --- */}
      <div id="overview" className="min-h-screen w-full flex flex-col items-center pt-10 px-6 pb-32 scroll-mt-24">
        <div className="max-w-3xl w-full">
          <span className="text-emerald-600 font-bold tracking-widest text-xs uppercase mb-4 block">Chapter {chapter.order}</span>
          <h1 className="text-5xl md:text-6xl font-serif mb-12 leading-tight">{chapter.title}</h1>
          
        {/* THE KAPI SEARCH/GUIDE BAR */}
          <div className="w-full mb-16 relative">
            <form 
              onSubmit={handleKapiAsk}
              className="w-full bg-white/80 backdrop-blur-md rounded-3xl p-2 shadow-xl shadow-stone-200/50 border border-stone-100 flex items-center relative overflow-hidden group z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-transparent opacity-50 pointer-events-none" />
              <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 z-10 mx-2">
                <Sparkles size={24} />
              </div>
              <input 
                type="text" 
                value={kapiInput}
                onChange={(e) => setKapiInput(e.target.value)}
                placeholder={`Ask Kapi anything about ${chapter.title}...`}
                className="flex-grow bg-transparent border-none outline-none text-stone-800 placeholder-stone-400 px-4 py-4 z-10 font-light"
                disabled={isKapiThinking}
              />
              <button 
                type="submit"
                disabled={isKapiThinking || !kapiInput.trim()}
                className="h-12 w-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-colors z-10 mr-2 shrink-0 disabled:opacity-50"
              >
                {isKapiThinking ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Loader2 size={18} />
                  </motion.div>
                ) : (
                  <Send size={18} className="ml-1" />
                )}
              </button>
            </form>

            {/* SMOOTH SLIDE-DOWN RESPONSE PANEL */}
            <AnimatePresence>
              {kapiResponse && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="bg-emerald-50 border-x border-b border-emerald-100 rounded-b-3xl -mt-6 pt-10 px-8 pb-8 shadow-lg shadow-emerald-900/5 relative z-0 overflow-hidden"
                >
                  <button 
                    onClick={() => setKapiResponse(null)}
                    className="absolute top-8 right-6 text-emerald-400 hover:text-emerald-700 text-sm font-medium"
                  >
                    Dismiss
                  </button>
                  <div className="flex items-start space-x-4">
                    <div className="h-8 w-8 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Sparkles size={16} />
                    </div>
                    <div className="prose prose-stone prose-sm md:prose-base max-w-none text-stone-700 font-light leading-relaxed whitespace-pre-wrap pr-8">
                      {kapiResponse}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="prose prose-stone prose-lg max-w-none">
            {/* Real Data Injection: Rendering the text area content */}
            <p className="leading-relaxed text-xl font-light opacity-90 whitespace-pre-wrap">
              {chapter.zones?.overview?.content || "Concept material is currently syncing..."}
            </p>
          </div>
        </div>
      </div>

      {/* --- ZONE 2: CINEMA --- */}
      <div id="cinema" className="min-h-screen w-full flex items-center justify-center p-6 scroll-mt-24">
        <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative group border border-white/10 flex items-center justify-center">
          {chapter.zones?.cinema?.videoUrl ? (
            <iframe 
              src={chapter.zones.cinema.videoUrl}
              className="w-full h-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
              allowFullScreen
            />
          ) : (
            <div className="text-center text-white/50">
              <PlayCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>HD Video missing from database</p>
            </div>
          )}
        </div>
      </div>

      {/* --- ZONE 3: THE LAB --- */}
      <div id="lab" className="min-h-screen w-full flex items-center justify-center p-6 scroll-mt-24">
        <div className="w-full max-w-6xl h-[75vh] bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 flex overflow-hidden relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#1c1917 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="m-auto text-center relative z-10">
            <div className="h-24 w-24 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center mb-6 border-2 border-emerald-100 rotate-12">
              <Beaker size={40} />
            </div>
            <h3 className="text-3xl font-serif text-stone-800">Interactive Lab: {chapter.zones?.lab?.simulationId}</h3>
            <p className="text-stone-500 mt-4 font-light max-w-md mx-auto text-lg">Interactive physics engine will mount here soon.</p>
          </div>
        </div>
      </div>

      {/* --- ZONE 4: PRACTICE --- */}
      <div id="practice" className="min-h-screen w-full flex flex-col items-center justify-center p-6 scroll-mt-24">
        <div className="max-w-3xl w-full">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-serif">Knowledge Check</h2>
            <span className="px-5 py-2 bg-stone-100 text-stone-600 rounded-full text-sm font-medium border border-stone-200">
              0 / {chapter.zones?.practice?.questions?.length || 0} Completed
            </span>
          </div>

          {chapter.zones?.practice?.questions && chapter.zones.practice.questions.length > 0 ? (
             <div className="bg-stone-50 border border-stone-200 rounded-3xl p-10 md:p-14 shadow-sm">
                <p className="text-2xl font-medium mb-10 leading-snug">{chapter.zones.practice.questions[0].questionText}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chapter.zones.practice.questions[0].options.map((opt: string, i: number) => (
                    <button key={i} className="p-6 text-left rounded-2xl border-2 border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all font-mono text-xl text-stone-700">
                      {opt}
                    </button>
                  ))}
                </div>
             </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-10 text-center text-stone-500">
               No practice questions uploaded yet.
            </div>
          )}
        </div>
      </div>

      {/* --- ZONE 5: UP NEXT --- */}
      <div id="reference" className="min-h-[80vh] w-full flex flex-col items-center justify-center p-6 pb-24 scroll-mt-24">
        <div className="max-w-4xl w-full">
          <h2 className="text-4xl font-serif mb-4">Reference & Resources</h2>
          <p className="opacity-60 mb-12 font-light text-xl">Download high-resolution guides directly from Cloudflare R2.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chapter.zones?.reference?.resources?.map((resource: any, index: number) => (
               <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer">
                  <div className="bg-white p-10 rounded-3xl shadow-sm border border-stone-200 group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                      <Library size={28} />
                    </div>
                    <h3 className="text-2xl font-medium mb-3 text-stone-900">{resource.title}</h3>
                    <p className="opacity-60 font-light mb-8 text-lg text-stone-900">Securely hosted via Edge CDN.</p>
                    <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                      Download PDF <ChevronRight size={20} className="ml-1" />
                    </div>
                  </div>
               </a>
            ))}
            
            {/* Fallback if no resources are uploaded */}
            {(!chapter.zones?.reference?.resources || chapter.zones.reference.resources.length === 0) && (
              <div className="text-stone-500">No external resources linked to this chapter yet.</div>
            )}
          </div>
        </div>
      </div>

    </motion.div>
  );
}