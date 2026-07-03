"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- TYPESCRIPT BLUEPRINTS ---
type Option = {
  id: string;
  label: string;
  desc?: string;
};

type Step = {
  id: string;
  question: string;
  options: Option[];
};

// --- MASCOT SVG COMPONENT ---
// Added a className prop so we can scale him down on mobile
const CuteMascot = ({ isTalking, className = "w-48 h-48" }: { isTalking: boolean, className?: string }) => (
  <motion.svg 
    viewBox="0 0 200 200" 
    className={`drop-shadow-2xl ${className}`}
    animate={{ y: [0, -10, 0] }} 
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
  >
    <rect x="40" y="60" width="120" height="100" rx="40" fill="#0d3827" /> 
    <rect x="55" y="80" width="90" height="60" rx="20" fill="#FAF9F5" />
    
    <motion.circle cx="75" cy="110" r="8" fill="#1c1917" 
      animate={isTalking ? { scaleY: [1, 0.2, 1] } : { scaleY: 1 }} 
      transition={{ duration: 0.3, repeat: isTalking ? Infinity : 0, repeatDelay: 1 }}
    />
    <motion.circle cx="125" cy="110" r="8" fill="#1c1917" 
      animate={isTalking ? { scaleY: [1, 0.2, 1] } : { scaleY: 1 }} 
      transition={{ duration: 0.3, repeat: isTalking ? Infinity : 0, repeatDelay: 1 }}
    />
    
    <rect x="60" y="95" width="30" height="30" rx="10" fill="none" stroke="#d97706" strokeWidth="4" />
    <rect x="110" y="95" width="30" height="30" rx="10" fill="none" stroke="#d97706" strokeWidth="4" />
    <line x1="90" y1="110" x2="110" y2="110" stroke="#d97706" strokeWidth="4" />
    
    <line x1="100" y1="60" x2="100" y2="30" stroke="#0d3827" strokeWidth="6" strokeLinecap="round" />
    <circle cx="100" cy="25" r="8" fill="#d97706" />
  </motion.svg>
);

// --- LEVEL OPTIONS DICTIONARY ---
const LEVEL_OPTIONS: Record<string, Option[]> = {
  Math: [
    { id: 'beginner', label: 'Basic Algebra', desc: 'Solving for x without crying.' },
    { id: 'intermediate', label: 'Quadratic Equations', desc: 'Parabolas are my playground.' },
    { id: 'advanced', label: 'Calculus & Limits', desc: 'Approaching infinity like a pro.' }
  ],
  Physics: [
    { id: 'beginner', label: 'Kinematics', desc: 'Things moving in straight lines.' },
    { id: 'intermediate', label: 'Electromagnetism', desc: 'Sparks, magnets, and right-hand rules.' },
    { id: 'advanced', label: 'Quantum Mechanics', desc: 'Schrödinger’s cat is both alive and dead here.' }
  ],
  Chemistry: [
    { id: 'beginner', label: 'Atomic Structure', desc: 'Protons, neutrons, and happy electrons.' },
    { id: 'intermediate', label: 'Organic Reactions', desc: 'Drawing hexagons all day.' },
    { id: 'advanced', label: 'Thermodynamics', desc: 'Embracing the entropy of the universe.' }
  ],
  Biology: [
    { id: 'beginner', label: 'Cell Biology', desc: 'The mitochondria is the powerhouse.' },
    { id: 'intermediate', label: 'Genetics', desc: 'Punnett squares and double helixes.' },
    { id: 'advanced', label: 'Neuroscience', desc: 'Brains studying brains.' }
  ],
  Computer: [
    { id: 'beginner', label: 'Variables & Loops', desc: 'Hello World and beyond.' },
    { id: 'intermediate', label: 'Data Structures', desc: 'Trees, graphs, and memory leaks.' },
    { id: 'advanced', label: 'Machine Learning', desc: 'Teaching sand to think.' }
  ]
};

// --- NERDY MASCOT HUMOR ---
const HUMOR_LINES: Record<string, Record<string, string>> = {
  grade: {
    'High School': "Ah, high school. The era of locker combinations and infinite drama. Let's make learning the easy part.",
    'College': "College! Powered by instant noodles and caffeine. I respect the hustle.",
    'University': "University level? Look at you, pursuing mastery. I'll get my academic robes."
  },
  subject: {
    'Math': "Mathematics! The universal language. I calculate a 99.9% chance we'll have fun.",
    'Physics': "Physics! Because figuring out how the universe works is better than sleep.",
    'Chemistry': "Chemistry! Let's bond over some explosive ideas.",
    'Biology': "Biology! The study of life. Let's mutate your brain cells with knowledge.",
    'Computer': "Computer Science! Ah, my native tongue. 01001000 01101001!"
  },
  level: {
    'beginner': "Every grand master was once a beginner. Let's build a rock-solid foundation.",
    'intermediate': "Intermediate! You know enough to be dangerous. Let's sharpen those skills.",
    'advanced': "Advanced?! *Adjusts glasses nervously* Alright genius, let's skip the small talk."
  },
  reason: {
    'School Tests': "School tests. The necessary evil. Let's get you those top marks.",
    'College Exams': "Exams can be terrifying. Good thing I'm immune to stress. Let's prep!",
    'Entrance Exams': "Competitive exams? We're going into beast mode. No mercy.",
    'Curiosity': "Curiosity?! My favorite reason! Learning just for the joy of it. *Sheds a digital tear*"
  },
  time: {
    '15 mins': "15 minutes a day keeps the ignorance away. Consistency is key!",
    '25 mins': "The Pomodoro sweet spot! 25 minutes of hyper-focus coming up.",
    '30+ mins': "30+ minutes? You're a marathon runner of the mind. I'm ready!"
  },
  source: {
    'Friend': "A friend told you? Tell them a robot says thank you.",
    'Social Media': "Social media algorithm brought you here? Good bot.",
    'Search Engine': "Ah, the search engine. The modern oracle.",
    'Other': "Mysterious origins. I like it."
  }
};

export default function SetProfile() {
  const router = useRouter(); 
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});  
  const [mascotText, setMascotText] = useState("Hello! I'm Kapi. Let's build a universe perfectly tailored to your brain. Shall we begin?");
  const [isTalking, setIsTalking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const steps: Step[] = [
    {
      id: 'grade',
      question: "First things first, where are you currently in your academic journey?",
      options: [
        { id: 'High School', label: 'High School', desc: 'Navigating the foundational years.' },
        { id: 'College', label: 'College', desc: 'Exploring deeper concepts.' },
        { id: 'University', label: 'University', desc: 'Specializing and mastering.' }
      ]
    },
    {
      id: 'subject',
      question: "If you had to pick one domain that sparks your curiosity the most, what would it be?",
      options: [
        { id: 'Math', label: 'Mathematics', desc: 'Logic, numbers, and absolute truth.' },
        { id: 'Physics', label: 'Physics', desc: 'The fundamental laws of nature.' },
        { id: 'Chemistry', label: 'Chemistry', desc: 'Matter, reactions, and bonds.' },
        { id: 'Biology', label: 'Biology', desc: 'The intricate machinery of life.' },
        { id: 'Computer', label: 'Computer Science', desc: 'Code, algorithms, and logic.' }
      ]
    },
    {
      id: 'level',
      question: "Based on your subject, where do you currently stand?",
      options: []
    },
    {
      id: 'reason',
      question: "What is the main driving force bringing you here today?",
      options: [
        { id: 'School Tests', label: 'School Tests', desc: 'Need help acing the upcoming class exams.' },
        { id: 'College Exams', label: 'College Exams', desc: 'Preparing for tough semester finals.' },
        { id: 'Entrance Exams', label: 'Entrance Exams', desc: 'Gearing up for competitive admissions.' },
        { id: 'Curiosity', label: 'Pure Curiosity', desc: 'I just want to understand the universe.' }
      ]
    },
    {
      id: 'time',
      question: "How much time can you dedicate to exploring with me each day?",
      options: [
        { id: '15 mins', label: '15 Minutes', desc: 'A quick, powerful daily sprint.' },
        { id: '25 mins', label: '25 Minutes', desc: 'A solid block of focused learning.' },
        { id: '30+ mins', label: '30+ Minutes', desc: 'Deep diving into complex simulations.' }
      ]
    },
    {
      id: 'source',
      question: "Last question! How did you discover Kapikitab?",
      options: [
        { id: 'Friend', label: 'From a friend' },
        { id: 'Social Media', label: 'Social Media' },
        { id: 'Search Engine', label: 'Search Engine' },
        { id: 'Other', label: 'Other' }
      ]
    }
  ];

  if (currentStep === 2) {
    const chosenSubject = (answers.subject?.[0] as string) || 'Math';
    steps[2].options = LEVEL_OPTIONS[chosenSubject] || [];
  }

  const handleSelect = (optionId: string) => {
    const stepId = steps[currentStep].id;
    
    if (stepId === 'subject') {
      const currentSubjects = (answers.subject as string[]) || [];
      if (currentSubjects.includes(optionId)) {
        setAnswers({ ...answers, subject: currentSubjects.filter(id => id !== optionId) });
      } else {
        setAnswers({ ...answers, subject: [...currentSubjects, optionId] });
      }
    } else {
      setAnswers({ ...answers, [stepId]: optionId });
    }
    
    const line = HUMOR_LINES[stepId]?.[optionId];
    if (line) {
      setMascotText(line);
      setIsTalking(true);
      setTimeout(() => setIsTalking(false), 2000);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setMascotText("Take your time. I'm processing...");
    } else {
      setMascotText("Profile complete! Saving your universe to the cloud...");
      setIsTalking(true);
      setIsSaving(true);
      
      try {
        const res = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answers),
        });

        if (res.ok) {
          setMascotText("All systems go. Teleporting you now!");
          setTimeout(() => router.push('/dashboard'), 1000);
        } else {
          setMascotText("Hmm, the database hiccuped. Let's try that again.");
          setIsSaving(false);
        }
      } catch (error) {
        setMascotText("Connection error. Is the Wi-Fi still breathing?");
        setIsSaving(false);
      }
    }
  };

  const currentData = steps[currentStep];
  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col lg:flex-row font-sans text-stone-800 overflow-x-hidden">
      
      {/* LEFT COLUMN / MOBILE HEADER: Mascot & Progress Indicator */}
      <div className="w-full lg:w-5/12 bg-kapi-dark text-white p-5 lg:p-10 flex flex-col justify-between relative overflow-hidden shrink-0 shadow-md lg:shadow-none z-20">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Bar */}
        <div className="relative z-10 flex justify-between items-center mb-4 lg:mb-0">
          {currentStep > 0 ? (
            <button 
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="p-1.5 lg:p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
            >
              <ArrowLeft size={18} className="lg:w-5 lg:h-5" />
            </button>
          ) : (
            <div className="w-8" /> 
          )}
          <span className="font-serif font-bold text-lg lg:text-xl tracking-tight text-white/90">Kapikitab.</span>
        </div>

        {/* Mascot & Dialogue - Horizontal on Mobile, Vertical on Desktop */}
        <div className="relative z-10 flex flex-row lg:flex-col items-center lg:justify-center gap-4 lg:gap-0 mt-2 lg:mt-12 grow">
          <CuteMascot isTalking={isTalking} className="w-20 h-20 sm:w-24 sm:h-24 lg:w-48 lg:h-48 shrink-0" />
          
          <motion.div 
            key={mascotText}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="lg:mt-8 bg-white text-stone-800 p-3 lg:p-5 rounded-2xl lg:rounded-3xl lg:rounded-tl-none shadow-xl border border-stone-100 w-full lg:max-w-xs relative text-left lg:text-center"
          >
            <Sparkles size={14} className="absolute -top-1.5 -right-1.5 lg:-top-2 lg:-right-2 text-amber-500 hidden lg:block" />
            <p className="font-medium text-xs sm:text-sm leading-snug lg:leading-relaxed">{mascotText}</p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 mt-6 lg:mt-12">
          <div className="flex justify-between text-[10px] lg:text-xs font-medium text-kapi-green mb-2 lg:mb-3 uppercase tracking-wider">
            <span>Profile Setup</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-1.5 lg:h-2 w-full bg-stone-950 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-kapi-green rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Multistep Card */}
      <div className="w-full lg:w-7/12 flex flex-col justify-start lg:justify-center p-6 sm:p-10 lg:p-20 relative grow z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-xl mx-auto"
          >
            <span className="text-kapi-green font-bold tracking-widest text-[10px] lg:text-xs uppercase mb-3 block">
              Step {currentStep + 1} of {steps.length}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-serif font-medium text-stone-900 leading-tight mb-6 lg:mb-10">
              {currentData.question}
            </h2>

            <div className="space-y-3 lg:space-y-4">
            {currentData.options.map((option) => {
            const isSelected = Array.isArray(answers[currentData.id]) 
                ? (answers[currentData.id] as string[]).includes(option.id)
                : answers[currentData.id] === option.id;                
                
                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelect(option.id)}
                    className={`w-full text-left p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-2 transition-all duration-300 flex items-center justify-between group ${
                      isSelected 
                        ? 'border-kapi-green bg-emerald-50/30 shadow-sm' 
                        : 'border-stone-200 hover:border-emerald-300 bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="pr-4">
                      <h3 className={`text-lg lg:text-xl font-medium ${isSelected ? 'text-kapi-dark' : 'text-stone-800'}`}>
                        {option.label}
                      </h3>
                      {option.desc && (
                        <p className={`text-xs lg:text-sm mt-1 ${isSelected ? 'text-emerald-800' : 'text-stone-500'}`}>
                          {option.desc}
                        </p>
                      )}
                    </div>
                    
                    <div className={`shrink-0 h-5 w-5 lg:h-6 lg:w-6 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? 'border-kapi-green bg-kapi-green' : 'border-stone-300 group-hover:border-emerald-400'
                    }`}>
                      {isSelected && <Check size={12} className="text-white lg:w-3.5 lg:h-3.5" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {answers[currentData.id] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 lg:mt-10 flex justify-end pb-10 lg:pb-0"
                >
                  <button 
                    onClick={handleNext}
                    disabled={isSaving}
                    className="inline-flex items-center space-x-2 bg-stone-900 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-full text-sm lg:text-base font-medium hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10 disabled:opacity-50"
                  >
                    <span>
                      {isSaving ? 'Saving...' : currentStep === steps.length - 1 ? 'Complete Profile' : 'Continue'}
                    </span>
                    {!isSaving && <ChevronRight size={18} className="lg:w-5 lg:h-5" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}