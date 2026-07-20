"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, ArrowRight, ArrowLeft, Loader2, 
  Sparkles, SkipForward, BookOpen, Layers, Hash, CheckSquare
} from 'lucide-react';
import { useSession } from 'next-auth/react';

// --- TYPES ALIGNED WITH MONGODB SCHEMA ---
type Option = {
  id: string;
  text: string;
};

type Question = {
  questionId: string;
  type: 'mcq_single' | 'mcq_multiple' | 'numeric';
  text: string;
  options: Option[];
  correctAnswers: string[];
  explanation?: string;
  tolerance?: number;
};

type Chapter = {
  chapterId: string;
  title: string;
  chapterNumber: number;
};

type Subject = {
  id: string;
  label: string;
};

export default function PracticeEngine() {
  const { data: session } = useSession();
  const classId = (session?.user as any)?.classId || 'c12'; // Auto-fetches from NextAuth

  // --- CONFIGURATION STATE ---
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [availableChapters, setAvailableChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);

  // --- ENGINE STATE ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Store answers as arrays of selected IDs (or numeric strings)
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});
  // Track which questions have been permanently submitted/locked
  const [lockedAnswers, setLockedAnswers] = useState<Record<number, boolean>>({});

  // 1. FETCH SUBJECTS BASED ON USER'S CLASS
  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const res = await fetch(`/api/content/curriculum?classId=${classId}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.subjects) {
            setSubjects(data.subjects.map((s: any) => ({ id: s.subjectId, label: s.title })));
          }
        }
      } catch (error) {
        console.error("Failed to load curriculum subjects", error);
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    if (classId) fetchSubjects();
  }, [classId]);

  // 2. FETCH CHAPTERS WHEN SUBJECT IS SELECTED
  useEffect(() => {
    const fetchChapters = async () => {
      if (!selectedSubject) return;
      setIsLoadingChapters(true);
      try {
        const res = await fetch(`/api/content/chapters?classId=${classId}&subjectId=${selectedSubject}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableChapters(data.sort((a: any, b: any) => a.chapterNumber - b.chapterNumber));
        }
      } catch (error) {
        console.error("Failed to load chapters", error);
      } finally {
        setIsLoadingChapters(false);
      }
    };

    fetchChapters();
    setSelectedChapter(null); 
  }, [selectedSubject, classId]);

  // 3. FETCH QUESTIONS TO START ENGINE
  const handleStartPractice = async () => {
    if (!selectedSubject || !selectedChapter) return;
    
    setIsConfiguring(false);
    setIsLoadingQuestions(true);
    
    try {
      const res = await fetch(`/api/practice/questions?subjectId=${selectedSubject}&chapterId=${selectedChapter}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Failed to load questions", error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // --- ANSWER EVALUATION LOGIC ---
  const isAnswerCorrect = (q: Question, ansArray: string[]) => {
    if (!ansArray || ansArray.length === 0) return false;
    
    if (q.type === 'numeric') {
      const numAns = parseFloat(ansArray[0]);
      const target = parseFloat(q.correctAnswers[0]);
      const tol = q.tolerance || 0;
      return Math.abs(numAns - target) <= tol;
    } else {
      // For single & multiple MCQ: Sort and compare arrays exactly
      const sortedAns = [...ansArray].sort();
      const sortedTarget = [...q.correctAnswers].sort();
      return JSON.stringify(sortedAns) === JSON.stringify(sortedTarget);
    }
  };

  const handleOptionToggle = (optId: string, qType: string) => {
    if (lockedAnswers[currentIndex]) return;
    
    if (qType === 'mcq_single') {
      setUserAnswers(prev => ({ ...prev, [currentIndex]: [optId] }));
      setLockedAnswers(prev => ({ ...prev, [currentIndex]: true })); // Auto-lock single choices
    } else if (qType === 'mcq_multiple') {
      setUserAnswers(prev => {
        const current = prev[currentIndex] || [];
        const updated = current.includes(optId) 
          ? current.filter(id => id !== optId) 
          : [...current, optId];
        return { ...prev, [currentIndex]: updated };
      });
    }
  };

  const handleNumericInput = (val: string) => {
    if (lockedAnswers[currentIndex]) return;
    setUserAnswers(prev => ({ ...prev, [currentIndex]: [val] }));
  };

  const submitManualAnswer = () => {
    if ((userAnswers[currentIndex] || []).length > 0) {
      setLockedAnswers(prev => ({ ...prev, [currentIndex]: true }));
    }
  };

  const handleNextOrSkip = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const resetEngine = () => {
    setIsFinished(false);
    setIsConfiguring(true);
    setUserAnswers({});
    setLockedAnswers({});
    setCurrentIndex(0);
    setQuestions([]);
  };

  // Calculate live score
  const score = questions.reduce((acc, q, idx) => {
    return acc + (lockedAnswers[idx] && isAnswerCorrect(q, userAnswers[idx]) ? 1 : 0);
  }, 0);


  // ==========================================================================
  // VIEW 1: CONFIGURATION (Dynamic fetching)
  // ==========================================================================
  if (isConfiguring) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-stone-900 mb-3">Configure Practice Session</h2>
          <p className="text-stone-500 font-light text-sm">Select a subject and chapter for Class {classId.replace('c', '')}</p>
        </div>

        <div className="w-full mb-8">
          <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
            <BookOpen size={14} /> <span>1. Select Subject</span>
          </label>
          
          {isLoadingSubjects ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-stone-400" size={24} /></div>
          ) : subjects.length === 0 ? (
             <div className="text-center p-6 border border-dashed border-stone-200 rounded-2xl bg-stone-50 text-stone-500 text-sm">No subjects found for your class.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`py-3 px-4 rounded-2xl text-sm font-medium transition-all border ${
                    selectedSubject === sub.id ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm' : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-300'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedSubject && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="w-full mb-10">
              <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                <Layers size={14} /> <span>2. Target Chapter</span>
              </label>
              
              {isLoadingChapters ? (
                <div className="flex items-center justify-center py-6 text-stone-400"><Loader2 className="animate-spin" size={24} /></div>
              ) : availableChapters.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-stone-200 rounded-2xl bg-stone-50 text-stone-500 text-sm">No chapters uploaded for this subject yet.</div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedChapter || ""}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="w-full appearance-none p-4 rounded-2xl border-2 border-stone-200 bg-white text-stone-800 text-sm font-medium transition-colors focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="" disabled>Select a specific chapter...</option>
                    {availableChapters.map((ch) => (
                      <option key={ch.chapterId} value={ch.chapterId}>
                        Ch {ch.chapterNumber}: {ch.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedSubject && selectedChapter && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              onClick={handleStartPractice}
              className="bg-stone-900 text-white px-8 py-3.5 rounded-full hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10 font-medium flex items-center space-x-2"
            >
              <span>Initialize Session</span><ArrowRight size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // ==========================================================================
  // VIEW 2: LOADING & EMPTY STATES
  // ==========================================================================
  if (isLoadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-stone-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="font-light tracking-wide">Compiling question bank...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-serif text-stone-400 mb-4">No practice data found for this chapter.</h2>
        <button onClick={resetEngine} className="text-emerald-600 font-medium hover:underline">Return to Settings</button>
      </div>
    );
  }

  // ==========================================================================
  // VIEW 3: FINISHED STATE
  // ==========================================================================
  if (isFinished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md w-full mx-auto">
        <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><Sparkles size={32} /></div>
        <h2 className="text-4xl font-serif text-stone-900 mb-4">Session Complete</h2>
        <p className="text-stone-500 mb-8 font-light text-lg">You scored {score} out of {questions.length}.</p>
        <button onClick={resetEngine} className="bg-stone-900 text-white px-8 py-3 rounded-full hover:bg-black transition-colors font-medium">Configure New Session</button>
      </motion.div>
    );
  }

  // ==========================================================================
  // VIEW 4: ACTIVE ENGINE (Schema Compliant)
  // ==========================================================================
  const currentQ = questions[currentIndex];
  const currentAnswers = userAnswers[currentIndex] || [];
  const isLocked = lockedAnswers[currentIndex];
  const isCorrect = isLocked && isAnswerCorrect(currentQ, currentAnswers);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl mx-auto flex flex-col h-full justify-between pt-2 pb-6 sm:py-4">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-4 sm:mb-8 border-b border-stone-100 pb-3 sm:pb-6 shrink-0">
        <div>
          <span className="text-emerald-600 font-bold tracking-widest text-[10px] sm:text-xs uppercase mb-1 block">
             Practice Session
          </span>
          <h3 className="text-stone-400 font-medium text-xs sm:text-sm">Question {currentIndex + 1} of {questions.length}</h3>
        </div>
        <div className="text-stone-800 font-medium text-sm sm:text-base bg-white px-3 py-1 rounded-full shadow-sm border border-stone-100">
          Score: <span className="text-emerald-600">{score}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center min-h-0 py-8">
        
        {/* Question Text */}
        <div className="mb-6 sm:mb-10 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-500 rounded-md text-[10px] font-bold uppercase tracking-widest mb-4">
             {currentQ.type === 'mcq_multiple' ? <CheckSquare size={12}/> : currentQ.type === 'numeric' ? <Hash size={12}/> : null}
             {currentQ.type.replace('_', ' ')}
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-serif text-stone-900 leading-snug">
            {currentQ.text}
          </h2>
        </div>

        {/* Dynamic Input based on Schema Type */}
        {currentQ.type === 'numeric' ? (
          <div className="max-w-xs space-y-4">
            <input 
              type="number" 
              disabled={isLocked}
              value={currentAnswers[0] || ''}
              onChange={(e) => handleNumericInput(e.target.value)}
              placeholder="Enter exact value..."
              className={`w-full p-4 text-xl font-mono border-2 rounded-2xl transition-colors focus:outline-none ${isLocked ? (isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-red-50 border-red-400 text-red-900') : 'bg-white border-stone-200 focus:border-stone-400'}`}
            />
            {!isLocked && (
               <button onClick={submitManualAnswer} disabled={currentAnswers.length === 0} className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium disabled:opacity-50">Lock Answer</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 shrink-0">
            {currentQ.options.map((opt) => {
              const isSelected = currentAnswers.includes(opt.id);
              const isActuallyCorrect = currentQ.correctAnswers.includes(opt.id);
              
              let buttonStyle = "border-stone-200 text-stone-700 bg-white shadow-sm hover:border-stone-400";
              
              if (isLocked) {
                if (isActuallyCorrect) buttonStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-500";
                else if (isSelected && !isActuallyCorrect) buttonStyle = "border-red-400 bg-red-50 text-red-800 opacity-90";
                else buttonStyle = "border-stone-100 text-stone-400 bg-stone-50 opacity-50";
              } else if (isSelected) {
                buttonStyle = "border-stone-900 bg-stone-900 text-white shadow-md";
              }

              return (
                <button
                  key={opt.id}
                  disabled={isLocked}
                  onClick={() => handleOptionToggle(opt.id, currentQ.type)}
                  className={`p-4 sm:p-6 text-left rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 font-mono text-sm sm:text-lg flex justify-between items-center group ${buttonStyle}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold border transition-colors ${isSelected && !isLocked ? 'border-white text-white' : 'border-stone-300 text-stone-400 group-hover:border-stone-400'}`}>
                      {opt.id}
                    </span>
                    <span className="break-all sm:break-normal pr-4">{opt.text}</span>
                  </div>
                  {isLocked && isActuallyCorrect && <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />}
                  {isLocked && isSelected && !isActuallyCorrect && <XCircle size={20} className="text-red-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
        
        {/* Render submit button for multiple choice if not locked */}
        {currentQ.type === 'mcq_multiple' && !isLocked && (
          <div className="mt-6 flex justify-end">
            <button onClick={submitManualAnswer} disabled={currentAnswers.length === 0} className="px-8 py-3 bg-stone-900 text-white rounded-full font-medium disabled:opacity-50">Lock Multiple Selection</button>
          </div>
        )}

        {/* Explanation Block */}
        <AnimatePresence>
          {isLocked && currentQ.explanation && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-4 rounded-2xl bg-stone-100/50 border border-stone-200">
               <span className="text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1 block">Explanation</span>
               <p className="text-sm text-stone-700 leading-relaxed font-medium">{currentQ.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Footer Action Bar */}
      <div className="h-16 flex items-center justify-between mt-6 shrink-0">
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className={`flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full transition-all ${
            currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 shadow-sm'
          }`}
        >
          <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
          <span className="font-medium text-xs sm:text-sm hidden sm:block">Previous</span>
        </button>

        <AnimatePresence mode="wait">
          {isLocked ? (
            <motion.button 
              key="next"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={handleNextOrSkip} 
              className="flex items-center space-x-1 sm:space-x-2 bg-stone-900 text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full hover:bg-black transition-colors shadow-md"
            >
              <span className="font-medium text-xs sm:text-sm">{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}</span>
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
            </motion.button>
          ) : (
            <motion.button 
              key="skip"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={handleNextOrSkip} 
              className="flex items-center space-x-1 sm:space-x-2 bg-transparent text-stone-400 hover:text-stone-600 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full transition-colors"
            >
              <span className="font-medium text-xs sm:text-sm">Skip</span>
              <SkipForward size={16} className="sm:w-5 sm:h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}