"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Check, Sparkles, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- TYPESCRIPT BLUEPRINTS ---
type Option = {
  id: string;
  label: string;
};

type Step = {
  id: string;
  question: string;
  isMulti?: boolean;
  isDropdown?: boolean;
  options: Option[];
};

// --- MASCOT SVG COMPONENT ---
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

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const ENTRANCE_EXAMS = [
  "IIT-JEE (Mains & Advanced)",
  "NEET",
  "NDA"
];

export default function SetProfile() {
  const router = useRouter(); 
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});  
  const [mascotText, setMascotText] = useState("Hello! I'm Kapi. Let's set up your profile for India.");
  const [isTalking, setIsTalking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entranceDropdownOpen, setEntranceDropdownOpen] = useState(false);

  const steps: Step[] = [
    {
      id: 'state',
      question: "Which state are you currently studying in?",
      isDropdown: true,
      options: INDIAN_STATES.map(state => ({ id: state, label: state }))
    },
    {
      id: 'class',
      question: "Which class are you currently in?",
      options: [
        { id: 'Class 8', label: 'Class 8th' },
        { id: 'Class 9', label: 'Class 9th' },
        { id: 'Class 10', label: 'Class 10th' },
        { id: 'Class 11', label: 'Class 11th' },
        { id: 'Class 12', label: 'Class 12th' }
      ]
    },
    {
      id: 'board',
      question: "Which educational board do you follow?",
      options: [
        { id: 'CBSE', label: 'CBSE' },
        { id: 'ICSE', label: 'ICSE' },
        { id: 'State Board', label: 'State Board' }
      ]
    },
    {
      id: 'exams',
      question: "Which exams are you targeting? (Select all that apply)",
      isMulti: true,
      options: [
        { id: 'School exams', label: 'School exams' },
        { id: 'Board exams', label: 'Board exams' },
        { id: 'Entrance exams', label: 'Entrance exams' }
      ]
    }
  ];

  const triggerMascotResponse = (message: string) => {
    setMascotText(message);
    setIsTalking(true);
    setTimeout(() => setIsTalking(false), 2000);
  };

  const handleSelect = (optionId: string) => {
    const step = steps[currentStep];
    
    if (step.isMulti) {
      const currentSelected = (answers[step.id] as string[]) || [];
      if (currentSelected.includes(optionId)) {
        setAnswers({ ...answers, [step.id]: currentSelected.filter(id => id !== optionId) });
      } else {
        setAnswers({ ...answers, [step.id]: [...currentSelected, optionId] });
      }
    } else {
      setAnswers({ ...answers, [step.id]: optionId });
    }
    
    triggerMascotResponse("Selection saved. Let's continue.");
  };

  const handleEntranceSelect = (examId: string) => {
    const currentSelected = (answers.entranceExams as string[]) || [];
    if (currentSelected.includes(examId)) {
      setAnswers({ ...answers, entranceExams: currentSelected.filter(id => id !== examId) });
    } else {
      setAnswers({ ...answers, entranceExams: [...currentSelected, examId] });
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      const transitionMessages = [
        "Got it. What class are you in?",
        "Noted. Which board do you belong to?",
        "Almost done. What are your target exams?"
      ];
      triggerMascotResponse(transitionMessages[currentStep]);
      
    } else {
      setMascotText("Profile complete! Saving your data...");
      setIsTalking(true);
      setIsSaving(true);
      
      try {
        const res = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answers),
        });

        if (res.ok) {
          setMascotText("All set. Redirecting to dashboard...");
          setTimeout(() => router.push('/dashboard'), 1000);
        } else {
          setMascotText("There was an error saving your profile. Please try again.");
          setIsSaving(false);
        }
      } catch (error) {
        setMascotText("Connection error. Please check your internet.");
        setIsSaving(false);
      }
    }
  };

  const currentData = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // Bulletproof logic for showing the Continue button
  const currentAnswer = answers[currentData.id];
  const hasAnswer = Array.isArray(currentAnswer) ? currentAnswer.length > 0 : !!currentAnswer;
  const isEntranceSelected = Array.isArray(currentAnswer) ? currentAnswer.includes('Entrance exams') : currentAnswer === 'Entrance exams';
  const hasEntranceDetails = (answers.entranceExams as string[])?.length > 0;
  const showNextButton = hasAnswer && (!isEntranceSelected || hasEntranceDetails);

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col lg:flex-row font-sans text-stone-800 overflow-x-hidden">
      
      {/* LEFT COLUMN: Mascot & Progress Indicator (Restored Original Colors) */}
      <div className="w-full lg:w-5/12 bg-kapi-dark text-white p-5 lg:p-10 flex flex-col justify-between relative overflow-hidden shrink-0 shadow-md lg:shadow-none z-20">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
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

        <div className="relative z-10 flex flex-row lg:flex-col items-center lg:justify-center gap-4 lg:gap-0 mt-2 lg:mt-12 grow">
          <CuteMascot isTalking={isTalking} className="w-20 h-20 sm:w-24 sm:h-24 lg:w-48 lg:h-48 shrink-0" />
          
          <motion.div 
            key={mascotText}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="lg:mt-8 bg-white text-stone-800 p-3 lg:p-5 rounded-2xl lg:rounded-3xl lg:rounded-tl-none shadow-xl border border-stone-100 w-full lg:max-w-xs relative text-left lg:text-center"
          >
            <Sparkles size={14} className="absolute -top-1.5 -right-1.5 lg:-top-2 lg:-right-2 text-kapi-green hidden lg:block" />
            <p className="font-medium text-xs sm:text-sm leading-snug lg:leading-relaxed">{mascotText}</p>
          </motion.div>
        </div>

        <div className="relative z-10 mt-6 lg:mt-12">
          <div className="flex justify-between text-[10px] lg:text-xs font-medium text-kapi-green mb-2 lg:mb-3 uppercase tracking-wider">
            <span>Profile Setup</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-1.5 lg:h-2 w-full bg-black/50 rounded-full overflow-hidden">
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-stone-900 leading-tight mb-6 lg:mb-10">
              {currentData.question}
            </h2>

            <div className="space-y-3 lg:space-y-4">
              
              {/* DROPDOWN RENDERER (Step 1) */}
              {currentData.isDropdown && (
                <div className="relative w-full">
                  <select
                    value={(answers[currentData.id] as string) || ""}
                    onChange={(e) => handleSelect(e.target.value)}
                    className="w-full appearance-none p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-2 border-stone-200 bg-white text-stone-800 text-lg font-medium transition-colors focus:outline-none focus:border-kapi-green hover:border-emerald-300"
                  >
                    <option value="" disabled>Select your state</option>
                    {currentData.options.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                </div>
              )}

              {/* STANDARD BUTTON RENDERER (Steps 2, 3, 4) */}
              {!currentData.isDropdown && currentData.options.map((option) => {
                const isSelected = Array.isArray(answers[currentData.id]) 
                    ? (answers[currentData.id] as string[]).includes(option.id)
                    : answers[currentData.id] === option.id;                
                
                return (
                  <div key={option.id} className="w-full">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelect(option.id)}
                      className={`w-full text-left p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-2 transition-all duration-300 flex items-center justify-between group ${
                        isSelected 
                          ? 'border-kapi-green bg-emerald-50/30 shadow-sm' 
                          : 'border-stone-200 hover:border-emerald-300 bg-white hover:shadow-sm'
                      }`}
                    >
                      <h3 className={`text-lg font-medium ${isSelected ? 'text-emerald-900' : 'text-stone-800'}`}>
                        {option.label}
                      </h3>
                      
                      <div className={`shrink-0 h-5 w-5 lg:h-6 lg:w-6 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-kapi-green bg-kapi-green' : 'border-stone-300 group-hover:border-kapi-green'
                      }`}>
                        {isSelected && <Check size={12} className="text-white lg:w-3.5 lg:h-3.5" />}
                      </div>
                    </motion.button>

                    {/* NESTED ENTRANCE EXAM MULTI-SELECT DROPDOWN - Fixed Overflow & Animation */}
                    <AnimatePresence>
                      {isSelected && option.id === 'Entrance exams' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 px-2 overflow-hidden"
                        >
                          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                            <button
                              onClick={() => setEntranceDropdownOpen(!entranceDropdownOpen)}
                              className="w-full flex justify-between items-center text-left bg-white p-3 rounded-xl border border-stone-200 text-stone-700 font-medium"
                            >
                              <span className="truncate pr-4">
                                {(answers.entranceExams as string[])?.length > 0 
                                  ? (answers.entranceExams as string[]).join(", ") 
                                  : "Select Entrance Exams..."}
                              </span>
                              <ChevronDown size={18} className={`transition-transform duration-300 ${entranceDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {entranceDropdownOpen && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col p-2 space-y-1"
                                >
                                  {ENTRANCE_EXAMS.map(exam => {
                                    const isExamSelected = (answers.entranceExams as string[] || []).includes(exam);
                                    return (
                                      <button
                                        key={exam}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEntranceSelect(exam);
                                        }}
                                        className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors ${
                                          isExamSelected ? 'bg-emerald-50 text-emerald-800 font-medium' : 'hover:bg-stone-50 text-stone-700'
                                        }`}
                                      >
                                        <span>{exam}</span>
                                        {isExamSelected && <Check size={16} className="text-emerald-600" />}
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <AnimatePresence>
              {showNextButton && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
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