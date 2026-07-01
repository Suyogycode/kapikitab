"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
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
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    
    if (option === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center text-stone-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="font-light tracking-wide">Curating your recommendations...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return <h2 className="text-2xl font-serif text-stone-400">No practice data found in the global pool.</h2>;
  }

  if (isFinished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md w-full">
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

  return (
    <div className="w-full max-w-4xl flex flex-col h-full justify-between py-4">
      {/* Progress & Context Header */}
      <div className="flex justify-between items-end mb-10 border-b border-stone-100 pb-6">
        <div>
          <span className="text-emerald-600 font-bold tracking-widest text-xs uppercase mb-1 block">
            {currentQ.subject} • {currentQ.chapterTitle}
          </span>
          <h3 className="text-stone-400 font-medium text-sm">Question {currentIndex + 1} of {questions.length}</h3>
        </div>
        <div className="text-stone-800 font-medium">Score: {score}</div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col justify-center mb-10">
        <h2 className="text-3xl md:text-4xl font-serif text-stone-900 leading-snug mb-12">
          {currentQ.questionText}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === currentQ.correctAnswer;
            
            let buttonStyle = "border-stone-200 text-stone-700 hover:border-stone-400 bg-white";
            
            if (isAnswered) {
              if (isCorrect) buttonStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm";
              else if (isSelected && !isCorrect) buttonStyle = "border-red-400 bg-red-50 text-red-800 opacity-70";
              else buttonStyle = "border-stone-100 text-stone-400 bg-stone-50 opacity-50";
            }

            return (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`p-6 text-left rounded-3xl border-2 transition-all duration-300 font-mono text-lg flex justify-between items-center ${buttonStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && <CheckCircle2 size={20} className="text-emerald-600" />}
                {isAnswered && isSelected && !isCorrect && <XCircle size={20} className="text-red-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Action */}
      <div className="h-16 flex items-center justify-end">
        <AnimatePresence>
          {isAnswered && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <button onClick={handleNext} className="flex items-center space-x-2 bg-stone-900 text-white px-8 py-3.5 rounded-full hover:bg-black transition-colors shadow-md">
                <span className="font-medium">{currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}</span>
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}