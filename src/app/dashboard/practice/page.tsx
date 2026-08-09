"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PracticeEngine from './components/PracticeEngine';
import HomeworkEngine from './components/HomeworkEngine';
import QuizArena from './components/QuizArena';

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState('questions');

  const tabs = [
    { id: 'questions', label: 'Questions' },
    { id: 'homework', label: 'Homework' },
    { id: 'quiz', label: 'Quiz' }
  ];

  return (
    <div className="min-h-full w-full flex flex-col items-center pt-6 pb-32 px-2 sm:px-4 max-w-[100%] xl:max-w-[85vw] mx-auto transition-colors duration-500">
      
      {/* TOP PILL NAVIGATION */}
      <div className="flex bg-stone-100/80 dark:bg-[#151821]/80 backdrop-blur-md p-1.5 rounded-full mb-8 shadow-inner border border-stone-200/60 dark:border-slate-700/50 z-10 shrink-0 transition-colors duration-500">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 sm:px-8 py-2.5 rounded-full text-sm font-medium transition-colors z-10 ${
                isActive 
                  ? 'text-stone-900 dark:text-slate-100' 
                  : 'text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="practiceTabBubble" 
                  className="absolute inset-0 bg-white dark:bg-[#282C3D] rounded-full shadow-sm border border-stone-200/50 dark:border-slate-600/50 -z-10" 
                  transition={{ type: "spring", stiffness: 400, damping: 30 }} 
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* MASSIVE WHITE CANVAS - Now supports dark mode! */}
      <div className="w-full bg-white dark:bg-[#282C3D] rounded-[2.5rem] border border-stone-100 dark:border-slate-700/50 shadow-xl shadow-stone-200/20 dark:shadow-none relative flex-1 mb-8 transition-colors duration-500">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-6 md:p-12 lg:p-16 w-full h-full flex flex-col"
          >
            {activeTab === 'questions' && <PracticeEngine />}
            {activeTab === 'homework' && <HomeworkEngine />}
            {activeTab === 'quiz' && <QuizArena />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}