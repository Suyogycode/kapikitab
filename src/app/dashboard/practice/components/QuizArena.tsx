"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, User, Bot, Loader2, Sparkles, Zap, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

type Question = {
  questionText: string;
  options: string[];
  correctAnswer: string;
};

export default function QuizArena() {
  const [gameState, setGameState] = useState<'matchmaking' | 'playing' | 'finished'>('matchmaking');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [ghostScore, setGhostScore] = useState(0);
  const [roundWinner, setRoundWinner] = useState<'player' | 'ghost' | 'nobody' | null>(null);
  
  // Fetch Questions
  useEffect(() => {
    const startMatchmaking = async () => {
      try {
        const res = await fetch('https://opentdb.com/api.php?amount=5&category=19&type=multiple');
        const data = await res.json();
        
        let formattedQuestions: Question[] = [];

        if (data && data.results && data.results.length > 0) {
          formattedQuestions = data.results.map((q: any) => {
            const options = [...q.incorrect_answers, q.correct_answer];
            options.sort(() => Math.random() - 0.5);
            return {
              questionText: q.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'"), 
              options: options.map((o: string) => o.replace(/&quot;/g, '"').replace(/&#039;/g, "'")),
              correctAnswer: q.correct_answer.replace(/&quot;/g, '"').replace(/&#039;/g, "'")
            };
          });
        } else {
          formattedQuestions = [
            { questionText: "What is the square root of 144?", options: ["10", "12", "14", "16"], correctAnswer: "12" },
            { questionText: "What is 15% of 200?", options: ["20", "30", "40", "50"], correctAnswer: "30" },
            { questionText: "Solve for x: 3x - 7 = 11", options: ["4", "5", "6", "7"], correctAnswer: "6" },
            { questionText: "What is the next prime number after 7?", options: ["8", "9", "10", "11"], correctAnswer: "11" },
            { questionText: "How many degrees are in a standard triangle?", options: ["90", "180", "270", "360"], correctAnswer: "180" }
          ];
        }
        
        setQuestions(formattedQuestions);
        setTimeout(() => setGameState('playing'), 3000);
      } catch (error) {
        console.error("Failed to load arena data:", error);
      }
    };

    if (gameState === 'matchmaking') startMatchmaking();
  }, [gameState]);

  const handlePlayerAnswer = (selectedOption: string) => {
    if (roundWinner !== null) return; 

    // Simulate Ghost reaction (80% accuracy, random speed)
    const ghostThinkTime = Math.floor(Math.random() * (4000 - 1000 + 1) + 1000);
    const isGhostCorrect = Math.random() < 0.8;
    
    // Determine round winner immediately based on player speed vs ghost speed
    const currentQ = questions[currentIndex];
    const isPlayerCorrect = selectedOption === currentQ.correctAnswer;
    
    // Logic: If player is correct, they win unless ghost answers *instantly* (simplified)
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-stone-600">
        <div className="relative mb-8">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-emerald-500 opacity-20" />
          <div className="h-24 w-24 bg-stone-100 rounded-full flex items-center justify-center border border-stone-200">
            <Swords size={32} className="text-stone-400" />
          </div>
        </div>
        <h2 className="text-2xl font-serif text-stone-800 mb-2">Entering the Arena</h2>
        <p className="font-light tracking-wide text-sm animate-pulse">Searching for a worthy opponent...</p>
      </motion.div>
    );
  }

  if (gameState === 'finished') {
    const isWin = playerScore > ghostScore;
    const isTie = playerScore === ghostScore;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center">
        <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-6 border-4 ${isWin ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : isTie ? 'bg-stone-50 border-stone-200 text-stone-500' : 'bg-red-50 border-red-200 text-red-500'}`}>
          {isWin ? <Sparkles size={40} /> : <XCircle size={40} />}
        </div>
        <h2 className="text-4xl font-serif text-stone-900 mb-2">{isWin ? 'Victory!' : isTie ? 'Draw!' : 'Defeat'}</h2>
        <p className="text-stone-500 mb-10 font-light text-lg">You scored {playerScore} • Alex_Scholar scored {ghostScore}</p>
        <button onClick={() => window.location.reload()} className="bg-stone-900 text-white px-8 py-3 rounded-full hover:bg-black transition-colors font-medium">
          Play Again
        </button>
      </motion.div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="w-full max-w-5xl flex flex-col h-full justify-between py-4">
      <div className="flex justify-between items-center mb-10 border-b border-stone-100 pb-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center shadow-sm"><User size={20} /></div>
          <div><h3 className="font-medium text-stone-900 leading-tight">You</h3><span className="text-stone-400 text-xs uppercase tracking-widest">Score: {playerScore}</span></div>
        </div>
        <div className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full font-bold text-sm border border-rose-100 flex items-center space-x-2"><Zap size={14} /> <span>VS</span></div>
        <div className="flex items-center space-x-4 text-right">
          <div><h3 className="font-medium text-stone-900 leading-tight">Alex_Scholar</h3><span className="text-stone-400 text-xs uppercase tracking-widest">Score: {ghostScore}</span></div>
          <div className="h-12 w-12 bg-stone-100 text-stone-500 border border-stone-200 rounded-2xl flex items-center justify-center shadow-sm"><Bot size={20} /></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center mb-10 relative">
        <h2 className="text-3xl md:text-4xl font-serif text-stone-900 leading-snug mb-12 text-center max-w-3xl mx-auto">{currentQ.questionText}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt, i) => {
            let buttonStyle = "border-stone-200 text-stone-700 hover:border-stone-400 bg-white";
            if (roundWinner !== null) {
              if (opt === currentQ.correctAnswer) buttonStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm";
              else buttonStyle = "border-stone-100 text-stone-400 bg-stone-50 opacity-50";
            }
            return (
              <button key={i} disabled={roundWinner !== null} onClick={() => handlePlayerAnswer(opt)} className={`p-6 text-left rounded-3xl border-2 transition-all duration-300 font-mono text-lg ${buttonStyle}`}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* MANUAL NEXT BUTTON */}
      <div className="h-16 flex items-center justify-end">
        <AnimatePresence>
          {roundWinner !== null && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              onClick={handleNextQuestion}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-8 py-3.5 rounded-full hover:bg-emerald-700 transition-colors shadow-md"
            >
              <span>{currentIndex === questions.length - 1 ? 'Finish Match' : 'Next Question'}</span>
              <ArrowRight size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}