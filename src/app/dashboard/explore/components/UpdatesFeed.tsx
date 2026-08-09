"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, BookOpen, Loader2 } from 'lucide-react';

type CuratedArticle = {
  _id: string;
  title: string;
  tldr: string;
  keyTakeaways: string[];
  deepDive: string;
  category: string;
  tags: string[];
  imageUrl?: string; 
  sources: { name: string; url: string }[];
  publishedAt: string;
};

export default function UpdatesFeed() {
  const [articles, setArticles] = useState<CuratedArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<CuratedArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 text-stone-400 dark:text-slate-500 transition-colors">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="font-light tracking-wide text-sm">Curating STEM updates...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto transition-colors duration-500">
      
      {/* FEED GRID - Restructured for flush images and prominent card boundaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, i) => (
          <motion.button
            key={article._id || i}
            onClick={() => setSelectedArticle(article)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            // Padding removed here, background set to pure white / raised dark slate
            className="group flex flex-col text-left bg-white dark:bg-[#282C3D] border border-stone-200 dark:border-slate-700/80 shadow-sm hover:shadow-md dark:shadow-none hover:border-stone-300 dark:hover:border-slate-500 rounded-3xl overflow-hidden transition-all duration-300"
          >
            
            {/* NEW IMAGE CONTAINER - Now spans edge-to-edge */}
            {article.imageUrl && (
              <div className="h-48 w-full bg-stone-200 dark:bg-[#151821] overflow-hidden shrink-0 border-b border-stone-100 dark:border-slate-700/50 transition-colors">
                <img 
                  src={article.imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop"} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
            )}
            
            {/* Wrapper for the text content so padding remains intact */}
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xs font-bold text-emerald-700 dark:text-blue-400 uppercase tracking-widest transition-colors">{article.category}</span>
              </div>
              <h3 className="text-xl font-serif text-stone-900 dark:text-slate-100 mb-3 leading-snug group-hover:text-emerald-800 dark:group-hover:text-blue-300 transition-colors">
                {article.title}
              </h3>
              <p className="text-stone-600 dark:text-slate-300 font-light text-sm line-clamp-3 leading-relaxed transition-colors">
                {article.tldr}
              </p>
              <div className="mt-auto pt-6 flex flex-wrap gap-2">
                {article.tags?.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider bg-stone-100 dark:bg-[#151821] text-stone-600 dark:text-slate-400 px-3 py-1 rounded-full border border-stone-200/50 dark:border-slate-700/50 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* READER OVERLAY - Spacious, Earthy Perplexity Style */}
      <AnimatePresence>
        {selectedArticle && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="fixed inset-0 bg-stone-900/20 dark:bg-black/60 backdrop-blur-md z-50 transition-colors"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="fixed inset-4 md:inset-x-[15%] md:inset-y-12 bg-[#FAFAFA] dark:bg-[#1C1F2B] z-50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-stone-200 dark:border-slate-700 transition-colors"
            >
              <div className="flex justify-between items-center p-6 border-b border-stone-200/60 dark:border-slate-700/80 bg-white dark:bg-[#282C3D] transition-colors">
                <span className="text-emerald-700 dark:text-blue-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition-colors">
                  <Sparkles size={16} /> AI Curated Brief
                </span>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 text-stone-400 dark:text-slate-500 hover:text-stone-800 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto px-8 py-12 md:px-20 md:py-16 flex-1 custom-scrollbar">
                <h1 className="text-4xl md:text-5xl font-serif text-stone-900 dark:text-slate-100 mb-8 leading-[1.15] transition-colors">
                  {selectedArticle.title}
                </h1>
                
                <div className="bg-stone-100/50 dark:bg-[#151821] rounded-3xl p-8 mb-12 border border-stone-200/60 dark:border-slate-700/50 transition-colors">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2 transition-colors">
                     Overview
                  </h3>
                  <p className="text-lg text-stone-700 dark:text-slate-300 font-light leading-relaxed transition-colors">
                    {selectedArticle.tldr}
                  </p>
                </div>

                <div className="mb-12">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-slate-200 uppercase tracking-widest mb-6 transition-colors">Key Takeaways</h3>
                  <ul className="space-y-4">
                    {selectedArticle.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex gap-4 items-start">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-blue-400 shrink-0 transition-colors" />
                        <span className="text-stone-700 dark:text-slate-300 font-light leading-relaxed text-lg transition-colors">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="prose prose-stone dark:prose-invert prose-lg max-w-none">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-slate-200 uppercase tracking-widest mb-6 flex items-center gap-2 transition-colors">
                    <BookOpen size={18} /> Deep Dive
                  </h3>
                  <div className="text-stone-700 dark:text-slate-300 font-light leading-relaxed whitespace-pre-wrap transition-colors">
                    {selectedArticle.deepDive}
                  </div>
                </div>

                <div className="mt-16 pt-8 border-t border-stone-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center transition-colors">
                  <div className="flex gap-2 items-center text-sm text-stone-500 dark:text-slate-400 font-light transition-colors">
                    <span>Sources:</span>
                    {selectedArticle.sources.map((src, idx) => (
                      <a key={idx} href={src.url} target="_blank" rel="noreferrer" className="hover:text-emerald-700 dark:hover:text-blue-400 underline underline-offset-4 transition-colors">
                        {src.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}