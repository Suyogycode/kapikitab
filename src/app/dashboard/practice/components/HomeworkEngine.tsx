"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Camera, Loader2, Sparkles, ArrowRight, RefreshCcw, CheckCircle2 } from 'lucide-react';

type Solution = {
  problem: string;
  steps: string[];
  finalAnswer: string;
};

export default function HomeworkEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [textQuery, setTextQuery] = useState("");
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<Solution | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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

      if (!res.ok) throw new Error("Failed to solve");
      const data = await res.json();
      setSolution(data);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze the problem. Please ensure the image is clear.");
    } finally {
      setIsSolving(false);
    }
  };

  const resetEngine = () => {
    setSolution(null);
    setFile(null);
    setTextQuery("");
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center py-4">
      
      <AnimatePresence mode="wait">
        
        {/* STATE 1: THE SCANNER / UPLOAD UI */}
        {!solution && (
          <motion.div 
            key="upload-ui"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl font-serif text-stone-900 mb-3">Homework Scanner</h2>
              <p className="text-stone-500 font-light text-lg">Upload an image of your equation or type it below for step-by-step resolution.</p>
            </div>

            <form onSubmit={handleSolve} className="space-y-6">
              
              {/* Drag & Drop Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  file ? 'border-emerald-400 bg-emerald-50/50' : 'border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100'
                }`}
              >
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                
                {file ? (
                  <div className="flex flex-col items-center text-emerald-700">
                    <CheckCircle2 size={40} className="mb-4 text-emerald-500" />
                    <span className="font-medium text-lg">{file.name} attached</span>
                    <span className="text-sm font-light mt-1 opacity-70">Click to change image</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-stone-500">
                    <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-stone-100">
                      <Camera size={32} className="text-stone-400" />
                    </div>
                    <span className="font-medium text-lg text-stone-700">Click to snap or upload</span>
                    <span className="text-sm font-light mt-2">Supports JPG, PNG, and HEIC</span>
                  </div>
                )}
              </div>

              {/* Text Fallback */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-stone-400 text-sm font-medium uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              <input 
                type="text" 
                placeholder="Type an equation manually (e.g., integrate 2x from 0 to 4)..."
                value={textQuery}
                onChange={(e) => setTextQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-5 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 font-mono text-lg"
              />

              {/* Submit Trigger */}
              <button 
                type="submit" 
                disabled={isSolving || (!file && !textQuery)}
                className="w-full bg-stone-900 text-white py-5 rounded-2xl font-medium flex items-center justify-center space-x-3 hover:bg-black transition-colors disabled:opacity-50"
              >
                {isSolving ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-emerald-400" />
                    <span>Analyzing equation logic...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="text-emerald-400" />
                    <span>Resolve Step-by-Step</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* STATE 2: THE RESOLUTION UI */}
        {solution && (
          <motion.div 
            key="solution-ui"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="w-full bg-stone-50 border border-stone-200 p-8 md:p-12 rounded-[2rem]"
          >
            <div className="mb-10">
              <span className="text-stone-400 text-sm font-medium uppercase tracking-widest mb-2 block">Detected Problem</span>
              <h3 className="text-2xl md:text-3xl font-serif text-stone-900">{solution.problem}</h3>
            </div>

            <div className="space-y-6 mb-12 relative">
              {/* Visual spine for the timeline effect */}
              <div className="absolute left-6 top-2 bottom-2 w-px bg-stone-200 z-0" />
              
              {solution.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-6 relative z-10">
                  <div className="h-12 w-12 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 font-serif font-medium shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="bg-white border border-stone-100 p-6 rounded-2xl shadow-sm flex-1">
                    <p className="text-stone-700 font-light text-lg leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl mb-10 text-center">
              <span className="text-emerald-600/70 text-sm font-medium uppercase tracking-widest mb-2 block">Final Solution</span>
              <h3 className="text-4xl font-serif text-emerald-800 font-medium">{solution.finalAnswer}</h3>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={resetEngine}
                className="flex items-center space-x-2 text-stone-500 hover:text-stone-900 transition-colors font-medium bg-white px-6 py-3 rounded-full border border-stone-200 shadow-sm"
              >
                <RefreshCcw size={16} />
                <span>Scan Another Problem</span>
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}