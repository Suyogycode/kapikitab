"use client";

import React, { useState } from 'react';
import { Sparkles, UploadCloud, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';

export default function NewChapterPage() {
  // --- 1. CORE DETAILS STATE ---
  const [subject, setSubject] = useState('Math');
  const [title, setTitle] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [order, setOrder] = useState('1');
  const [overview, setOverview] = useState('');
  
  // --- 2. MULTIMEDIA PIPELINE STATE ---
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  // --- 3. PRACTICE QUESTIONS STATE ---
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);

  // Question Handlers
  const addQuestion = () => setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
  const removeQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));
  
  const updateQuestion = (index: number, field: string, value: string, optionIndex?: number) => {
    const updated = [...questions];
    if (field === 'options' && optionIndex !== undefined) {
      updated[index].options[optionIndex] = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setQuestions(updated);
  };

  // Media Upload Handlers
  const uploadToR2 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "image");

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Cloudflare R2 Upload Failed");
    const data = await res.json();
    return data.url; 
  };

  const setupBunnyVideo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "video");

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Bunny Stream Handshake Failed");
    const data = await res.json();
    return `https://iframe.mediadelivery.net/play/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${data.videoId}`;
  };

  // Master Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setStatus({ type: null, message: '' });

    try {
      let finalVideoUrl = "";
      let finalResourceUrl = "";

      // 1. Process Multimedia files
      if (videoFile) {
        finalVideoUrl = await setupBunnyVideo(videoFile);
      }
      if (resourceFile) {
        finalResourceUrl = await uploadToR2(resourceFile);
      }

      // 2. Compile full context package
      const chapterData = {
        chapterId: chapterId.toLowerCase().replace(/\s+/g, '-'),
        subject,
        title,
        order: parseInt(order),
        zones: {
          overview: { content: overview, keyTerms: [] },
          cinema: { videoUrl: finalVideoUrl, transcript: "" },
          lab: { simulationId: `sim_${chapterId.toLowerCase()}_01` },
          practice: { questions }, // Injects the dynamic questions array here!
          reference: {
            nextChapterId: "",
            resources: resourceFile ? [{ title: `${title} Reference Guide`, url: finalResourceUrl }] : []
          }
        }
      };

      // 3. Push complete manifest to Database API
      const response = await fetch('/api/content/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chapterData),
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Chapter synced with MongoDB and CDNs successfully!' });
        // Reset form completely
        setTitle(''); setChapterId(''); setOverview(''); setVideoFile(null); setResourceFile(null);
        setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
      } else {
        throw new Error("Failed to store payload in database.");
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Pipeline process broken. Check server logs.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl pb-32">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-medium text-stone-900">Publish Core Content</h2>
        <p className="text-stone-500 font-light mt-1">Stitch together core structures, streams, and study sheets seamlessly.</p>
      </div>

      {status.type && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center space-x-3 text-sm border ${
          status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* TOP MAIN ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Subject Domain</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-white border border-stone-200 rounded-xl p-3.5 focus:outline-none focus:border-stone-400 font-light text-sm">
              {['Math', 'Physics', 'Chemistry', 'Biology', 'Computer'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col space-y-2 md:col-span-2">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Chapter Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Coordinate Geometry" className="bg-white border border-stone-200 rounded-xl p-3.5 focus:outline-none focus:border-stone-400 font-light text-sm"/>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Unique URL Slug</label>
            <input type="text" required value={chapterId} onChange={(e) => setChapterId(e.target.value)} placeholder="e.g., coordinate-geometry" className="bg-white border border-stone-200 rounded-xl p-3.5 focus:outline-none focus:border-stone-400 font-mono text-sm"/>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Map Order</label>
            <input type="number" required value={order} onChange={(e) => setOrder(e.target.value)} className="bg-white border border-stone-200 rounded-xl p-3.5 focus:outline-none focus:border-stone-400 font-light text-sm"/>
          </div>
        </div>

        {/* OVERVIEW CONTENT TEXTAREA */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Zone 1: Overview Text</label>
          <textarea rows={5} required value={overview} onChange={(e) => setOverview(e.target.value)} placeholder="Introduce the lesson concepts beautifully here..." className="bg-white border border-stone-200 rounded-2xl p-4 focus:outline-none focus:border-stone-400 font-light text-sm leading-relaxed"/>
        </div>

        {/* MULTIMEDIA PIPELINES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="border-2 border-dashed border-stone-200 bg-white p-6 rounded-2xl flex flex-col items-center justify-center text-center relative group hover:border-amber-400 transition-colors">
            <UploadCloud size={28} className="text-stone-400 group-hover:text-amber-500 transition-colors mb-2" />
            <span className="text-sm font-medium text-stone-700">Zone 2: HD Video Lecture</span>
            <span className="text-xs text-stone-400 font-light mt-1">{videoFile ? videoFile.name : 'MP4 target for Bunny Stream'}</span>
            <input type="file" accept="video/mp4" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
          </div>

          <div className="border-2 border-dashed border-stone-200 bg-white p-6 rounded-2xl flex flex-col items-center justify-center text-center relative group hover:border-blue-400 transition-colors">
            <UploadCloud size={28} className="text-stone-400 group-hover:text-blue-500 transition-colors mb-2" />
            <span className="text-sm font-medium text-stone-700">Zone 5: Reference Guides</span>
            <span className="text-xs text-stone-400 font-light mt-1">{resourceFile ? resourceFile.name : 'PDF target for Cloudflare R2'}</span>
            <input type="file" accept="application/pdf,image/*" onChange={(e) => setResourceFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
          </div>
        </div>

        {/* DYNAMIC PRACTICE QUESTIONS SECTION */}
        <div className="border-t border-stone-200 pt-8 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif text-stone-900">Zone 4: Practice Questions</h3>
            <button type="button" onClick={addQuestion} className="flex items-center space-x-1 text-sm bg-stone-100 px-4 py-2 rounded-full hover:bg-stone-200 transition-colors">
              <Plus size={16} /> <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-white border border-stone-200 rounded-3xl p-6 relative shadow-sm">
                <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-6 right-6 text-stone-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
                
                <input 
                  type="text" required placeholder="Question Text..." 
                  value={q.questionText} onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4 focus:outline-none focus:border-stone-400 pr-12 text-stone-800"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {[0, 1, 2, 3].map(optIndex => (
                    <input 
                      key={optIndex} type="text" required placeholder={`Option ${optIndex + 1}`}
                      value={q.options[optIndex]} onChange={(e) => updateQuestion(qIndex, 'options', e.target.value, optIndex)}
                      className="bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 text-sm font-mono"
                    />
                  ))}
                </div>

                <select 
                  required value={q.correctAnswer} onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                  className="w-full bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 focus:outline-none focus:border-emerald-300 text-sm"
                >
                  <option value="" disabled>Select Correct Answer...</option>
                  {q.options.map((opt, i) => opt && <option key={i} value={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT TRIGGER */}
        <button type="submit" disabled={isUploading} className="w-full bg-[#232323] hover:bg-black text-white py-4 rounded-2xl font-medium transition-colors mt-8 flex items-center justify-center space-x-2 disabled:opacity-50">
          <Sparkles size={18} className="text-emerald-400" />
          <span>{isUploading ? 'Distributing to Cloud...' : 'Deploy Chapter'}</span>
        </button>

      </form>
    </div>
  );
}