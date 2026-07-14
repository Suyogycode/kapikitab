"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Save, Loader2, FileVideo, 
  HelpCircle, FileText, ChevronDown, Image as ImageIcon, 
  Beaker, CheckSquare, ListChecks, Hash, X, UploadCloud, Check
} from 'lucide-react';
import Link from 'next/link';

// --- TYPES ---
type Unit = { unitId: string; title: string; order: number; };
type Chapter = { chapterId: string; classId: string; subjectId: string; chapterNumber: number; title: string; units: Unit[]; };
type PanelType = 'video' | 'pdf' | 'diagram' | 'lab' | 'mcq_single' | 'mcq_multiple' | 'numeric' | null;

export default function SimplifiedChapterWorkspace() {
  const params = useParams();
  const chapterId = params.chapterId as string;

  // --- STATE ---
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  
  // Slide-Out Panel State
  const [panel, setPanel] = useState<{ isOpen: boolean; type: PanelType; unitId: string | null }>({
    isOpen: false, type: null, unitId: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [correctOptions, setCorrectOptions] = useState<string[]>([]);

  // Reset form states when panel closes
  useEffect(() => {
    if (!panel.isOpen) setCorrectOptions([]);
  }, [panel.isOpen]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await fetch(`/api/content/chapter?id=${chapterId}`);
        const data = await res.json();
        if (res.ok) {
          data.units.sort((a: Unit, b: Unit) => a.order - b.order);
          setChapter(data);
          if (data.units.length > 0) setExpandedUnit(data.units[0].unitId);
        }
      } catch (err) {
        console.error("Failed to load chapter", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (chapterId) fetchChapter();
  }, [chapterId]);

  // --- CORE HANDLERS ---
  const handleAddUnit = () => {
    if (!chapter) return;
    const newOrder = chapter.units.length > 0 ? Math.max(...chapter.units.map(u => u.order)) + 1 : 1;
    const formattedUnitNum = String(newOrder).padStart(2, '0');
    const newUnit: Unit = { unitId: `u${formattedUnitNum}`, title: '', order: newOrder };
    
    setChapter({ ...chapter, units: [...chapter.units, newUnit] });
    setExpandedUnit(newUnit.unitId);
  };

  const handleUpdateUnitTitle = (unitId: string, newTitle: string) => {
    if (!chapter) return;
    const updatedUnits = chapter.units.map(u => u.unitId === unitId ? { ...u, title: newTitle } : u);
    setChapter({ ...chapter, units: updatedUnits });
  };

  const handleUpdateChapterTitle = (newTitle: string) => {
    if (!chapter) return;
    setChapter({ ...chapter, title: newTitle });
  };

  const handleSaveChanges = async () => {
    if (!chapter) return;
    setIsSaving(true);
    try {
      await fetch('/api/content/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chapter),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- PANEL SUBMISSION (THE WIRING) ---
  const handlePanelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData(e.currentTarget);
    const uniqueId = Date.now().toString(); // Fallback sequence ID

    try {
      // 1. ROUTING LOGIC FOR QUESTIONS
      if (panel.type?.startsWith('mcq') || panel.type === 'numeric') {
        if (panel.type !== 'numeric' && correctOptions.length === 0) {
          alert("Please select at least one correct option.");
          setIsUploading(false);
          return;
        }

        const questionPayload = {
          questionId: `q-${uniqueId}`,
          chapterId: chapterId,
          unitId: panel.unitId,
          type: panel.type,
          text: formData.get('questionText'),
          correctAnswers: panel.type === 'numeric' ? [formData.get('numericAnswer')] : correctOptions,
          options: panel.type === 'numeric' ? [] : ['A', 'B', 'C', 'D'].map(opt => ({
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
      } 
      
      // 2. ROUTING LOGIC FOR ASSETS (Videos, PDFs, Labs)
      else {
        const title = formData.get('assetTitle') || formData.get('labTitle');
        let contentPayload: any = {};

        // MOCK CDN UPLOAD: Replace this block later with your actual Cloudflare/Bunny functions
        let uploadedUrl = `https://cdn.kapikitab.com/mock-path/${uniqueId}`; 

        if (panel.type === 'video') contentPayload = { videoUrl: uploadedUrl };
        if (panel.type === 'pdf') contentPayload = { fileUrl: uploadedUrl };
        if (panel.type === 'diagram') contentPayload = { imageUrl: uploadedUrl };
        if (panel.type === 'lab') contentPayload = { componentRef: formData.get('componentRef') };

        const assetPayload = {
          assetId: `ast-${uniqueId}`,
          chapterId: chapterId,
          unitId: panel.unitId,
          order: uniqueId, // Temporarily use timestamp for sorting order
          type: panel.type === 'video' ? 'video_lecture' : 
                panel.type === 'pdf' ? 'pdf_document' : 
                panel.type === 'diagram' ? 'diagram' : 'react_simulation',
          title: title,
          content: contentPayload
        };

        const res = await fetch('/api/content/asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetPayload)
        });

        if (!res.ok) throw new Error("Failed to save Asset");
      }

      // Success! Close panel.
      setPanel({ isOpen: false, type: null, unitId: null });

    } catch (err) {
      console.error(err);
      alert("Failed to push data to the server.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCorrectOption = (opt: string) => {
    if (panel.type === 'mcq_single') {
      setCorrectOptions([opt]); 
    } else {
      setCorrectOptions(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh] text-stone-400"><Loader2 className="animate-spin text-emerald-600" size={24} /></div>;
  if (!chapter) return <div className="p-10 text-stone-500">Chapter not found.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-in fade-in duration-500 relative">
      
      {/* 1. CLEAN HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div className="flex-1">
          <Link href={`/admin/${chapter.classId}/${chapter.subjectId}`} className="inline-flex items-center text-xs text-stone-400 hover:text-stone-900 font-medium tracking-wide transition-colors uppercase space-x-1 mb-4">
            <ArrowLeft size={14} /><span>Curriculum Map</span>
          </Link>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-mono text-stone-300">{String(chapter.chapterNumber).padStart(2, '0')}</span>
            <input type="text" value={chapter.title} onChange={(e) => handleUpdateChapterTitle(e.target.value)} placeholder="Enter chapter title..." className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight bg-transparent border-none outline-none focus:ring-0 p-0 m-0 w-full placeholder-stone-300"/>
          </div>
        </div>
        <button onClick={handleSaveChanges} disabled={isSaving} className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 shrink-0">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}<span>Save Document</span>
        </button>
      </div>

      {/* 2. LINEAR UNIT LIST */}
      <div className="space-y-6">
        {chapter.units.map((unit) => {
          const isExpanded = expandedUnit === unit.unitId;
          return (
            <div key={unit.unitId} className={`border border-stone-200 bg-white transition-all duration-300 ${isExpanded ? 'rounded-2xl shadow-sm' : 'rounded-xl hover:border-stone-300'}`}>
              
              <button onClick={() => setExpandedUnit(isExpanded ? null : unit.unitId)} className="w-full flex items-center justify-between p-4 sm:p-5 text-left">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-stone-300 font-mono text-sm">1.{unit.order}</span>
                  <input type="text" value={unit.title} onChange={(e) => handleUpdateUnitTitle(unit.unitId, e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Enter topic name..." className="flex-1 bg-transparent border-none focus:outline-none text-stone-800 font-medium text-lg placeholder-stone-300"/>
                </div>
                <ChevronDown size={18} className={`text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-stone-100 p-4 sm:p-6 bg-stone-50/50 rounded-b-2xl space-y-8">
                  
                  {/* ZONE A: CORE LEARNING ASSETS */}
                  <div>
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-3 flex items-center gap-2">Core Learning Assets</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button onClick={() => setPanel({ isOpen: true, type: 'video', unitId: unit.unitId })} className="flex flex-col items-center justify-center text-center p-4 bg-white border border-stone-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all group">
                        <FileVideo size={20} className="text-stone-400 group-hover:text-emerald-500 mb-2" /><span className="text-xs font-medium text-stone-700">Video</span>
                      </button>
                      <button onClick={() => setPanel({ isOpen: true, type: 'pdf', unitId: unit.unitId })} className="flex flex-col items-center justify-center text-center p-4 bg-white border border-stone-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group">
                        <FileText size={20} className="text-stone-400 group-hover:text-blue-500 mb-2" /><span className="text-xs font-medium text-stone-700">PDF Guide</span>
                      </button>
                      <button onClick={() => setPanel({ isOpen: true, type: 'diagram', unitId: unit.unitId })} className="flex flex-col items-center justify-center text-center p-4 bg-white border border-stone-200 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all group">
                        <ImageIcon size={20} className="text-stone-400 group-hover:text-purple-500 mb-2" /><span className="text-xs font-medium text-stone-700">Diagram</span>
                      </button>
                      <button onClick={() => setPanel({ isOpen: true, type: 'lab', unitId: unit.unitId })} className="flex flex-col items-center justify-center text-center p-4 bg-white border border-stone-200 rounded-xl hover:border-amber-300 hover:shadow-sm transition-all group">
                        <Beaker size={20} className="text-stone-400 group-hover:text-amber-500 mb-2" /><span className="text-xs font-medium text-stone-700">React Lab</span>
                      </button>
                    </div>
                  </div>

                  {/* ZONE B: QUESTION BANK */}
                  <div>
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-3 flex items-center gap-2">Practice & Question Bank</h4>
                    <div className="bg-white border border-stone-200 rounded-xl p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button onClick={() => setPanel({ isOpen: true, type: 'mcq_single', unitId: unit.unitId })} className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-100 rounded-lg hover:border-stone-300 transition-all text-left">
                          <CheckSquare size={18} className="text-stone-400 shrink-0" />
                          <div><span className="block text-sm font-medium text-stone-700">Single MCQ</span><span className="block text-[10px] text-stone-400 mt-0.5">One correct answer</span></div>
                        </button>
                        <button onClick={() => setPanel({ isOpen: true, type: 'mcq_multiple', unitId: unit.unitId })} className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-100 rounded-lg hover:border-stone-300 transition-all text-left">
                          <ListChecks size={18} className="text-stone-400 shrink-0" />
                          <div><span className="block text-sm font-medium text-stone-700">Multiple MCQ</span><span className="block text-[10px] text-stone-400 mt-0.5">Multiple correct</span></div>
                        </button>
                        <button onClick={() => setPanel({ isOpen: true, type: 'numeric', unitId: unit.unitId })} className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-100 rounded-lg hover:border-stone-300 transition-all text-left">
                          <Hash size={18} className="text-stone-400 shrink-0" />
                          <div><span className="block text-sm font-medium text-stone-700">Numeric</span><span className="block text-[10px] text-stone-400 mt-0.5">Exact math values</span></div>
                        </button>
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}
            </div>
          );
        })}
        <button onClick={handleAddUnit} className="w-full flex items-center justify-center gap-2 p-4 mt-4 border border-dashed border-stone-300 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-50 hover:border-stone-400 transition-colors text-sm font-medium">
          <Plus size={16} /><span>Add New Topic</span>
        </button>
      </div>

      {/* 3. THE SLIDE-OUT PANEL OVERLAY */}
      <AnimatePresence>
        {panel.isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanel({ isOpen: false, type: null, unitId: null })} className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm" />
            
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-[#FDFCF8] h-full shadow-2xl border-l border-stone-200 flex flex-col z-10">
              
              <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
                <h2 className="font-serif text-xl text-stone-900">
                  {panel.type === 'video' ? 'Upload Video Asset' : 
                   panel.type === 'pdf' ? 'Upload PDF Guide' : 
                   panel.type === 'diagram' ? 'Add Diagram' :
                   panel.type === 'lab' ? 'Attach React Lab' :
                   panel.type === 'mcq_single' ? 'Create Single MCQ' :
                   panel.type === 'mcq_multiple' ? 'Create Multiple MCQ' : 'Create Numeric Question'}
                </h2>
                <button type="button" onClick={() => setPanel({ isOpen: false, type: null, unitId: null })} className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* CONNECTED FORM */}
              <form onSubmit={handlePanelSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                
                {['video', 'pdf', 'diagram'].includes(panel.type || '') && (
                  <>
                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Asset Title</label>
                      {/* Added name="assetTitle" */}
                      <input type="text" name="assetTitle" required placeholder="e.g., Introduction to Kinematics" className="w-full bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 text-sm"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Upload File</label>
                      <div className="border-2 border-dashed border-stone-200 bg-white p-8 rounded-2xl flex flex-col items-center justify-center text-center relative group hover:border-emerald-400 transition-colors cursor-pointer">
                        <UploadCloud size={28} className="text-stone-300 group-hover:text-emerald-500 mb-2 transition-colors" />
                        <span className="text-sm font-medium text-stone-700">Click to upload or drag and drop</span>
                        <span className="text-xs text-stone-400 font-light mt-1">{panel.type === 'video' ? 'MP4 for Bunny Stream' : 'PDF or SVG for Cloudflare R2'}</span>
                        {/* Added name="fileUpload" */}
                        <input type="file" name="fileUpload" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept={panel.type === 'video' ? 'video/mp4' : panel.type === 'pdf' ? 'application/pdf' : 'image/*'} />
                      </div>
                    </div>
                  </>
                )}

                {panel.type === 'lab' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Lab Title</label>
                      <input type="text" name="labTitle" required placeholder="e.g., Interactive Pendulum" className="w-full bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 text-sm"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">React Component Ref</label>
                      <input type="text" name="componentRef" required placeholder="e.g., PendulumSim" className="w-full bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 text-sm font-mono text-stone-600"/>
                    </div>
                  </>
                )}

                {panel.type?.startsWith('mcq') && (
                  <>
                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Question Text</label>
                      <textarea name="questionText" rows={3} required placeholder="What is the SI unit of force?" className="w-full bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 text-sm"/>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold tracking-widest uppercase text-stone-500">Options</label>
                        <span className="text-[10px] text-stone-400">Select correct</span>
                      </div>
                      
                      {['A', 'B', 'C', 'D'].map((opt) => {
                        const isCorrect = correctOptions.includes(opt);
                        return (
                          <div key={opt} className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleCorrectOption(opt)}
                              className={`shrink-0 w-6 h-6 border flex items-center justify-center transition-colors focus:outline-none ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-stone-50 border-stone-300 text-transparent hover:border-emerald-400'} ${panel.type === 'mcq_single' ? 'rounded-full' : 'rounded-md'}`}
                            >
                              <Check size={14} className={isCorrect ? 'opacity-100' : 'opacity-0'} strokeWidth={3} />
                            </button>
                            <span className="text-stone-400 font-mono text-xs w-4 text-center">{opt}</span>
                            <input type="text" name={`option_${opt}`} required placeholder={`Option ${opt}`} className="flex-1 bg-white border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-stone-400 text-sm"/>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {panel.type === 'numeric' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Question Text</label>
                      <textarea name="questionText" rows={3} required placeholder="Calculate the velocity..." className="w-full bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 text-sm"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Exact Answer</label>
                      <input type="number" name="numericAnswer" step="any" required placeholder="e.g., 9.81" className="w-full bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 text-sm font-mono"/>
                    </div>
                  </>
                )}

                <div className="mt-auto pt-6 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
                  <button type="button" onClick={() => setPanel({ isOpen: false, type: null, unitId: null })} className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">Cancel</button>
                  <button type="submit" disabled={isUploading} className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}<span>Save to Database</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}