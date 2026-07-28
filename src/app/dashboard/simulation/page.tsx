// src/app/dashboard/simulation/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Maximize, Minimize, Loader2, Sparkles, ArrowRight, Eye } from 'lucide-react';
import XRViewer from '@/components/interactives/XRViewer';

type GraphicAsset = {
  _id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  modelUrl: string;
  themeColor: string;
  accentColor: string;
  glowColor: string;
};

export default function SimulationPage() {
  const [simulations, setSimulations] = useState<GraphicAsset[]>([]);
  const [activeSimId, setActiveSimId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // New Interactive States
  const [isIsolated, setIsIsolated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGraphics = async () => {
      try {
        const res = await fetch('/api/content/graphics');
        const data = await res.json();
        setSimulations(data);
        if (data.length > 0) setActiveSimId(data[0]._id);
      } catch (error) {
        console.error("Failed to load 3D graphics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGraphics();

    // Listen for Escape key exiting fullscreen natively
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error("Fullscreen failed:", err));
    } else {
      document.exitFullscreen();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-stone-500" size={32} />
      </div>
    );
  }

  if (simulations.length === 0 || !activeSimId) {
    return <div className="p-8 text-stone-500 text-center">No 3D virtual labs available yet.</div>;
  }

  const activeSim = simulations.find(s => s._id === activeSimId) || simulations[0];
  const inactiveSims = simulations.filter(s => s._id !== activeSimId);

  return (
    <div className="flex-1 w-full flex flex-col relative max-w-6xl mx-auto px-4 lg:px-8 pt-4 pb-32 overflow-y-auto no-scrollbar">
      
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-stone-900 tracking-tight mb-2">Virtual Labs</h1>
          <p className="text-stone-500 font-light text-lg">Learn by doing. Enter the metaverse.</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-stone-700 bg-stone-100 px-4 py-2 rounded-full border border-stone-200 shadow-sm">
          <Sparkles size={16} className="animate-pulse" />
          <span>{simulations.length} Labs Online</span>
        </div>
      </div>

      {/* --- CINEMATIC HOLOGRAM VIEWER --- */}
      {/* ADDED: ref and explicit md:h-[600px] height to fix desktop rendering */}
      <div 
        ref={containerRef} 
        className={`relative w-full shadow-2xl overflow-hidden bg-stone-950 flex flex-col md:flex-row items-center transition-all duration-300 ${
          isFullscreen ? 'h-screen rounded-none border-none' : 'min-h-[500px] md:h-[600px] rounded-[2.5rem] p-1 border border-stone-800'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSim._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`absolute inset-0 bg-gradient-to-br ${activeSim.themeColor} mix-blend-overlay`}
          />
        </AnimatePresence>

        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Top Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-30 pointer-events-none">
          <motion.span 
            key={`tag-${activeSim._id}`}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg ${activeSim.glowColor} transition-opacity duration-500 ${isIsolated ? 'opacity-0' : 'opacity-100'}`}
          >
            {activeSim.category}
          </motion.span>
          
          <div className="flex items-center gap-3 pointer-events-auto">
            {/* Show Info Button (Only visible when isolated) */}
            <AnimatePresence>
              {isIsolated && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setIsIsolated(false)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-2 text-white border border-white/20 hover:bg-white/20 transition-colors text-sm font-medium"
                >
                  <Eye size={16} /> Show Info
                </motion.button>
              )}
            </AnimatePresence>
            
            {/* Fullscreen Toggle */}
            <button onClick={toggleFullscreen} className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-colors">
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>

        {/* Left Side: Content */}
        {/* ADDED: Dynamic width and opacity shrinking for Isolate Mode */}
        <div className={`relative z-10 p-8 md:p-12 flex flex-col justify-center h-full pointer-events-none transition-all duration-700 ease-in-out ${
          isIsolated ? 'w-0 opacity-0 overflow-hidden' : 'w-full md:w-1/3 opacity-100'
        }`}>
          <AnimatePresence mode="wait">
            {!isIsolated && (
              <motion.div key={`content-${activeSim._id}`} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.5 }}>
                <h2 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-[1.1] tracking-tight drop-shadow-lg">
                  {activeSim.title}
                </h2>
                <p className="text-white/80 text-base font-light mb-10 max-w-sm leading-relaxed">
                  {activeSim.description}
                </p>
                
                {/* Isolate Button */}
                <button onClick={() => setIsIsolated(true)} className="pointer-events-auto group relative inline-flex items-center justify-center px-6 py-3 bg-stone-100 text-stone-900 rounded-full text-sm font-bold overflow-hidden transition-all hover:scale-105">
                  <Play size={16} fill="currentColor" className="mr-3" />
                  <span>Isolate Model</span>
                  <ArrowRight size={16} className="ml-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all absolute right-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: LIVE WEBXR MODEL VIEWER */}
        {/* ADDED: Dynamic width expansion for Isolate Mode */}
        <div className={`relative z-20 h-[400px] md:h-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-700 ease-in-out ${
          isIsolated ? 'w-full' : 'w-full md:w-2/3'
        }`}>
          <XRViewer src={activeSim.modelUrl} alt={activeSim.title} />
        </div>
      </div>

      {/* --- CAROUSEL OF OTHER LABS --- */}
      <div className={`mt-10 transition-opacity duration-500 ${isFullscreen ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <h3 className="text-xl font-medium text-stone-800 mb-6 font-serif">Explore the Warehouse</h3>
        <div className="flex space-x-5 overflow-x-auto no-scrollbar pb-6 pl-2 -ml-2">
          {inactiveSims.map((sim) => (
            <motion.button
              key={sim._id}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveSimId(sim._id); setIsIsolated(false); }}
              className="flex-shrink-0 w-80 p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm hover:border-stone-300 transition-all text-left group"
            >
              <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400 block mb-2">{sim.category}</span>
              <h4 className="text-xl font-serif text-stone-800 mb-2 group-hover:text-stone-600 transition-colors tracking-tight">{sim.title}</h4>
              <p className="text-sm text-stone-500 font-light leading-relaxed">{sim.subtitle}</p>
            </motion.button>
          ))}
        </div>
      </div>

    </div>
  );
}