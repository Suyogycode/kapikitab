"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, User, Bot, Sparkles, Zap, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

type Question = {
  questionText: string;
  options: string[];
  correctAnswer: string;
};

const FALLBACK_DB = [
  { questionText: "What is the square root of 144?", options: ["10", "12", "14", "16"], correctAnswer: "12" },
  { questionText: "What is 15% of 200?", options: ["20", "30", "40", "50"], correctAnswer: "30" },
  { questionText: "Solve for x: 3x - 7 = 11", options: ["4", "5", "6", "7"], correctAnswer: "6" },
  { questionText: "What is the next prime number after 7?", options: ["8", "9", "10", "11"], correctAnswer: "11" },
  { questionText: "How many degrees are in a standard triangle?", options: ["90", "180", "270", "360"], correctAnswer: "180" },
  { questionText: "What is the chemical symbol for Gold?", options: ["Ag", "Au", "Pb", "Fe"], correctAnswer: "Au" },
  { questionText: "Which planet is closest to the Sun?", options: ["Venus", "Earth", "Mars", "Mercury"], correctAnswer: "Mercury" },
  { questionText: "What does CPU stand for?", options: ["Central Process Unit", "Computer Personal Unit", "Central Processing Unit", "Central Processor Unit"], correctAnswer: "Central Processing Unit" },
  { questionText: "What is the value of Pi to two decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], correctAnswer: "3.14" },
  { questionText: "Which programming language is known as the language of the web?", options: ["Python", "C++", "Java", "JavaScript"], correctAnswer: "JavaScript" }
];

const decodeHTML = (html: string) => {
  return html.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&");
};

export default function QuizArena() {
  const [gameState, setGameState] = useState<'matchmaking' | 'playing' | 'finished'>('matchmaking');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [ghostScore, setGhostScore] = useState(0);
  const [roundWinner, setRoundWinner] = useState<'player' | 'ghost' | 'nobody' | null>(null);
  
  useEffect(() => {
    const startMatchmaking = async () => {
      try {
        const categories = [17, 18, 19];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        const res = await fetch(`https://opentdb.com/api.php?amount=5&category=${randomCategory}&type=multiple`);
        const data = await res.json();
        
        let formattedQuestions: Question[] = [];

        if (data && data.results && data.results.length > 0) {
          formattedQuestions = data.results.map((q: any) => {
            const options = [...q.incorrect_answers, q.correct_answer];
            options.sort(() => Math.random() - 0.5);
            return {
              questionText: decodeHTML(q.question), 
              options: options.map((o: string) => decodeHTML(o)),
              correctAnswer: decodeHTML(q.correct_answer)
            };
          });
        } else {
          throw new Error("API returned empty data");
        }
        
        setQuestions(formattedQuestions);
        setTimeout(() => setGameState('playing'), 2500);
      } catch (error) {
        console.warn("API limit reached or offline, using shuffled fallback database.");
        const shuffledFallback = [...FALLBACK_DB].sort(() => Math.random() - 0.5).slice(0, 5);
        
        const preparedFallback = shuffledFallback.map(q => ({
          ...q,
          options: [...q.options].sort(() => Math.random() - 0.5)
        }));

        setQuestions(preparedFallback);
        setTimeout(() => setGameState('playing'), 2500);
      }
    };

    if (gameState === 'matchmaking') startMatchmaking();
  }, [gameState]);

  const handlePlayerAnswer = (selectedOption: string) => {
    if (roundWinner !== null) return; 
    
    const currentQ = questions[currentIndex];
    const isPlayerCorrect = selectedOption === currentQ.correctAnswer;
    
    if (isPlayerCorrect) {
      setPlayerScore(prev => prev + 1);
      setRoundWinner('player');
    } else {
      setGhostScore(prev => prev + 1);
      setRoundWinner('ghost');
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setRoundWinner(null);
    } else {
      setGameState('finished');
    }
  };

  if (gameState === 'matchmaking') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-stone-600 dark:text-slate-400 transition-colors duration-500">
        <div className="relative mb-6 sm:mb-8">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-emerald-500 dark:border-blue-500 opacity-20 transition-colors" />
          <div className="h-20 w-20 sm:h-24 sm:w-24 bg-stone-100 dark:bg-[#151821] rounded-full flex items-center justify-center border border-stone-200 dark:border-slate-700 transition-colors">
            <Swords size={28} className="text-stone-400 dark:text-slate-500 sm:w-8 sm:h-8" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-serif text-stone-800 dark:text-slate-200 mb-2 transition-colors">Entering the Arena</h2>
        <p className="font-light tracking-wide text-xs sm:text-sm animate-pulse">Searching for a worthy opponent...</p>
      </motion.div>
    );
  }

  if (gameState === 'finished') {
    const isWin = playerScore > ghostScore;
    const isTie = playerScore === ghostScore;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center px-4 transition-colors duration-500">
        <div className={`h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center mb-6 border-4 transition-colors ${
          isWin 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' 
            : isTie 
              ? 'bg-stone-50 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-500 dark:text-slate-400' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500 dark:text-red-400'
        }`}>
          {isWin ? <Sparkles size={32} className="sm:w-10 sm:h-10" /> : <XCircle size={32} className="sm:w-10 sm:h-10" />}
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 dark:text-slate-100 mb-2 transition-colors">{isWin ? 'Victory!' : isTie ? 'Draw!' : 'Defeat'}</h2>
        <p className="text-stone-500 dark:text-slate-400 mb-8 sm:mb-10 font-light text-sm sm:text-lg transition-colors">You scored {playerScore} • Alex scored {ghostScore}</p>
        <button onClick={() => window.location.reload()} className="bg-stone-900 dark:bg-blue-600 text-white px-8 py-3.5 rounded-full hover:bg-black dark:hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base shadow-md">
          Play Again
        </button>
      </motion.div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-full justify-between pt-2 pb-6 sm:py-4 transition-colors duration-500">
      
      {/* --- COMPACT MOBILE HEADER --- */}
      <div className="flex justify-between items-center mb-6 sm:mb-10 border-b border-stone-100 dark:border-slate-700/50 pb-4 sm:pb-6 shrink-0 transition-colors">
        
        {/* Player Stats */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-stone-900 dark:bg-[#151821] text-white dark:text-slate-200 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm transition-colors">
            <User size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="font-medium text-stone-900 dark:text-slate-100 leading-tight text-sm sm:text-base transition-colors">You</h3>
            <span className="text-stone-400 dark:text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest block mt-0.5 transition-colors">Score: {playerScore}</span>
          </div>
        </div>

        {/* VS Badge */}
        <div className="px-3 py-1 sm:px-4 sm:py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full font-bold text-xs sm:text-sm border border-rose-100 dark:border-rose-800/30 flex items-center space-x-1 sm:space-x-2 shrink-0 transition-colors">
          <Zap size={12} className="sm:w-3.5 sm:h-3.5" /> 
          <span>VS</span>
        </div>

        {/* AI Stats */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-right">
          <div>
            <h3 className="font-medium text-stone-900 dark:text-slate-100 leading-tight text-sm sm:text-base transition-colors">Alex</h3>
            <span className="text-stone-400 dark:text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest block mt-0.5 transition-colors">Score: {ghostScore}</span>
          </div>
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-stone-100 dark:bg-[#151821] text-stone-500 dark:text-slate-400 border border-stone-200 dark:border-slate-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm transition-colors">
            <Bot size={18} className="sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* --- QUESTION & 2x2 GRID --- */}
      <div className="flex-1 flex flex-col justify-center min-h-0">
        <h2 className="text-xl sm:text-3xl md:text-4xl font-serif text-stone-900 dark:text-slate-100 leading-snug mb-6 sm:mb-12 text-center max-w-3xl mx-auto shrink-0 transition-colors">
          {currentQ.questionText}
        </h2>
        
        {/* Forced 2x2 Grid Layout */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
          {currentQ.options.map((opt, i) => {
            let buttonStyle = "border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300 hover:border-stone-400 dark:hover:border-slate-500 bg-white dark:bg-[#151821]";
            
            if (roundWinner !== null) {
              if (opt === currentQ.correctAnswer) buttonStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 shadow-sm";
              else buttonStyle = "border-stone-100 dark:border-slate-800 text-stone-400 dark:text-slate-600 bg-stone-50 dark:bg-[#1A1D27] opacity-60";
            }

            return (
              <button 
                key={i} 
                disabled={roundWinner !== null} 
                onClick={() => handlePlayerAnswer(opt)} 
                className={`p-3 sm:p-6 text-center sm:text-left rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 font-mono text-xs sm:text-lg flex flex-col sm:flex-row justify-center sm:justify-between items-center space-y-2 sm:space-y-0 min-h-[4rem] sm:min-h-[5rem] ${buttonStyle}`}
              >
                <span className="break-words line-clamp-3 w-full px-1">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- DYNAMIC ACTION FOOTER --- */}
      <div className="h-14 sm:h-16 flex items-center justify-end mt-4 shrink-0">
        <AnimatePresence>
          {roundWinner !== null && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }}
              onClick={handleNextQuestion}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-emerald-600 dark:bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full hover:bg-emerald-700 dark:hover:bg-blue-700 transition-colors shadow-md"
            >
              <span className="font-medium text-xs sm:text-sm">
                {currentIndex === questions.length - 1 ? 'Finish Match' : 'Next Question'}
              </span>
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
}