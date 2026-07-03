"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Loader2, Sparkles, SkipForward } from 'lucide-react';

type Question = {
  subject: string;
  chapterTitle: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
};

export default function PracticeEngine() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Upgraded state: Stores answers by question index so we can freely move back and forth
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/practice/recommend');
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelectOption = (option: string) => {
    // Prevent changing the answer if already answered
    if (userAnswers[currentIndex]) return; 
    
    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: option
    }));
  };

  const handleNextOrSkip = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Dynamically calculate the score based on the userAnswers dictionary
  const score = questions.reduce((acc, q, idx) => {
    return acc + (userAnswers[idx] === q.correctAnswer ? 1 : 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-stone-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="font-light tracking-wide">Curating your recommendations...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return <h2 className="text-2xl font-serif text-stone-400">No practice data found.</h2>;
  }

  if (isFinished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center max-w-md w-full mx-auto">
        <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles size={32} />
        </div>
        <h2 className="text-4xl font-serif text-stone-900 mb-4">Session Complete</h2>
        <p className="text-stone-500 mb-8 font-light text-lg">You scored {score} out of {questions.length}.</p>
        <button onClick={() => window.location.reload()} className="bg-stone-900 text-white px-8 py-3 rounded-full hover:bg-black transition-colors font-medium">
          Generate New Session
        </button>
      </motion.div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredOption = userAnswers[currentIndex];
  const isAnswered = !!answeredOption;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full justify-between pt-2 pb-6 sm:py-4">
      
      {/* --- Progress & Context Header --- */}
      <div className="flex justify-between items-end mb-4 sm:mb-8 border-b border-stone-100 pb-3 sm:pb-6 shrink-0">
        <div>
          <span className="text-emerald-600 font-bold tracking-widest text-[10px] sm:text-xs uppercase mb-1 block">
            {currentQ.subject} • {currentQ.chapterTitle}
          </span>
          <h3 className="text-stone-400 font-medium text-xs sm:text-sm">Question {currentIndex + 1} of {questions.length}</h3>
        </div>
        <div className="text-stone-800 font-medium text-sm sm:text-base bg-white px-3 py-1 rounded-full shadow-sm border border-stone-100">
          Score: <span className="text-emerald-600">{score}</span>
        </div>
      </div>

      {/* --- Question Area --- */}
      <div className="flex-1 flex flex-col justify-center min-h-0">
        <h2 className="text-xl sm:text-3xl md:text-4xl font-serif text-stone-900 leading-snug mb-6 sm:mb-10 shrink-0">
          {currentQ.questionText}
        </h2>

        {/* Forced 2x2 Grid for Mobile and Desktop */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
          {currentQ.options.map((opt, i) => {
            const isSelected = answeredOption === opt;
            const isCorrect = opt === currentQ.correctAnswer;
            
            let buttonStyle = "border-stone-200 text-stone-700 hover:border-stone-400 bg-white shadow-sm";
            
            if (isAnswered) {
              if (isCorrect) buttonStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm";
              else if (isSelected && !isCorrect) buttonStyle = "border-red-400 bg-red-50 text-red-800 opacity-90";
              else buttonStyle = "border-stone-100 text-stone-400 bg-stone-50 opacity-50";
            }

            return (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`p-3 sm:p-6 text-center sm:text-left rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 font-mono text-sm sm:text-lg flex flex-col sm:flex-row justify-center sm:justify-between items-center space-y-2 sm:space-y-0 ${buttonStyle}`}
              >
                <span className="break-all sm:break-normal">{opt}</span>
                
                {/* Status Icons */}
                {isAnswered && isCorrect && <CheckCircle2 size={18} className="text-emerald-600 shrink-0 sm:w-5 sm:h-5" />}
                {isAnswered && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 shrink-0 sm:w-5 sm:h-5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Footer Action Bar --- */}
      <div className="h-16 flex items-center justify-between mt-6 shrink-0">
        
        {/* Previous Button */}
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className={`flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full transition-all ${
            currentIndex === 0 
              ? 'opacity-0 pointer-events-none' 
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 shadow-sm'
          }`}
        >
          <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
          <span className="font-medium text-xs sm:text-sm hidden sm:block">Previous</span>
        </button>

        {/* Dynamic Skip / Next Button */}
        <AnimatePresence mode="wait">
          {isAnswered ? (
            <motion.button 
              key="next"
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={handleNextOrSkip} 
              className="flex items-center space-x-1 sm:space-x-2 bg-stone-900 text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full hover:bg-black transition-colors shadow-md"
            >
              <span className="font-medium text-xs sm:text-sm">
                {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
              </span>
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
            </motion.button>
          ) : (
            <motion.button 
              key="skip"
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={handleNextOrSkip} 
              className="flex items-center space-x-1 sm:space-x-2 bg-transparent text-stone-400 hover:text-stone-600 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full transition-colors"
            >
              <span className="font-medium text-xs sm:text-sm">Skip</span>
              <SkipForward size={16} className="sm:w-5 sm:h-5" />
            </motion.button>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}