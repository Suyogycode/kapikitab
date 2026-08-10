"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Save, Loader2, FileVideo, 
  FileText, ChevronDown, Image as ImageIcon, 
  Beaker, X, UploadCloud, Sparkles, Database, Trash2
} from 'lucide-react';
import Link from 'next/link';

// Import our new decoupled component
import QuestionManager from '@/components/admin/QuestionManager';

// --- TYPES ---
type Unit = { unitId: string; title: string; order: number; };
type Chapter = { chapterId: string; classId: string; subjectId: string; chapterNumber: number; title: string; summary?: string;  units: Unit[]; };
type AssetCountSummary = { video_lecture: number; pdf_document: number; diagram: number; react_simulation: number; questionsCount: number; };
type UnitInventory = Record<string, AssetCountSummary>;

type PanelType = 'video' | 'pdf' | 'diagram' | 'lab' | 'questions' | null;

export default function SimplifiedChapterWorkspace() {
  const params = useParams();
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [inventory, setInventory] = useState<UnitInventory>({});
  const [assets, setAssets] = useState<any[]>([]); // NEW: Store fetched assets
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [panel, setPanel] = useState<{ isOpen: boolean; type: PanelType; unitId: string | null }>({
    isOpen: false, type: null, unitId: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchDataSummary = async () => {
    try {
      const [chapRes, summaryRes, assetsRes] = await Promise.all([
        fetch(`/api/content/chapter?id=${chapterId}`),
        fetch(`/api/content/chapter/summary?chapterId=${chapterId}`),
        fetch(`/api/content/asset?chapterId=${chapterId}`) // NEW: Fetch all assets for this chapter
      ]);

      if (chapRes.ok) {
        const data = await chapRes.json();
        data.units.sort((a: Unit, b: Unit) => a.order - b.order);
        setChapter(data);
        if (data.units.length > 0 && !expandedUnit) setExpandedUnit(data.units[0].unitId);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setInventory(summaryData.unitInventory || {});
      }

      if (assetsRes.ok) {
        const assetsData = await assetsRes.json();
        setAssets(assetsData);
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

  const handleSaveSummary = async () => {
    if (!chapter) return;
    setIsSavingSummary(true);
    try {
      await fetch('/api/content/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chapter),
      });
      await fetchDataSummary();
    } catch (err) {
      console.error("Failed to save chapter context summary:", err);
    } finally {
      setIsSavingSummary(false);
    }
  };

  // NEW: Delete Asset Logic
  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm("Are you sure you want to permanently delete this asset?")) return;
    setIsDeleting(assetId);
    try {
      const res = await fetch(`/api/content/asset?id=${assetId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete asset from database.");
      await fetchDataSummary();
    } catch (error) {
      console.error(error);
      alert("Failed to delete the asset.");
    } finally {
      setIsDeleting(null);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url; 
  };

  const handleAssetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get('fileUpload') as File; 
    const youtubeUrl = formData.get('youtubeUrl') as string;
    const componentRef = formData.get('componentRef') as string;

    try {
      const title = (formData.get('assetTitle') || formData.get('labTitle')) as string;
      let uploadedUrl = '';
      let stagingKey = '';

      if (file && file.size > 0) {
        const uploadType = panel.type === 'video' ? 'video' : 'image';
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("type", uploadType);

        const response = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
        if (!response.ok) throw new Error('Failed to authorize upload.');

        const data = await response.json();

        if (data.isPresigned) {
          const uploadRes = await fetch(data.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type || 'video/mp4' },
          });
          if (!uploadRes.ok) throw new Error("Direct-to-R2 upload failed.");
          
          uploadedUrl = data.url;
          stagingKey = data.stagingKey || '';
        } else {
          uploadedUrl = data.url;
        }
      } else if (youtubeUrl && youtubeUrl.trim() !== '') {
        uploadedUrl = getYouTubeEmbedUrl(youtubeUrl.trim());
      } else if (panel.type !== 'lab') {
        alert("Please upload a file or provide a YouTube URL.");
        setIsProcessing(false);
        return;
      }

      const typeMapping: Record<string, string> = {
        'video': 'video_lecture',
        'pdf': 'pdf_document',
        'diagram': 'diagram',
        'lab': 'react_simulation'
      };
      
      const schemaCompliantType = panel.type ? typeMapping[panel.type] : 'diagram';
      const semanticAssetId = `ast-${chapterId}-${panel.unitId}-${Date.now()}`;

      let finalContent: any = uploadedUrl;
      
      if (schemaCompliantType === 'video_lecture') {
        finalContent = { 
          videoUrl: uploadedUrl,
          stagingKey: stagingKey,
          status: stagingKey ? 'processing' : 'ready' 
        };
      } else if (schemaCompliantType === 'react_simulation') {
        finalContent = componentRef.trim(); 
      }

      const contentPayload = {
        assetId: semanticAssetId,
        chapterId: chapterId,
        unitId: panel.unitId,
        order: 1,
        type: schemaCompliantType, 
        title: title,
        content: finalContent,
      };

      const dbResponse = await fetch('/api/content/asset', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentPayload),
      });

      if (!dbResponse.ok) throw new Error('Database transaction failed.');

      setPanel({ isOpen: false, type: null, unitId: null });
      await fetchDataSummary();
      
    } catch (error) {
      console.error('Pipeline Upload Failed:', error);
      alert("Asset saving failed. Check console details.");
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

      {/* CANONICAL CONTEXT / RAG-LITE SUMMARY CARD */}
      <div className="mb-8 border border-stone-200 bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-600" />
            <h3 className="text-sm font-semibold text-stone-900">Canonical Chapter Summary (AI Podcast Grounding)</h3>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
              RAG-Lite Context
            </span>
            <button
              type="button"
              onClick={handleSaveSummary}
              disabled={isSavingSummary}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSavingSummary ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{isSavingSummary ? 'Saving...' : 'Save Context'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-stone-500 mb-4">
          This summary is fed directly to Groq during podcast generation. Keep it targeted to your grade level.
        </p>

        <textarea
          rows={5}
          value={chapter.summary || ''}
          onChange={(e) => setChapter({ ...chapter, summary: e.target.value })}
          placeholder="Write the core grade-level concepts, key formulas, and real-world examples here..."
          className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed transition-colors resize-y"
        />
      </div>

      {/* 2. UNITS MAPPING */}
      <div className="space-y-6">
        {chapter.units.map((unit) => {
          const isExpanded = expandedUnit === unit.unitId;
          const counts = inventory[unit.unitId] || { video_lecture: 0, pdf_document: 0, diagram: 0, react_simulation: 0, questionsCount: 0 };
          const unitAssets = assets.filter(a => a.unitId === unit.unitId);

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

                  {/* ZONE B: EXISTING ASSETS MANAGER */}
                  {unitAssets.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-3">Managed Assets</h4>
                      <div className="space-y-2">
                        {unitAssets.map(asset => (
                          <div key={asset.assetId} className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition-colors">
                            <div className="flex items-center gap-4">
                              {/* Dynamic Thumbnails & Icons */}
                              {asset.type === 'video_lecture' && <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center"><FileVideo size={18} className="text-emerald-600" /></div>}
                              {asset.type === 'pdf_document' && <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><FileText size={18} className="text-blue-600" /></div>}
                              {asset.type === 'react_simulation' && <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><Beaker size={18} className="text-amber-600" /></div>}
                              {asset.type === 'diagram' && (
                                <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden relative border border-stone-200">
                                  <img src={typeof asset.content === 'string' ? asset.content : asset.content?.url} className="object-cover w-full h-full" alt="thumbnail" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-stone-800">{asset.title}</p>
                                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-mono mt-0.5">{asset.type.replace('_', ' ')}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteAsset(asset.assetId)} 
                              disabled={isDeleting === asset.assetId}
                              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isDeleting === asset.assetId ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ZONE C: QUESTION BANK INGESTION */}
                  <div className="pt-2">
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
                <QuestionManager 
                  chapterId={chapterId} 
                  unitId={panel.unitId!} 
                  onClose={() => setPanel({ isOpen: false, type: null, unitId: null })}
                  onSuccess={fetchDataSummary}
                />
              ) : (
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
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Upload File</label>
                    <div className="border-2 border-dashed border-stone-200 bg-white p-8 rounded-2xl flex flex-col items-center justify-center text-center relative group hover:border-stone-400 transition-colors cursor-pointer">
                      <UploadCloud size={28} className="text-stone-300 mb-2" />
                      <span className="text-sm font-medium text-stone-700">Attach Media Resource</span>
                      <input type="file" name="fileUpload" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept={panel.type === 'video' ? 'video/mp4' : panel.type === 'pdf' ? 'application/pdf' : 'image/*'} />
                    </div>
                  </div>
                  
                  {panel.type === 'video' && (
                    <>
                      <div className="flex items-center gap-3 text-stone-300 text-xs font-bold uppercase tracking-widest">
                        <span className="h-px bg-stone-200 flex-1"></span>
                        OR
                        <span className="h-px bg-stone-200 flex-1"></span>
                      </div>
                      <div>
                        <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">YouTube Fallback Link</label>
                        <input type="url" name="youtubeUrl" placeholder="https://youtube.com/watch?v=..." className="w-full bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 text-sm font-mono text-stone-600"/>
                      </div>
                    </>
                  )}
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