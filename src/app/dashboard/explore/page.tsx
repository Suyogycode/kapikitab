"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UpdatesFeed from './components/UpdatesFeed';

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState('updates');

  const tabs = [
    { id: 'updates', label: 'Updates' },
    { id: 'community', label: 'Community' },
    { id: 'marketplace', label: 'Marketplace' }
  ];

  return (
    <div className="h-full w-full flex flex-col items-center pt-6 pb-28 px-4 max-w-[95%] xl:max-w-[90vw] mx-auto transition-colors duration-500">
      
      {/* TOP PILL NAVIGATION */}
      <div className="flex bg-stone-100/80 dark:bg-[#151821]/80 backdrop-blur-md p-1.5 rounded-full mb-8 shadow-inner border border-stone-200/60 dark:border-slate-700/50 z-10 shrink-0 transition-colors duration-500">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-8 py-2.5 rounded-full text-sm font-medium transition-colors z-10 ${
                isActive 
                  ? 'text-stone-900 dark:text-slate-100' 
                  : 'text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="exploreTabBubble" 
                  className="absolute inset-0 bg-white dark:bg-[#282C3D] rounded-full shadow-sm border border-stone-200/50 dark:border-slate-600/50 -z-10" 
                  transition={{ type: "spring", stiffness: 400, damping: 30 }} 
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            {activeTab === 'updates' && <UpdatesFeed />}
            {activeTab === 'community' && <div className="text-center mt-20 text-stone-400 dark:text-slate-500 transition-colors">Community coming soon...</div>}
            {activeTab === 'marketplace' && <div className="text-center mt-20 text-stone-400 dark:text-slate-500 transition-colors">Marketplace coming soon...</div>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}