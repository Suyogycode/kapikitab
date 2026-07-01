"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar } from 'lucide-react';

type Article = {
  title: string;
  description: string;
  content: string; // The snippet provided by the API
  url: string;
  urlToImage: string;
  source: { name: string };
  publishedAt: string;
};

export default function UpdatesFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative">
      {/* FEED GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <motion.button
            key={i}
            onClick={() => setSelectedArticle(article)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group text-left"
          >
            <div className="h-48 w-full bg-stone-100 overflow-hidden relative">
              {article.urlToImage && (
                <img src={article.urlToImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
            </div>
            <div className="p-6">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{article.source.name}</span>
              <h3 className="text-lg font-medium text-stone-900 mt-2 mb-2 leading-snug line-clamp-2">{article.title}</h3>
              <p className="text-stone-500 font-light text-sm line-clamp-3">{article.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* READER OVERLAY */}
      <AnimatePresence>
        {selectedArticle && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              className="fixed inset-4 md:inset-20 bg-white z-50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 right-6 p-3 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="overflow-y-auto p-8 md:p-16 flex-1">
                <span className="text-emerald-600 font-bold uppercase tracking-widest text-sm">{selectedArticle.source.name}</span>
                <h1 className="text-3xl md:text-5xl font-serif text-stone-900 mt-4 mb-6 leading-tight">{selectedArticle.title}</h1>
                
                <div className="h-64 w-full bg-stone-100 rounded-3xl mb-8 overflow-hidden">
                  <img src={selectedArticle.urlToImage} className="w-full h-full object-cover" />
                </div>

                <div className="prose prose-stone prose-lg max-w-3xl">
                  <p className="text-stone-600 leading-relaxed font-light">{selectedArticle.description}</p>
                  <p className="text-stone-600 leading-relaxed font-light">{selectedArticle.content?.split('[')[0]}</p>
                </div>

                <div className="mt-12 pt-8 border-t border-stone-100">
                  <a 
                    href={selectedArticle.url} 
                    target="_blank"
                    className="inline-flex items-center space-x-2 bg-stone-900 text-white px-8 py-4 rounded-full hover:bg-black transition-colors"
                  >
                    <span>Read Full Article</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}