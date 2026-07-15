"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation'; 
import { 
  ArrowLeft, PlayCircle, Beaker, 
  CheckCircle2, XCircle, ArrowRight, FileText, ImageIcon, Loader2, ChevronLeft, ChevronRight, SkipForward
} from 'lucide-react';
import Link from 'next/link';

export default function DynamicLearningWorkspace() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [chapter, setChapter] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUnit, setActiveUnit] = useState<string>('');

  // Practice State Management 
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, string>>({}); // Tracks answers per question ID
  const [activeQuestionIndexes, setActiveQuestionIndexes] = useState<Record<string, number>>({}); // Tracks current question index per unit

  // Fetch Chapter, Assets, and Questions simultaneously
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [chapRes, assetRes, questRes] = await Promise.all([
          fetch(`/api/content/chapter?id=${slug}`),
          fetch(`/api/content/asset?chapterId=${slug}`),
          fetch(`/api/content/question?chapterId=${slug}`)
        ]);

        if (chapRes.ok) {
          const chapData = await chapRes.json();
          setChapter(chapData);
          if (chapData.units?.length > 0) setActiveUnit(chapData.units[0].unitId);
        }
        if (assetRes.ok) setAssets(await assetRes.json());
        if (questRes.ok) setQuestions(await questRes.json());

      } catch (error) {
        console.error("Failed to sync curriculum data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchAllData();
  }, [slug]);

  const handlePracticeSelect = (questionId: string, selectedOption: string) => {
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const handleNavigateQuestion = (unitId: string, direction: 'next' | 'prev', max: number) => {
    setActiveQuestionIndexes(prev => {
      const currentIndex = prev[unitId] || 0;
      let newIndex = currentIndex;
      
      if (direction === 'next') {
        newIndex = Math.min(currentIndex + 1, max - 1);
      } else if (direction === 'prev') {
        newIndex = Math.max(currentIndex - 1, 0);
      }
      
      return { ...prev, [unitId]: newIndex };
    });
  };

  const scrollToUnit = (unitId: string) => {
    const element = document.getElementById(`unit-${unitId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveUnit(unitId);
    }
  };

  // Scroll Animations for Background[cite: 2]
  const { scrollYProgress } = useScroll();
  const backgroundColor = useTransform(scrollYProgress, [0, 0.5, 1], ["#FDFCF8", "#F5F5F0", "#FDFCF8"]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF8] text-stone-800">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <h2 className="font-serif text-xl sm:text-2xl font-medium">Mounting Curriculum...</h2>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF8] text-stone-800">
        <h2 className="font-serif text-2xl sm:text-3xl font-medium mb-4">Chapter Data Not Found</h2>
        <Link href="/dashboard/lesson">
          <button className="bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-stone-800 transition-colors">Return to Map</button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div className="relative w-full min-h-screen transition-colors duration-200 text-stone-800" style={{ backgroundColor }}>
      
      {/* 1. TOP FLOATING NAVIGATION */}
      <div className="sticky top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-start z-50 pointer-events-none">
        <Link href="/dashboard/lesson" className="pointer-events-auto">
          <button className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center backdrop-blur-xl bg-white/50 text-stone-800 border border-stone-200 hover:scale-105 transition-all shadow-sm">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </button>
        </Link>

        {/* Dynamic Unit Navigation Pills */}
        <div className="pointer-events-auto p-1.5 rounded-full flex items-center shadow-lg backdrop-blur-xl bg-white/50 border border-stone-200 text-stone-600 text-xs sm:text-sm font-medium overflow-x-auto max-w-[60vw] no-scrollbar">
          {chapter.units?.map((unit: any) => {
            const isActive = activeUnit === unit.unitId;
            return (
              <button 
                key={unit.unitId} 
                onClick={() => scrollToUnit(unit.unitId)} 
                className={`relative px-3 py-2 md:px-5 md:py-2.5 rounded-full flex items-center transition-colors duration-300 whitespace-nowrap ${isActive ? 'text-emerald-800' : 'hover:text-stone-900'}`}
              >
                {isActive && <motion.div layoutId="activeNavPill" className="absolute inset-0 rounded-full bg-emerald-100/80" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <span className="relative z-10">1.{unit.order} {unit.title}</span>
              </button>
            );
          })}
        </div>
        <div className="w-10 sm:w-12" />
      </div>

      {/* 2. CHAPTER HERO */}
      <div className="w-full flex flex-col items-center pt-12 sm:pt-20 px-4 sm:px-6 pb-16">
        <div className="max-w-4xl w-full text-center">
          <span className="text-emerald-600 font-bold tracking-widest text-xs sm:text-sm uppercase mb-4 block">
            Chapter {String(chapter.chapterNumber).padStart(2, '0')}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif leading-tight text-stone-900">
            {chapter.title}
          </h1>
        </div>
      </div>

      {/* 3. DYNAMIC UNIT MAPPING */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-32 space-y-24">
        {chapter.units?.map((unit: any) => {
          
          const unitAssets = assets.filter(a => a.unitId === unit.unitId);
          const unitQuestions = questions.filter(q => q.unitId === unit.unitId);
          
          const videoAsset = unitAssets.find(a => a.type === 'video_lecture');
          const labAsset = unitAssets.find(a => a.type === 'react_simulation');
          const documentAssets = unitAssets.filter(a => ['pdf_document', 'diagram'].includes(a.type));

          // Determine current question for this unit
          const qIndex = activeQuestionIndexes[unit.unitId] || 0;
          const currentQuestion = unitQuestions[qIndex];

          // Pre-calculate evaluation logic cleanly outside of the JSX to avoid scope errors
          const answeredValue = currentQuestion ? answeredQuestions[currentQuestion.questionId] : undefined;
          const isAnswered = !!answeredValue;
          const isCorrect = isAnswered && currentQuestion && (
            currentQuestion.type === 'numeric' 
              ? answeredValue === currentQuestion.correctAnswers?.[0] 
              : currentQuestion.correctAnswers?.includes(answeredValue)
          );

          return (
            <div key={unit.unitId} id={`unit-${unit.unitId}`} className="scroll-mt-32">
              
              <div className="flex items-center space-x-4 mb-10">
                <div className="h-12 w-12 rounded-xl bg-stone-900 text-white flex items-center justify-center font-mono text-lg font-medium shadow-md">
                  1.{unit.order}
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-stone-900">{unit.title}</h2>
              </div>

              <div className="space-y-12">
                
                {/* --- CINEMA (Video) --- */}
                {videoAsset && (
                  <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border border-stone-200">
                    {videoAsset.content?.videoUrl ? (
                      <iframe 
                        src={videoAsset.content.videoUrl}
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-stone-900">
                        <PlayCircle size={48} className="mb-4 opacity-50" />
                        <p>Video processing...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* --- LAB (React Simulation) --- */}
                {labAsset && (
                  <div className="w-full h-[50vh] bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#1c1917 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                     <Beaker size={40} className="text-amber-500 mb-4 z-10" />
                     <h3 className="text-xl font-serif z-10 text-stone-800">{labAsset.title}</h3>
                     <p className="text-sm text-stone-500 font-mono mt-2 z-10">Ref: {labAsset.content?.componentRef}</p>
                  </div>
                )}

                {/* --- DOCUMENTS (PDFs/Diagrams) --- */}
                {documentAssets.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documentAssets.map((doc, idx) => (
                      <a key={idx} href={doc.content?.fileUrl || doc.content?.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md hover:border-blue-200 transition-all group flex items-center space-x-4">
                          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            {doc.type === 'pdf_document' ? <FileText size={24} /> : <ImageIcon size={24} />}
                          </div>
                          <div>
                            <h4 className="font-medium text-stone-900">{doc.title}</h4>
                            <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">
                              {doc.type === 'pdf_document' ? 'PDF Guide' : 'Visual Diagram'}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {/* --- PRACTICE (Questions Carousel) --- */}
                {unitQuestions.length > 0 && currentQuestion && (
                  <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
                    
                    {/* Header and Progress Indicator */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-stone-100 pb-6">
                      <h3 className="text-xl font-serif text-stone-900 flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={24} /> 
                        Knowledge Check
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-stone-400">
                          {qIndex + 1} / {unitQuestions.length}
                        </span>
                        <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-emerald-400" 
                            initial={{ width: 0 }}
                            animate={{ width: `${((qIndex + 1) / unitQuestions.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Question Content Container with Framer Motion */}
                    <div className="min-h-[250px]">
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={currentQuestion.questionId}
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="w-full"
                        >
                          <p className="text-lg font-medium text-stone-800 mb-8 leading-relaxed">
                            {currentQuestion.text}
                          </p>

                          {/* Evaluation Logic */}
          {currentQuestion.type === 'numeric' ? (
            <div className="flex items-center space-x-4">
              <input
                type="number"
                disabled={isAnswered}
                className={`p-4 rounded-xl border-2 font-mono text-lg w-40 transition-colors ${isAnswered ? (isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-red-400 bg-red-50') : 'border-stone-200 focus:border-stone-400 outline-none'}`}
                placeholder="Value..."
                onBlur={(e) => !isAnswered && e.target.value && handlePracticeSelect(currentQuestion.questionId, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAnswered && e.currentTarget.value) {
                    handlePracticeSelect(currentQuestion.questionId, e.currentTarget.value);
                  }
                }}
              />
              {isAnswered && (isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options?.map((opt: any) => {
                const isSelected = answeredValue === opt.id;
                let btnStyle = "border-stone-200 text-stone-600 hover:border-emerald-300 hover:bg-emerald-50/30";
                
                if (isAnswered) {
                  if (currentQuestion.correctAnswers?.includes(opt.id)) btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-800";
                  else if (isSelected) btnStyle = "border-red-400 bg-red-50 text-red-800";
                  else btnStyle = "border-stone-100 text-stone-300 opacity-50";
                }
                
                return (
                  <button 
                    key={opt.id} 
                    disabled={isAnswered} 
                    onClick={() => handlePracticeSelect(currentQuestion.questionId, opt.id)} 
                    className={`p-4 text-left rounded-xl border-2 transition-all font-mono text-sm flex items-center justify-between ${btnStyle}`}
                  >
                    <span><span className="opacity-50 mr-2">{opt.id}.</span>{opt.text}</span>
                    {isAnswered && currentQuestion.correctAnswers?.includes(opt.id) && <CheckCircle2 size={18} className="text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Navigation Controls */}
                    <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
                      <button 
                        onClick={() => handleNavigateQuestion(unit.unitId, 'prev', unitQuestions.length)}
                        disabled={qIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>
                      
                      <div className="flex gap-2">
                        {qIndex < unitQuestions.length - 1 && !answeredQuestions[currentQuestion.questionId] && (
                           <button 
                             onClick={() => handleNavigateQuestion(unit.unitId, 'next', unitQuestions.length)}
                             className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-stone-400 hover:text-stone-700 transition-colors"
                           >
                             Skip <SkipForward size={14} />
                           </button>
                        )}
                        <button 
                          onClick={() => handleNavigateQuestion(unit.unitId, 'next', unitQuestions.length)}
                          disabled={qIndex === unitQuestions.length - 1}
                          className="flex items-center gap-2 px-5 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

    </motion.div>
  );
}