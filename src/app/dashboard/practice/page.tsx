"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PracticeEngine from './components/PracticeEngine';
import HomeworkEngine from './components/HomeworkEngine';
import QuizArena from './components/QuizArena';

// We will import these in the next steps!
// import HomeworkEngine from './components/HomeworkEngine'; 
// import QuizArena from './components/QuizArena';

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState('questions');

  const tabs = [
    { id: 'questions', label: 'Questions' },
    { id: 'homework', label: 'Homework' },
    { id: 'quiz', label: 'Quiz' }
  ];

  return (
    <div className="h-full w-full flex flex-col items-center pt-6 pb-28 px-4 max-w-[95%] xl:max-w-[90vw] mx-auto">
      
      {/* TOP PILL NAVIGATION */}
      <div className="flex bg-stone-100/80 backdrop-blur-md p-1.5 rounded-full mb-8 shadow-inner border border-stone-200/60 z-10 shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-8 py-2.5 rounded-full text-sm font-medium transition-colors z-10 ${isActive ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
            >
              {isActive && (
                <motion.div layoutId="practiceTabBubble" className="absolute inset-0 bg-white rounded-full shadow-sm border border-stone-200/50 -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* MASSIVE WHITE CANVAS */}
      <div className="flex-1 w-full bg-white rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-stone-200/40 overflow-hidden relative min-h-[65vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center p-8 md:p-14 overflow-y-auto no-scrollbar"
          >
            {/* THE ENGINE ROUTER */}
            {activeTab === 'questions' && <PracticeEngine />}
            
            {activeTab === 'homework' && <HomeworkEngine />}
            
            {activeTab === 'quiz' && <QuizArena />}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}