"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation'; 
import { 
  ArrowLeft, PlayCircle, Beaker, 
  CheckCircle2, XCircle, FileText, ImageIcon, Loader2, ChevronLeft, ChevronRight, SkipForward
} from 'lucide-react';
import Link from 'next/link';

import ReactPuzzleRenderer from '@/components/interactives/2d-simulations/ReactPuzzleRenderer';
import AudioOverviewPlayer from '@/app/learning/AudioOverviewPlayer';

export default function DynamicLearningWorkspace() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [chapter, setChapter] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUnit, setActiveUnit] = useState<string>('');

  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, string>>({});
  const [activeQuestionIndexes, setActiveQuestionIndexes] = useState<Record<string, number>>({});

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

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF8] dark:bg-[#1C1F2B] text-stone-800 dark:text-slate-200 transition-colors duration-500">
        <Loader2 className="animate-spin text-emerald-600 dark:text-blue-400 mb-4" size={40} />
        <h2 className="font-serif text-xl sm:text-2xl font-medium">Mounting Curriculum...</h2>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF8] dark:bg-[#1C1F2B] text-stone-800 dark:text-slate-200 transition-colors duration-500">
        <h2 className="font-serif text-2xl sm:text-3xl font-medium mb-4">Chapter Data Not Found</h2>
        <Link href="/dashboard/lesson">
          <button className="bg-stone-900 dark:bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-stone-800 dark:hover:bg-blue-500 transition-colors">Return to Map</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen transition-colors duration-500 text-stone-800 dark:text-slate-200 bg-[#FDFCF8] dark:bg-[#1C1F2B]">
      
      {/* STICKY NAVIGATION BAR */}
      <div className="sticky top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-start z-50 pointer-events-none">
        <Link href="/dashboard/lesson" className="pointer-events-auto">
          <button className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center backdrop-blur-xl bg-white/50 dark:bg-[#282C3D]/50 text-stone-800 dark:text-slate-300 border border-stone-200 dark:border-slate-700 hover:scale-105 transition-all shadow-sm">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </button>
        </Link>

        <div className="pointer-events-auto p-1.5 rounded-full flex items-center shadow-lg backdrop-blur-xl bg-white/50 dark:bg-[#282C3D]/50 border border-stone-200 dark:border-slate-700/80 text-stone-600 dark:text-slate-400 text-xs sm:text-sm font-medium overflow-x-auto max-w-[60vw] no-scrollbar transition-colors">
          {chapter.units?.map((unit: any) => {
            const isActive = activeUnit === unit.unitId;
            return (
              <button 
                key={unit.unitId} 
                onClick={() => scrollToUnit(unit.unitId)} 
                className={`relative px-3 py-2 md:px-5 md:py-2.5 rounded-full flex items-center transition-colors duration-300 whitespace-nowrap ${isActive ? 'text-emerald-800 dark:text-blue-200' : 'hover:text-stone-900 dark:hover:text-slate-200'}`}
              >
                {isActive && <motion.div layoutId="activeNavPill" className="absolute inset-0 rounded-full bg-emerald-100/80 dark:bg-blue-900/40" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <span className="relative z-10">1.{unit.order} {unit.title}</span>
              </button>
            );
          })}
        </div>
        <div className="w-10 sm:w-12" />
      </div>

      {/* HEADER SECTION */}
      <div className="w-full flex flex-col items-center pt-12 sm:pt-20 px-4 sm:px-6 pb-12">
        <div className="max-w-4xl w-full text-center">
          <span className="text-emerald-600 dark:text-blue-400 font-bold tracking-widest text-xs sm:text-sm uppercase mb-4 block transition-colors">
            Chapter {String(chapter.chapterNumber).padStart(2, '0')}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif leading-tight text-stone-900 dark:text-slate-100 transition-colors">
            {chapter.title}
          </h1>
        </div>
      </div>

      {/* AUDIO OVERVIEW PLAYER */}
      <div className="w-full px-4 sm:px-6 mb-16">
        <AudioOverviewPlayer 
          chapterId={chapter.chapterId} 
          chapterTitle={chapter.title} 
        />
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-32 space-y-24">
        {chapter.units?.map((unit: any) => {
          
          const unitAssets = assets.filter(a => a.unitId === unit.unitId);
          const unitQuestions = questions.filter(q => q.unitId === unit.unitId);
          
          const videoAsset = unitAssets.find(a => a.type === 'video_lecture');
          const labAsset = unitAssets.find(a => a.type === 'react_simulation');
          const documentAssets = unitAssets.filter(a => ['pdf_document', 'diagram'].includes(a.type));

          const qIndex = activeQuestionIndexes[unit.unitId] || 0;
          const currentQuestion = unitQuestions[qIndex];

          const answeredValue = currentQuestion ? answeredQuestions[currentQuestion.questionId] : undefined;
          const isAnswered = !!answeredValue;
          const isCorrect = isAnswered && currentQuestion && (
            currentQuestion.type === 'numeric' 
              ? answeredValue === currentQuestion.correctAnswers?.[0] 
              : currentQuestion.correctAnswers?.includes(answeredValue)
          );

          const labComponentRef = labAsset 
            ? (typeof labAsset.content === 'object' ? labAsset.content?.componentRef : labAsset.content)
            : null;

          return (
            <div key={unit.unitId} id={`unit-${unit.unitId}`} className="scroll-mt-32">
              
              <div className="flex items-center space-x-4 mb-10">
                <div className="h-12 w-12 rounded-xl bg-stone-900 dark:bg-blue-600 text-white flex items-center justify-center font-mono text-lg font-medium shadow-md transition-colors">
                  1.{unit.order}
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 dark:text-slate-100 transition-colors">{unit.title}</h2>
              </div>

              <div className="space-y-12">
                
                {/* 1. VIDEO LAYER */}
                {videoAsset && (
                  <div className="w-full aspect-video bg-black dark:bg-[#0F1117] rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-slate-800 transition-colors">
                    {videoAsset.content?.videoUrl ? (
                      <iframe src={videoAsset.content.videoUrl} className="w-full h-full border-0" allowFullScreen />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-stone-900 dark:bg-[#0F1117]">
                        <PlayCircle size={48} className="mb-4 opacity-50" />
                        <p>Video processing...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. DYNAMIC 2D PUZZLE RENDERER */}
                {labAsset && (
                  <div className="w-full my-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Beaker size={20} className="text-amber-500 dark:text-blue-400 transition-colors" />
                      <h3 className="text-xl font-serif text-stone-900 dark:text-slate-100 transition-colors">{labAsset.title}</h3>
                    </div>
                    {labComponentRef ? (
                      <ReactPuzzleRenderer componentRef={labComponentRef} />
                    ) : (
                      <div className="p-6 bg-amber-50 dark:bg-blue-900/10 border border-amber-200 dark:border-blue-800/30 rounded-2xl text-amber-800 dark:text-blue-300 text-sm transition-colors">
                        No <code>componentRef</code> pointer found for this lab asset.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. DIAGRAMS & PDF DOCUMENTS */}
                {documentAssets.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documentAssets.map((doc, idx) => {
                      const assetUrl = typeof doc.content === 'string' 
                        ? doc.content 
                        : doc.content?.url || doc.content?.imageUrl || doc.content?.fileUrl;

                      if (doc.type === 'diagram') {
                        return (
                          <div key={idx} className="bg-white dark:bg-[#282C3D] rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700/80 overflow-hidden flex flex-col group transition-colors">
                            <div className="w-full h-48 bg-stone-100 dark:bg-[#151821] relative overflow-hidden transition-colors">
                              <img 
                                src={assetUrl} 
                                alt={doc.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="p-4 bg-white dark:bg-[#282C3D] flex items-center justify-between transition-colors">
                              <div>
                                <h4 className="font-medium text-stone-900 dark:text-slate-200 transition-colors">{doc.title}</h4>
                                <span className="text-[10px] text-stone-400 dark:text-slate-500 uppercase tracking-widest font-bold transition-colors">Visual Diagram</span>
                              </div>
                              <a href={assetUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-50 dark:bg-[#151821] hover:bg-stone-100 dark:hover:bg-slate-700 rounded-lg text-stone-500 dark:text-slate-400 transition-colors">
                                <ImageIcon size={18} />
                              </a>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <a key={idx} href={assetUrl} target="_blank" rel="noopener noreferrer" className="block">
                          <div className="bg-white dark:bg-[#282C3D] p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700/80 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500 transition-all group flex items-center space-x-4 h-full">
                            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
                              <FileText size={24} />
                            </div>
                            <div>
                              <h4 className="font-medium text-stone-900 dark:text-slate-200 transition-colors">{doc.title}</h4>
                              <span className="text-xs text-stone-400 dark:text-slate-500 uppercase tracking-widest font-bold transition-colors">PDF Guide</span>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}

                {/* 4. PRACTICE QUESTION BANK */}
                {unitQuestions.length > 0 && currentQuestion && (
                  <div className="bg-white dark:bg-[#282C3D] border border-stone-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden transition-colors">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-stone-100 dark:border-slate-700/50 pb-6 transition-colors">
                      <h3 className="text-xl font-serif text-stone-900 dark:text-slate-100 flex items-center gap-3 transition-colors">
                        <CheckCircle2 className="text-emerald-500 dark:text-blue-400" size={24} /> 
                        Knowledge Check
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-stone-400 dark:text-slate-500 transition-colors">
                          {qIndex + 1} / {unitQuestions.length}
                        </span>
                        <div className="w-24 h-1.5 bg-stone-100 dark:bg-[#151821] rounded-full overflow-hidden transition-colors">
                          <motion.div 
                            className="h-full bg-emerald-400 dark:bg-blue-500" 
                            initial={{ width: 0 }}
                            animate={{ width: `${((qIndex + 1) / unitQuestions.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="min-h-62.5">
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={currentQuestion.questionId}
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="w-full"
                        >
                          <p className="text-lg font-medium text-stone-800 dark:text-slate-200 mb-8 leading-relaxed transition-colors">
                            {currentQuestion.text}
                          </p>

                          {currentQuestion.type === 'numeric' ? (
                            <div className="flex items-center space-x-4">
                              <input
                                type="number"
                                disabled={isAnswered}
                                className={`p-4 rounded-xl border-2 font-mono text-lg w-40 transition-colors outline-none ${
                                  isAnswered 
                                    ? (isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300' : 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:text-red-300') 
                                    : 'border-stone-200 dark:border-slate-600 bg-white dark:bg-[#151821] text-stone-800 dark:text-slate-200 focus:border-stone-400 dark:focus:border-slate-400'
                                }`}
                                placeholder="Value..."
                                onBlur={(e) => !isAnswered && e.target.value && handlePracticeSelect(currentQuestion.questionId, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !isAnswered && e.currentTarget.value) {
                                    handlePracticeSelect(currentQuestion.questionId, e.currentTarget.value);
                                  }
                                }}
                              />
                              {isAnswered && (isCorrect ? <CheckCircle2 className="text-emerald-500 dark:text-emerald-400" /> : <XCircle className="text-red-500 dark:text-red-400" />)}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {currentQuestion.options?.map((opt: any) => {
                                const isSelected = answeredValue === opt.id;
                                let btnStyle = "border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-blue-500 hover:bg-emerald-50/30 dark:hover:bg-[#151821]";
                                
                                if (isAnswered) {
                                  if (currentQuestion.correctAnswers?.includes(opt.id)) btnStyle = "border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300";
                                  else if (isSelected) btnStyle = "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
                                  else btnStyle = "border-stone-100 dark:border-slate-800 text-stone-300 dark:text-slate-600 opacity-50";
                                }
                                
                                return (
                                  <button 
                                    key={opt.id} 
                                    disabled={isAnswered} 
                                    onClick={() => handlePracticeSelect(currentQuestion.questionId, opt.id)} 
                                    className={`p-4 text-left rounded-xl border-2 transition-all font-mono text-sm flex items-center justify-between ${btnStyle}`}
                                  >
                                    <span><span className="opacity-50 mr-2">{opt.id}.</span>{opt.text}</span>
                                    {isAnswered && currentQuestion.correctAnswers?.includes(opt.id) && <CheckCircle2 size={18} className="text-emerald-500 dark:text-emerald-400" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {isAnswered && currentQuestion.explanation && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              className={`mt-6 p-5 rounded-xl border overflow-hidden transition-colors ${
                                isCorrect 
                                  ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' 
                                  : 'bg-stone-50 dark:bg-[#151821] border-stone-200 dark:border-slate-700/50'
                              }`}
                            >
                              <h4 className="text-xs font-bold tracking-widest uppercase text-stone-500 dark:text-slate-500 mb-2 transition-colors">Explanation</h4>
                              <p className="text-sm text-stone-700 dark:text-slate-300 font-medium leading-relaxed transition-colors">
                                {currentQuestion.explanation}
                              </p>
                            </motion.div>
                          )}

                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="mt-8 pt-6 border-t border-stone-100 dark:border-slate-700/50 flex items-center justify-between transition-colors">
                      <button 
                        onClick={() => handleNavigateQuestion(unit.unitId, 'prev', unitQuestions.length)}
                        disabled={qIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 hover:bg-stone-50 dark:hover:bg-[#151821] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>
                      
                      <div className="flex gap-2">
                        {qIndex < unitQuestions.length - 1 && !answeredQuestions[currentQuestion.questionId] && (
                           <button 
                             onClick={() => handleNavigateQuestion(unit.unitId, 'next', unitQuestions.length)}
                             className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors"
                           >
                             Skip <SkipForward size={14} />
                           </button>
                        )}
                        <button 
                          onClick={() => handleNavigateQuestion(unit.unitId, 'next', unitQuestions.length)}
                          disabled={qIndex === unitQuestions.length - 1}
                          className="flex items-center gap-2 px-5 py-2 bg-stone-900 dark:bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-stone-800 dark:hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
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

    </div>
  );
}