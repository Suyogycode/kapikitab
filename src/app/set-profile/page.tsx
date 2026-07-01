"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Next.js Native Router

// --- MASCOT SVG COMPONENT ---
// Keeps Kapi floating and blinking smoothly in the browser
const CuteMascot = ({ isTalking }: { isTalking: boolean }) => (
  <motion.svg 
    viewBox="0 0 200 200" 
    className="w-48 h-48 drop-shadow-2xl"
    animate={{ y: [0, -10, 0] }} 
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
  >
    {/* Body */}
    <rect x="40" y="60" width="120" height="100" rx="40" fill="#0d3827" /> 
    {/* Screen/Face */}
    <rect x="55" y="80" width="90" height="60" rx="20" fill="#FAF9F5" />
    
    {/* Eyes */}
    <motion.circle cx="75" cy="110" r="8" fill="#1c1917" 
      animate={isTalking ? { scaleY: [1, 0.2, 1] } : { scaleY: 1 }} 
      transition={{ duration: 0.3, repeat: isTalking ? Infinity : 0, repeatDelay: 1 }}
    />
    <motion.circle cx="125" cy="110" r="8" fill="#1c1917" 
      animate={isTalking ? { scaleY: [1, 0.2, 1] } : { scaleY: 1 }} 
      transition={{ duration: 0.3, repeat: isTalking ? Infinity : 0, repeatDelay: 1 }}
    />
    
    {/* Glasses */}
    <rect x="60" y="95" width="30" height="30" rx="10" fill="none" stroke="#d97706" strokeWidth="4" />
    <rect x="110" y="95" width="30" height="30" rx="10" fill="none" stroke="#d97706" strokeWidth="4" />
    <line x1="90" y1="110" x2="110" y2="110" stroke="#d97706" strokeWidth="4" />
    
    {/* Antenna */}
    <line x1="100" y1="60" x2="100" y2="30" stroke="#0d3827" strokeWidth="6" strokeLinecap="round" />
    <circle cx="100" cy="25" r="8" fill="#d97706" />
  </motion.svg>
);

// --- LEVEL OPTIONS DICTIONARY ---
const LEVEL_OPTIONS: Record<string, { id: string; label: string; desc: string }[]> = {
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
    'Chemistry': "Chemistry! Let's bond over some explosive ideas. (Safely, in a simulation).",
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
  const router = useRouter(); // Next.js router engine
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [mascotText, setMascotText] = useState("Hello! I'm Kapi. Let's build a universe perfectly tailored to your brain. Shall we begin?");
  const [isTalking, setIsTalking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const steps = [
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
      options: [] as { id: string; label: string; desc: string }[]
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
        { id: '30+ mins', line: '30+ Minutes', label: '30+ Minutes', desc: 'Deep diving into complex simulations.' }
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

  // Dynamically pull subsets for Step 3 based on Step 2 selection
  if (currentStep === 2) {
    const chosenSubject = (answers.subject?.[0] as string) || 'Math';
    steps[2].options = LEVEL_OPTIONS[chosenSubject];
  }

  const handleSelect = (optionId: string) => {
    const stepId = steps[currentStep].id;
    
    // Multi-select logic for the "subject" step
    if (stepId === 'subject') {
      const currentSubjects = (answers.subject as string[]) || [];
      if (currentSubjects.includes(optionId)) {
        // Remove it if it's already selected
        setAnswers({ ...answers, subject: currentSubjects.filter(id => id !== optionId) });
      } else {
        // Add it to the array
        setAnswers({ ...answers, subject: [...currentSubjects, optionId] });
      }
    } else {
      // Single-select logic for all other steps
      setAnswers({ ...answers, [stepId]: optionId });
    }
    
    // Trigger Mascot Humor (using the clicked option)
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
        // Send the completed answers to our new API route
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
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col lg:flex-row overflow-hidden font-sans text-stone-800">
      
      {/* LEFT COLUMN: Mascot & Progress Indicator */}
      <div className="lg:w-5/12 bg-kapi-dark text-white p-10 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex justify-between items-center">
          {currentStep > 0 ? (
            <button 
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div />
          )}
          <span className="font-serif font-bold text-xl tracking-tight text-white/90">Kapikitab.</span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center mt-12 grow justify-center">
          <CuteMascot isTalking={isTalking} />
          
          <motion.div 
            key={mascotText}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-8 bg-white text-stone-800 p-5 rounded-3xl rounded-tl-none shadow-xl border border-stone-100 max-w-xs relative"
          >
            <Sparkles size={16} className="absolute -top-2 -right-2 text-amber-500" />
            <p className="font-medium text-sm leading-relaxed">{mascotText}</p>
          </motion.div>
        </div>

        <div className="relative z-10 mt-12">
          <div className="flex justify-between text-xs font-medium text-kapi-green mb-3 uppercase tracking-wider">
            <span>Profile Setup</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
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
      <div className="lg:w-7/12 flex items-center justify-center p-8 lg:p-20 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-xl"
          >
            <span className="text-kapi-green font-bold tracking-widest text-xs uppercase mb-4 block">
              Step {currentStep + 1} of {steps.length}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-stone-900 leading-tight mb-10">
              {currentData.question}
            </h2>

            <div className="space-y-4">
            {currentData.options.map((option) => {
            // Check if the current answer is an array (multi-select) or a string (single-select)
            const isSelected = Array.isArray(answers[currentData.id]) 
                ? (answers[currentData.id] as string[]).includes(option.id)
                : answers[currentData.id] === option.id;                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelect(option.id)}
                    className={`w-full text-left p-6 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between group ${
                      isSelected 
                        ? 'border-kapi-green bg-emerald-50/30 shadow-md' 
                        : 'border-stone-200 hover:border-emerald-300 bg-white hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <h3 className={`text-xl font-medium ${isSelected ? 'text-kapi-dark' : 'text-stone-800'}`}>
                        {option.label}
                      </h3>
                      {option.desc && (
                        <p className={`text-sm mt-1 ${isSelected ? 'text-emerald-800' : 'text-stone-500'}`}>
                          {option.desc}
                        </p>
                      )}
                    </div>
                    
                    <div className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? 'border-kapi-green bg-kapi-green' : 'border-stone-300 group-hover:border-emerald-400'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
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
                  className="mt-10 flex justify-end"
                >
                  <button 
                    onClick={handleNext}
                    disabled={isSaving}
                    className="inline-flex items-center space-x-2 bg-stone-900 text-white px-8 py-4 rounded-full font-medium hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10 disabled:opacity-50"
                  >
                    <span>
                      {isSaving ? 'Saving...' : currentStep === steps.length - 1 ? 'Complete Profile' : 'Continue'}
                    </span>
                    {!isSaving && <ChevronRight size={20} />}
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