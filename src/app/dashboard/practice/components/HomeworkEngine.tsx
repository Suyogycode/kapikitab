"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, Sparkles, RefreshCcw, X, HelpCircle, FileText } from 'lucide-react';
import Image from 'next/image';

type Solution = {
  problem: string;
  steps: string[];
  finalAnswer: string;
};

// --- NATIVE MATH TYPOGRAPHY CLEANER ---
// Formats raw text expressions into elegant presentation strings without breaking layouts
const MathTextRenderer = ({ text }: { text: string }) => {
  if (!text) return null;

  // Clean up common markdown anomalies or raw formatting artifacts
  let cleaned = text
    .replace(/\\\[|\\\]|\\\(|\\\)/g, "") // Strip raw escape delimiters
    .replace(/\s+/g, " "); // Normalize whitespace

  return (
    <span className="font-serif italic text-stone-800 tracking-wide leading-relaxed">
      {cleaned}
    </span>
  );
};

export default function HomeworkEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState("");
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setErrorMsg(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !textQuery) return;

    setIsSolving(true);
    setErrorMsg(null);
    
    try {
      let imageBase64 = null;
      let mimeType = null;

      if (file) {
        imageBase64 = await convertToBase64(file);
        mimeType = file.type;
      }

      const res = await fetch('/api/practice/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType, textQuery }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || "Server failed to process the request.");
      }
      
      setSolution(data);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Failed to analyze the problem. Please try again.");
    } finally {
      setIsSolving(false);
    }
  };

  const resetEngine = () => {
    setSolution(null);
    clearFile();
    setTextQuery("");
    setErrorMsg(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-stone-800 antialiased py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* STATE 1: REVISED INPUT INTERFACE */}
          {!solution && (
            <motion.div 
              key="upload-ui"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium tracking-wide">
                  <Sparkles size={12} className="text-emerald-600" />
                  <span>AI Powered Solver</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-medium text-stone-900 tracking-tight">Homework Scanner</h2>
                <p className="text-stone-500 font-light text-sm sm:text-base max-w-md mx-auto">
                  Snap a photo of any handwritten math equation or type it directly below for instant clarity.
                </p>
              </div>

              <form onSubmit={handleSolve} className="space-y-6">
                
                {/* Elastic Image Drop Zone */}
                <div className="w-full">
                  {previewUrl ? (
                    <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[340px] rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-900/5 flex items-center justify-center">
                      <Image 
                        src={previewUrl} 
                        alt="Equation Preview" 
                        fill 
                        className="object-contain p-2"
                        priority 
                      />
                      <button 
                        type="button"
                        onClick={clearFile}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-stone-800 hover:text-red-600 p-2 rounded-full transition-all shadow-md z-10"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-stone-300 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 bg-stone-50/50 hover:border-emerald-400 hover:bg-emerald-50/20 group"
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                      />
                      <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-stone-100 transition-transform group-hover:scale-105">
                        <Camera size={24} className="text-stone-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <p className="font-medium text-stone-700 text-sm sm:text-base">Upload or capture problem image</p>
                      <p className="text-stone-400 text-xs mt-1">Supports PNG, JPG, or HEIC</p>
                    </div>
                  )}
                </div>

                {/* Text Fallback Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider pl-1 flex items-center space-x-1">
                    <FileText size={12} />
                    <span>Manual Expression Entry</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., integrate 3x^2 dx or dy/dx of sin(x)..."
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    className="w-full bg-white border border-stone-200 shadow-inner rounded-xl p-4 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-sm sm:text-base transition-all"
                  />
                </div>

                {/* Dynamic Error Box */}
                {errorMsg && (
                  <div className="bg-red-50 text-red-800 text-xs sm:text-sm p-4 rounded-xl border border-red-100 font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Primary Action Trigger */}
                <button 
                  type="submit" 
                  disabled={isSolving || (!file && !textQuery)}
                  className="w-full bg-stone-900 text-white py-4 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-stone-800 active:scale-[0.99] transition-all shadow-md disabled:opacity-30 disabled:pointer-events-none"
                >
                  {isSolving ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-emerald-400" />
                      <span>Analyzing Problem Matrix...</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle size={18} className="text-emerald-400" />
                      <span>Solve Equation Step-by-Step</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STATE 2: THE RE-DESIGNED FLUID RESOLUTION SHEET */}
          {solution && (
            <motion.div 
              key="solution-ui"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-6"
            >
              {/* Problem Definition Block */}
              <div className="bg-white border border-stone-200/80 p-6 sm:p-8 rounded-2xl shadow-sm space-y-2">
                <span className="text-emerald-700 text-xs font-semibold uppercase tracking-widest block">Detected Objective</span>
                <h3 className="text-xl sm:text-2xl font-serif text-stone-900 leading-snug">
                  <MathTextRenderer text={solution.problem} />
                </h3>
              </div>

              {/* Logical Core Steps Stack */}
              <div className="space-y-4 relative">
                {solution.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="h-9 w-9 rounded-xl bg-stone-100 border border-stone-200/60 flex items-center justify-center text-stone-600 font-serif font-medium text-sm shrink-0 shadow-sm mt-0.5">
                      {index + 1}
                    </div>
                    <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-sm flex-1">
                      <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                        <MathTextRenderer text={step} />
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clean Final Solution Output Box */}
              <div className="bg-emerald-50/60 border border-emerald-100 p-6 sm:p-8 rounded-2xl text-center space-y-1">
                <span className="text-emerald-700 text-xs font-semibold uppercase tracking-widest block">Evaluated Result</span>
                <h4 className="text-2xl sm:text-3xl font-serif text-emerald-900 font-semibold break-words">
                  <MathTextRenderer text={solution.finalAnswer} />
                </h4>
              </div>

              {/* Reset Controller */}
              <div className="flex justify-center pt-2">
                <button 
                  onClick={resetEngine} 
                  className="flex items-center space-x-2 text-stone-500 hover:text-stone-900 transition-colors font-medium bg-white px-5 py-3 rounded-xl border border-stone-200 shadow-sm text-sm"
                >
                  <RefreshCcw size={14} />
                  <span>Analyze Alternative Problem</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}