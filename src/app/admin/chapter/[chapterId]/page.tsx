"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Save, Loader2, FileVideo, 
  FileText, ChevronDown, Image as ImageIcon, 
  Beaker, X, UploadCloud, Sparkles, Database
} from 'lucide-react';
import Link from 'next/link';

// Import our new decoupled component
import QuestionManager from '@/components/admin/QuestionManager';

// --- TYPES ---
type Unit = { unitId: string; title: string; order: number; };
type Chapter = { chapterId: string; classId: string; subjectId: string; chapterNumber: number; title: string; units: Unit[]; };
type AssetCountSummary = { video_lecture: number; pdf_document: number; diagram: number; react_simulation: number; questionsCount: number; };
type UnitInventory = Record<string, AssetCountSummary>;

// Notice how clean the PanelType is now!
type PanelType = 'video' | 'pdf' | 'diagram' | 'lab' | 'questions' | null;

export default function SimplifiedChapterWorkspace() {
  const params = useParams();
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [inventory, setInventory] = useState<UnitInventory>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  
  const [panel, setPanel] = useState<{ isOpen: boolean; type: PanelType; unitId: string | null }>({
    isOpen: false, type: null, unitId: null
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDataSummary = async () => {
    try {
      const res = await fetch(`/api/content/chapter?id=${chapterId}`);
      const data = await res.json();
      if (res.ok) {
        data.units.sort((a: Unit, b: Unit) => a.order - b.order);
        setChapter(data);
        if (data.units.length > 0 && !expandedUnit) setExpandedUnit(data.units[0].unitId);

        const summaryRes = await fetch(`/api/content/chapter/summary?chapterId=${chapterId}`);
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setInventory(summaryData.unitInventory || {});
        }
      }
    } catch (err) {
      console.error("Failed to compile workspace dashboard assets", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chapterId) fetchDataSummary();
  }, [chapterId]);

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
      await fetchDataSummary();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    const uniqueId = Date.now().toString();

    try {
      const title = formData.get('assetTitle') || formData.get('labTitle');
      let contentPayload: any = {};
      let uploadedUrl = `https://cdn.kapikitab.com/mock-path/${uniqueId}`; 

      if (panel.type === 'video') contentPayload = { videoUrl: uploadedUrl };
      if (panel.type === 'pdf') contentPayload = { fileUrl: uploadedUrl };
      if (panel.type === 'diagram') contentPayload = { imageUrl: uploadedUrl };
      if (panel.type === 'lab') contentPayload = { componentRef: formData.get('componentRef') };

      const assetPayload = {
        assetId: `ast-${uniqueId}`,
        chapterId: chapterId,
        unitId: panel.unitId,
        order: uniqueId,
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
      setPanel({ isOpen: false, type: null, unitId: null });
      await fetchDataSummary();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh] text-stone-400"><Loader2 className="animate-spin text-emerald-600" size={24} /></div>;
  if (!chapter) return <div className="p-10 text-stone-500">Chapter not found.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-32 relative animate-in fade-in duration-500">
      
      {/* 1. HEADER */}
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
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}<span>Save Structure</span>
        </button>
      </div>

      {/* 2. UNITS MAPPING */}
      <div className="space-y-6">
        {chapter.units.map((unit) => {
          const isExpanded = expandedUnit === unit.unitId;
          const counts = inventory[unit.unitId] || { video_lecture: 0, pdf_document: 0, diagram: 0, react_simulation: 0, questionsCount: 0 };

          return (
            <div key={unit.unitId} className={`border border-stone-200 bg-white transition-all duration-300 ${isExpanded ? 'rounded-2xl shadow-sm' : 'rounded-xl hover:border-stone-300'}`}>
              
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4">
                <button onClick={() => setExpandedUnit(isExpanded ? null : unit.unitId)} className="flex items-center gap-4 flex-1 text-left">
                  <span className="text-stone-300 font-mono text-sm">1.{unit.order}</span>
                  <input type="text" value={unit.title} onChange={(e) => handleUpdateUnitTitle(unit.unitId, e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Enter topic name..." className="flex-1 bg-transparent border-none focus:outline-none text-stone-800 font-medium text-lg placeholder-stone-300"/>
                </button>
                
                <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center pl-8 sm:pl-0">
                  {counts.video_lecture > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono">VID: {counts.video_lecture}</span>}
                  {counts.pdf_document > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 font-mono">PDF: {counts.pdf_document}</span>}
                  {counts.diagram > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100 font-mono">IMG: {counts.diagram}</span>}
                  {counts.react_simulation > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100 font-mono">LAB: {counts.react_simulation}</span>}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${counts.questionsCount > 0 ? 'bg-stone-900 text-stone-100 border-stone-900' : 'bg-stone-50 text-stone-400 border-stone-200'}`}>QBANK: {counts.questionsCount}</span>
                  <button onClick={() => setExpandedUnit(isExpanded ? null : unit.unitId)} className="p-1 text-stone-400 hover:text-stone-600 ml-1"><ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} /></button>
                </div>
              </div>

              {isExpanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-stone-100 p-4 sm:p-6 bg-stone-50/50 rounded-b-2xl space-y-6">
                  
                  {/* ZONE A: CORE LEARNING ASSETS */}
                  <div>
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-3">Core Content Hub</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button onClick={() => setPanel({ isOpen: true, type: 'video', unitId: unit.unitId })} className="flex flex-col items-center justify-center p-4 bg-white border border-stone-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all group">
                        <FileVideo size={20} className="text-stone-400 group-hover:text-emerald-500 mb-2" /><span className="text-xs font-medium text-stone-700">Video Layer</span>
                      </button>
                      <button onClick={() => setPanel({ isOpen: true, type: 'pdf', unitId: unit.unitId })} className="flex flex-col items-center justify-center p-4 bg-white border border-stone-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group">
                        <FileText size={20} className="text-stone-400 group-hover:text-blue-500 mb-2" /><span className="text-xs font-medium text-stone-700">PDF Syllabus</span>
                      </button>
                      <button onClick={() => setPanel({ isOpen: true, type: 'diagram', unitId: unit.unitId })} className="flex flex-col items-center justify-center p-4 bg-white border border-stone-200 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all group">
                        <ImageIcon size={20} className="text-stone-400 group-hover:text-purple-500 mb-2" /><span className="text-xs font-medium text-stone-700">Diagram Asset</span>
                      </button>
                      <button onClick={() => setPanel({ isOpen: true, type: 'lab', unitId: unit.unitId })} className="flex flex-col items-center justify-center p-4 bg-white border border-stone-200 rounded-xl hover:border-amber-300 hover:shadow-sm transition-all group">
                        <Beaker size={20} className="text-stone-400 group-hover:text-amber-500 mb-2" /><span className="text-xs font-medium text-stone-700">Interactive Lab</span>
                      </button>
                    </div>
                  </div>

                  {/* ZONE B: QUESTION BANK INGESTION */}
                  <div>
                    <h4 className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-3">Question Engine</h4>
                    <button onClick={() => setPanel({ isOpen: true, type: 'questions', unitId: unit.unitId })} className="w-full flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-900 transition-all text-left group">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-stone-900 text-white rounded-lg group-hover:scale-105 transition-transform"><Database size={18} /></div>
                        <div>
                          <span className="block text-sm font-semibold text-stone-900">Manage Practice Questions</span>
                          <span className="block text-xs text-stone-400 mt-0.5">Add manually or run the AI batch ingestion pipeline</span>
                        </div>
                      </div>
                    </button>
                  </div>

                </motion.div>
              )}
            </div>
          );
        })}
        <button onClick={handleAddUnit} className="w-full flex items-center justify-center gap-2 p-4 mt-4 border border-dashed border-stone-300 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-50 hover:border-stone-400 transition-colors text-sm font-medium">
          <Plus size={16} /><span>Add New Topic Section</span>
        </button>
      </div>

      {/* 3. SLIDE OUT PANEL */}
      <AnimatePresence>
        {panel.isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanel({ isOpen: false, type: null, unitId: null })} className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm" />
            
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 28, stiffness: 220 }} className={`relative bg-[#FDFCF8] h-full shadow-2xl border-l border-stone-200 flex flex-col z-10 transition-all duration-300 ${panel.type === 'questions' ? 'w-full max-w-2xl' : 'w-full max-w-md'}`}>
              
              {panel.type === 'questions' ? (
                // DECOUPLED COMPONENT RENDERED HERE
                <QuestionManager 
                  chapterId={chapterId} 
                  unitId={panel.unitId!} 
                  onClose={() => setPanel({ isOpen: false, type: null, unitId: null })}
                  onSuccess={fetchDataSummary}
                />
              ) : (
                // LEGACY ASSET UPLOADS (Videos, PDFs, Labs)
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
                    <h2 className="font-serif text-xl text-stone-900">Upload {panel.type?.toUpperCase()} Asset</h2>
                    <button type="button" onClick={() => setPanel({ isOpen: false, type: null, unitId: null })} className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleAssetSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Asset Title</label>
                      <input type="text" name="assetTitle" required placeholder="e.g., Chapter Reference Sheet" className="w-full bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 text-sm"/>
                    </div>
                    {panel.type !== 'lab' ? (
                      <div>
                        <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Upload File</label>
                        <div className="border-2 border-dashed border-stone-200 bg-white p-8 rounded-2xl flex flex-col items-center justify-center text-center relative group hover:border-stone-400 transition-colors cursor-pointer">
                          <UploadCloud size={28} className="text-stone-300 mb-2" />
                          <span className="text-sm font-medium text-stone-700">Attach Media Resource</span>
                          <input type="file" name="fileUpload" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept={panel.type === 'video' ? 'video/mp4' : panel.type === 'pdf' ? 'application/pdf' : 'image/*'} />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">React Component Pointer</label>
                        <input type="text" name="componentRef" required placeholder="e.g., OpticsLabSim" className="w-full bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 text-sm font-mono text-stone-600"/>
                      </div>
                    )}
                    <div className="mt-auto pt-6 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
                      <button type="button" onClick={() => setPanel({ isOpen: false, type: null, unitId: null })} className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900">Cancel</button>
                      <button type="submit" disabled={isProcessing} className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}<span>Save Asset</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}