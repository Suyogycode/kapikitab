"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, PenTool, UploadCloud, Database, Loader2, 
  Check, FileJson, CheckSquare, ListChecks, Hash
} from 'lucide-react';

interface QuestionManagerProps {
  chapterId: string;
  unitId: string;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = 'manual' | 'ai_pipeline';
type ManualType = 'mcq_single' | 'mcq_multiple' | 'numeric';

export default function QuestionManager({ chapterId, unitId, onClose, onSuccess }: QuestionManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ai_pipeline');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- MANUAL STATE ---
  const [manualType, setManualType] = useState<ManualType>('mcq_single');
  const [correctOptions, setCorrectOptions] = useState<string[]>([]);

  // --- AI PIPELINE STATE ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [parsedPreview, setParsedPreview] = useState<any[] | null>(null);

  // --- HANDLER: MANUAL SUBMIT ---
  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    const uniqueId = Date.now().toString();

    try {
      if (manualType !== 'numeric' && correctOptions.length === 0) {
        alert("Please select at least one correct option.");
        setIsProcessing(false);
        return;
      }

      const questionPayload = {
        questionId: `q-${uniqueId}`,
        chapterId,
        unitId,
        type: manualType,
        text: formData.get('questionText'),
        correctAnswers: manualType === 'numeric' ? [formData.get('numericAnswer')] : correctOptions,
        options: manualType === 'numeric' ? [] : ['A', 'B', 'C', 'D'].map(opt => ({
          id: opt,
          text: formData.get(`option_${opt}`)
        }))
      };

      const res = await fetch('/api/content/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionPayload)
      });

      if (!res.ok) throw new Error("Failed to save Question");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to push data.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCorrectOption = (opt: string) => {
    if (manualType === 'mcq_single') setCorrectOptions([opt]); 
    else setCorrectOptions(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  };

  // --- HANDLER: AI PIPELINE PARSE ---
  const handleRunAIPipeline = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));
    formData.append('chapterId', chapterId);
    formData.append('unitId', unitId);

    try {
      const res = await fetch('/api/ai/parse-questions', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Pipeline failed");
      
      setParsedPreview(data.extractedQuestions);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- NEW HANDLERS: EDIT AI PREVIEW DATA BEFORE COMMIT ---
  const updatePreviewQuestionText = (index: number, newText: string) => {
    setParsedPreview(prev => {
      if (!prev) return null;
      const updated = [...prev];
      updated[index] = { ...updated[index], text: newText };
      return updated;
    });
  };

  const togglePreviewCorrectOption = (qIndex: number, optId: string, qType: string) => {
    setParsedPreview(prev => {
      if (!prev) return null;
      const updated = [...prev];
      const q = { ...updated[qIndex] };
      
      if (qType === 'mcq_single') {
        q.correctAnswers = [optId];
      } else {
        const exists = q.correctAnswers.includes(optId);
        q.correctAnswers = exists 
          ? q.correctAnswers.filter((id: string) => id !== optId)
          : [...q.correctAnswers, optId];
      }
      updated[qIndex] = q;
      return updated;
    });
  };

  const updatePreviewNumericAnswer = (qIndex: number, newAns: string) => {
    setParsedPreview(prev => {
      if (!prev) return null;
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], correctAnswers: [newAns] };
      return updated;
    });
  };

  // --- HANDLER: COMMIT AI BATCH TO MONGODB ---
  const handleCommitBatch = async () => {
    if (!parsedPreview || parsedPreview.length === 0) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/content/batch-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          unitId,
          questions: parsedPreview
        })
      });

      if (!res.ok) throw new Error("Database transaction rejected bulk insert");
      
      onSuccess(); 
      onClose();   
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FDFCF8]">
      {/* HEADER & TABS */}
      <div className="p-6 border-b border-stone-200 bg-white shrink-0">
        <h2 className="font-serif text-xl text-stone-900 mb-4">Question Management</h2>
        <div className="flex bg-stone-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('ai_pipeline')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'ai_pipeline' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <Sparkles size={16} /> Batch AI Pipeline
          </button>
          <button 
            onClick={() => setActiveTab('manual')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'manual' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <PenTool size={16} /> Manual Entry
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          
          {/* --- TAB: AI PIPELINE --- */}
          {activeTab === 'ai_pipeline' && (
            <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-full">
              {!parsedPreview ? (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="w-full border-2 border-dashed border-stone-200 bg-white p-12 rounded-2xl flex flex-col items-center text-center relative hover:border-stone-400 transition-colors cursor-pointer mb-6">
                    <UploadCloud size={36} className="text-stone-300 mb-3" />
                    <span className="text-sm font-medium text-stone-800">Drop Source PDFs or Images</span>
                    <span className="text-xs text-stone-400 font-light mt-1">Ready for Groq Vision Processing</span>
                    <input type="file" multiple onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="application/pdf,image/*" />
                  </div>
                  <button type="button" onClick={handleRunAIPipeline} disabled={isProcessing || selectedFiles.length === 0} className="w-full bg-stone-900 hover:bg-stone-800 text-white p-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-40">
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                    <span>Execute Extraction Engine</span>
                  </button>
                </div>
              ) : (
                
                // --- INTERACTIVE PREVIEW UI ---
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium">
                      <Check size={16} strokeWidth={3} /><span>Extracted {parsedPreview.length} Questions</span>
                    </div>
                    <button type="button" onClick={() => setParsedPreview(null)} className="text-xs underline text-stone-500 hover:text-stone-800">Clear</button>
                  </div>

                  <div className="flex-1 overflow-y-auto border border-stone-200 bg-white rounded-xl p-4 space-y-6 max-h-[55vh]">
                    {parsedPreview.map((q: any, idx: number) => (
                      <div key={idx} className="p-4 bg-stone-50/50 border border-stone-200 rounded-xl text-xs space-y-3">
                        <div className="flex justify-between font-mono text-[10px] text-stone-400 uppercase">
                          <span>Item #{idx + 1} ({q.type})</span>
                          <span className="text-emerald-600 font-bold">Answers: {q.correctAnswers?.join(', ')}</span>
                        </div>
                        
                        {/* Editable Question Text */}
                        <textarea 
                          value={q.text} 
                          onChange={(e) => updatePreviewQuestionText(idx, e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-stone-400 text-sm font-medium text-stone-800 font-mono resize-y"
                          rows={2}
                        />
                        
                        {/* Editable Answers Logic */}
                        {q.type === 'numeric' ? (
                           <div>
                              <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1.5">Exact Answer</label>
                              <input 
                                type="number" 
                                value={q.correctAnswers?.[0] || ''} 
                                onChange={(e) => updatePreviewNumericAnswer(idx, e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-stone-400 text-sm font-mono"
                              />
                           </div>
                        ) : (
                          <div className="space-y-2 mt-2">
                            <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1">Click checkmark to fix correct option</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[10px]">
                              {q.options?.map((opt: any) => {
                                const isCorrect = q.correctAnswers?.includes(opt.id);
                                return (
                                  <div key={opt.id} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200'}`}>
                                     <button 
                                       type="button" 
                                       onClick={() => togglePreviewCorrectOption(idx, opt.id, q.type)}
                                       className={`shrink-0 w-5 h-5 border flex items-center justify-center transition-colors focus:outline-none ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-stone-50 border-stone-300 hover:border-emerald-400'} ${q.type === 'mcq_single' ? 'rounded-full' : 'rounded-md'}`}
                                     >
                                       <Check size={12} className={isCorrect ? 'opacity-100' : 'opacity-0'} strokeWidth={3} />
                                     </button>
                                     <span className="font-bold text-stone-400">{opt.id}:</span> 
                                     <span className="truncate">{opt.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button 
                    type="button" 
                    onClick={handleCommitBatch} 
                    disabled={isProcessing} 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-6 shrink-0"
                  >
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <FileJson size={16} />}
                    <span>Commit Bulk Records to Database</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* --- TAB: MANUAL ENTRY --- */}
          {activeTab === 'manual' && (
            <motion.div key="manual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-6">
                
                {/* Manual Type Selector */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mcq_single', icon: CheckSquare, label: 'Single' },
                    { id: 'mcq_multiple', icon: ListChecks, label: 'Multiple' },
                    { id: 'numeric', icon: Hash, label: 'Numeric' }
                  ].map((type) => (
                    <button key={type.id} type="button" onClick={() => setManualType(type.id as ManualType)} className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${manualType === type.id ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'}`}>
                      <type.icon size={16} className="mb-1.5" /> {type.label}
                    </button>
                  ))}
                </div>

                {/* Form Fields */}
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Question Text</label>
                  <textarea name="questionText" rows={3} required className="w-full bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 text-sm"/>
                </div>

                {manualType === 'numeric' ? (
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Exact Answer</label>
                    <input type="number" name="numericAnswer" step="any" required className="w-full bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 text-sm font-mono"/>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold tracking-widest uppercase text-stone-500">Options & Correct Answer</label>
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <div key={opt} className="flex items-center gap-3">
                        <button type="button" onClick={() => toggleCorrectOption(opt)} className={`shrink-0 w-6 h-6 border flex items-center justify-center transition-colors focus:outline-none ${correctOptions.includes(opt) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-stone-50 border-stone-300 hover:border-emerald-400'} ${manualType === 'mcq_single' ? 'rounded-full' : 'rounded-md'}`}>
                          <Check size={14} className={correctOptions.includes(opt) ? 'opacity-100' : 'opacity-0'} strokeWidth={3} />
                        </button>
                        <span className="text-stone-400 font-mono text-xs w-4 text-center">{opt}</span>
                        <input type="text" name={`option_${opt}`} required className="flex-1 bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-stone-400 text-sm"/>
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" disabled={isProcessing} className="w-full bg-stone-900 hover:bg-stone-800 text-white p-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-4">
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                  <span>Save Manual Entry</span>
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}