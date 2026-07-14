"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Layers, Beaker, Calculator, Microscope, Loader2 } from 'lucide-react';
import Link from 'next/link';

const CURRICULUM_TREE = [
  {
    classId: 'c12', className: 'Class 12',
    subjects: [
      { id: 'math', name: 'Mathematics', icon: Calculator, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      { id: 'phy', name: 'Physics', icon: Layers, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
      { id: 'chem', name: 'Chemistry', icon: Beaker, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
      { id: 'bio', name: 'Biology', icon: Microscope, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
    ]
  },
  {
    classId: 'c11', className: 'Class 11',
    subjects: [
      { id: 'math', name: 'Mathematics', icon: Calculator, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      { id: 'phy', name: 'Physics', icon: Layers, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
      { id: 'chem', name: 'Chemistry', icon: Beaker, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
      { id: 'bio', name: 'Biology', icon: Microscope, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
    ]
  },
  {
    classId: 'c10', className: 'Class 10',
    subjects: [
      { id: 'math', name: 'Mathematics', icon: Calculator, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      { id: 'sci', name: 'Science', icon: Beaker, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    ]
  },
  {
    classId: 'c9', className: 'Class 9',
    subjects: [
      { id: 'math', name: 'Mathematics', icon: Calculator, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      { id: 'sci', name: 'Science', icon: Beaker, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    ]
  },
  {
    classId: 'c8', className: 'Class 8',
    subjects: [
      { id: 'math', name: 'Mathematics', icon: Calculator, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      { id: 'sci', name: 'Science', icon: Beaker, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    ]
  }
];

export default function AdminHubPage() {
  // Store chapter counts grouped by "classId-subjectId"
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllChapters = async () => {
      try {
        // Fetching all chapters across the entire database to calculate metrics
        const res = await fetch('/api/content/chapters'); 
        const chapters = await res.json();
        
        const countMap: Record<string, number> = {};
        
        if (Array.isArray(chapters)) {
          chapters.forEach((ch: any) => {
            const key = `${ch.classId}-${ch.subjectId}`;
            countMap[key] = (countMap[key] || 0) + 1;
          });
        }
        setCounts(countMap);
      } catch (error) {
        console.error("Failed to load chapter metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllChapters();
  }, []);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      <div className="mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 mb-3">Curriculum Hub</h1>
        <p className="text-stone-500 font-light text-base sm:text-lg max-w-2xl">
          Select a curriculum stream to manage chapters, synchronize NCERT assets, and structure question banks.
        </p>
      </div>

      <div className="space-y-12 sm:space-y-16">
        {CURRICULUM_TREE.map((gradeSection, index) => (
          <motion.section 
            key={gradeSection.classId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex items-center space-x-6 mb-6">
              <h2 className="text-2xl font-serif font-medium text-stone-800">{gradeSection.className}</h2>
              <div className="flex-1 h-px bg-stone-200/80" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {gradeSection.subjects.map((subject) => {
                const Icon = subject.icon;
                const chapterCount = counts[`${gradeSection.classId}-${subject.id}`] || 0;
                
                return (
                  <Link 
                    key={subject.id} 
                    href={`/admin/${gradeSection.classId}/${subject.id}`}
                    className="block h-full"
                  >
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-stone-200/40 hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between">
                      <div>
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-5 ${subject.bg} ${subject.color} ${subject.border} border`}>
                          <Icon size={24} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-medium text-stone-900 mb-1.5">{subject.name}</h3>
                        
                        {/* Dynamic Informative Metric */}
                        <div className="flex items-center text-sm font-light">
                          {isLoading ? (
                            <Loader2 size={12} className="animate-spin text-stone-400 mr-2" />
                          ) : (
                            <span className="bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md font-mono text-[11px] mr-2">
                              {chapterCount}
                            </span>
                          )}
                          <span className="text-stone-500">Chapters mapped</span>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex items-center justify-end text-stone-400 group-hover:text-stone-900 transition-colors">
                        <span className="text-sm font-medium mr-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">Open</span>
                        <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}