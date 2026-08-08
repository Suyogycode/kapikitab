"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Sparkles, BookOpen } from 'lucide-react';

// Updated to match our new MongoDB Schema
type CuratedArticle = {
  _id: string;
  title: string;
  tldr: string;
  keyTakeaways: string[];
  deepDive: string;
  category: string;
  tags: string[];
  imageUrl?: string; // <-- Add this line right here
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
    return <div className="animate-pulse flex space-x-4 p-8">Loading STEM updates...</div>;
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* FEED GRID - Clean, minimal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, i) => (
          <motion.button
            key={article._id || i}
            onClick={() => setSelectedArticle(article)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex flex-col text-left bg-stone-50/50 hover:bg-stone-100/80 border border-stone-200/60 rounded-3xl p-8 transition-all duration-300"
          >
            {/* NEW IMAGE CONTAINER */}
            {article.imageUrl && (
              <div className="h-48 w-full bg-stone-200 overflow-hidden shrink-0 border-b border-stone-200/60">
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
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{article.category}</span>
              </div>
              <h3 className="text-xl font-serif text-stone-900 mb-3 leading-snug group-hover:text-emerald-800 transition-colors">
                {article.title}
              </h3>
              <p className="text-stone-600 font-light text-sm line-clamp-3 leading-relaxed">
                {article.tldr}
              </p>
              <div className="mt-auto pt-6 flex flex-wrap gap-2">
                {article.tags?.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider bg-stone-200/50 text-stone-600 px-3 py-1 rounded-full">
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
              className="fixed inset-0 bg-stone-900/20 backdrop-blur-md z-50"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="fixed inset-4 md:inset-x-[15%] md:inset-y-12 bg-[#FAFAFA] z-50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-stone-200"
            >
              <div className="flex justify-between items-center p-6 border-b border-stone-200/60 bg-white">
                <span className="text-emerald-700 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                  <Sparkles size={16} /> AI Curated Brief
                </span>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto px-8 py-12 md:px-20 md:py-16 flex-1 custom-scrollbar">
                <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-8 leading-[1.15]">
                  {selectedArticle.title}
                </h1>
                
                <div className="bg-stone-100/50 rounded-3xl p-8 mb-12 border border-stone-200/60">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                     Overview
                  </h3>
                  <p className="text-lg text-stone-700 font-light leading-relaxed">
                    {selectedArticle.tldr}
                  </p>
                </div>

                <div className="mb-12">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6">Key Takeaways</h3>
                  <ul className="space-y-4">
                    {selectedArticle.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex gap-4 items-start">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span className="text-stone-700 font-light leading-relaxed text-lg">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="prose prose-stone prose-lg max-w-none">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <BookOpen size={18} /> Deep Dive
                  </h3>
                  <div className="text-stone-700 font-light leading-relaxed whitespace-pre-wrap">
                    {selectedArticle.deepDive}
                  </div>
                </div>

                <div className="mt-16 pt-8 border-t border-stone-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="flex gap-2 items-center text-sm text-stone-500 font-light">
                    <span>Sources:</span>
                    {selectedArticle.sources.map((src, idx) => (
                      <a key={idx} href={src.url} target="_blank" rel="noreferrer" className="hover:text-emerald-700 underline underline-offset-4">
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