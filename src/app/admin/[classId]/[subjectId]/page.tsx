"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, BookOpen, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type UnitSummary = {
  unitId: string;
  title: string;
  order: number;
};

type ChapterSummary = {
  _id: string;
  chapterId: string;
  chapterNumber: number;
  title: string;
  units: UnitSummary[];
};

const CLASS_MAP: Record<string, string> = {
  c8: 'Class 8th', c9: 'Class 9th', c10: 'Class 10th', c11: 'Class 11th', c12: 'Class 12th'
};

const SUBJECT_MAP: Record<string, string> = {
  math: 'Mathematics', sci: 'Science', phy: 'Physics', chem: 'Chemistry', bio: 'Biology'
};

export default function SubjectManagerPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const subjectId = params.subjectId as string;

  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/content/chapters?classId=${classId}&subjectId=${subjectId}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to load curriculum tree chapters.");
        
        const sortedData = (data || []).sort((a: any, b: any) => a.chapterNumber - b.chapterNumber);
        setChapters(sortedData);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "An error occurred while fetching curriculum content.");
      } finally {
        setIsLoading(false);
      }
    };

    if (classId && subjectId) fetchChapters();
  }, [classId, subjectId]);

  // --- NEW: INSTANT CHAPTER CREATION LOGIC ---
    const handleCreateChapter = async () => {
    setIsCreating(true);
    
    // Auto-calculate the next chapter number
    const nextChapNum = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapterNumber)) + 1 : 1;
    
    // Format the number to always be two digits (e.g., "01", "02")
    const formattedNum = String(nextChapNum).padStart(2, '0');
    
    // NEW CLEAN SLUG: e.g., ch-c12-math-01
    const newChapterId = `ch-${classId}-${subjectId}-${formattedNum}`;

    const newChapterPayload = {
      chapterId: newChapterId,
      classId: classId,
      subjectId: subjectId,
      chapterNumber: nextChapNum,
      title: `Chapter ${nextChapNum}: Untitled`,
      units: []
    };

    // ... rest of the fetch logic remains exactly the same

    try {
      const res = await fetch('/api/content/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChapterPayload),
      });

      if (res.ok) {
        // Boom. Created! Route them directly to the new workspace editor.
        router.push(`/admin/chapter/${newChapterId}`);
      } else {
        throw new Error("Failed to create the draft chapter.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate a new chapter workspace.");
      setIsCreating(false);
    }
  };

  const readableClass = CLASS_MAP[classId] || classId.toUpperCase();
  const readableSubject = SUBJECT_MAP[subjectId] || subjectId.toUpperCase();

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-stone-200/60">
        <div className="space-y-1">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-xs text-stone-400 hover:text-stone-900 font-medium tracking-wide transition-colors uppercase space-x-1 mb-2 group"
          >
            <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform" />
            <span>Curriculum Hub</span>
          </Link>
          <h1 className="text-3xl font-serif text-stone-900 tracking-tight">
            {readableClass} <span className="text-stone-300 font-light mx-1">•</span> {readableSubject}
          </h1>
          <p className="text-stone-500 font-light text-sm">
            Manage your index layout, structural metadata tabs, and contents blocks.
          </p>
        </div>

        {/* --- FIXED: ATTACHED THE NEW FUNCTION TO THE BUTTON --- */}
        <button 
          onClick={handleCreateChapter}
          disabled={isCreating}
          className="inline-flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm self-start sm:self-center disabled:opacity-50"
        >
          {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          <span>Publish New Chapter</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Loader2 className="animate-spin text-emerald-600 mb-3" size={28} />
          <span className="text-sm font-light">Loading syllabus schema indices...</span>
        </div>
      ) : errorMsg ? (
        <div className="p-4 rounded-xl border border-red-100 bg-red-50 text-red-800 flex items-center space-x-3 text-sm font-medium">
          <AlertCircle size={18} />
          <span>Error: {errorMsg}</span>
        </div>
      ) : chapters.length === 0 ? (
        <div className="border border-dashed border-stone-300 bg-stone-50/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-400 mb-4 shadow-sm">
            <BookOpen size={20} />
          </div>
          <h3 className="text-lg font-medium text-stone-800">No chapters initialized</h3>
          <p className="text-stone-400 font-light text-sm mt-1 max-w-xs mx-auto">
            This workspace database path contains no schemas. Create a new chapter to start mapping the curriculum.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-stone-100">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => router.push(`/admin/chapter/${chapter.chapterId}`)}
                className="p-5 flex items-center justify-between hover:bg-stone-50/70 transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-5 min-w-0 pr-4">
                  <div className="h-10 w-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-500 font-mono font-medium text-sm shrink-0">
                    {String(chapter.chapterNumber).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-medium text-stone-900 group-hover:text-emerald-700 transition-colors truncate">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-stone-400 font-mono tracking-tight truncate mt-0.5">
                      Slug: {chapter.chapterId} <span className="text-stone-200 mx-1">|</span> {chapter.units?.length || 0} Units Mapped
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-stone-400 group-hover:text-stone-900 transition-colors shrink-0">
                  <span className="text-xs font-medium mr-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
                    Workspace
                  </span>
                  <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}