"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Maximize, Beaker, Atom, Globe, Lightbulb, Activity, ArrowRight, Sparkles } from 'lucide-react';

// --- MOCK SIMULATION DATA ---
const simulations = [
  {
    id: 'sim-1',
    title: 'The Fundamental Unit of Life',
    subtitle: 'Dive inside an animal cell',
    category: 'Biology',
    description: 'Shrink down to the size of a ribosome and explore the nucleus, mitochondria, and cytoplasm in full 3D space.',
    icon: Activity,
    color: 'from-emerald-900 to-emerald-950',
    accent: 'text-emerald-400',
    glow: 'shadow-emerald-500/20'
  },
  {
    id: 'sim-2',
    title: 'Gravitation & Orbits',
    subtitle: 'Control the planets',
    category: 'Physics',
    description: 'Change the mass of the Earth and watch how it affects the Moon\'s orbit. Warning: Do not drop the moon.',
    icon: Globe,
    color: 'from-stone-800 to-stone-950',
    accent: 'text-stone-300',
    glow: 'shadow-stone-500/20'
  },
  {
    id: 'sim-3',
    title: 'Atoms and Molecules',
    subtitle: 'Build your own universe',
    category: 'Chemistry',
    description: 'Smash protons and electrons together to build elements from the periodic table and test their volatility.',
    icon: Atom,
    color: 'from-amber-900 to-amber-950',
    accent: 'text-amber-400',
    glow: 'shadow-amber-500/20'
  },
  {
    id: 'sim-4',
    title: 'Light & Refraction',
    subtitle: 'Bend the spectrum',
    category: 'Physics',
    description: 'Set up virtual lasers, prisms, and mirrors to understand how light travels, bends, and bounces.',
    icon: Lightbulb,
    color: 'from-indigo-900 to-indigo-950',
    accent: 'text-indigo-400',
    glow: 'shadow-indigo-500/20'
  }
];

export default function SimulationPage() {
  const [activeSimId, setActiveSimId] = useState(simulations[0].id);

  const activeSim = simulations.find(s => s.id === activeSimId) || simulations[0];
  const inactiveSims = simulations.filter(s => s.id !== activeSimId);

  return (
    // Replaced fixed height container with flex-grow to ensure scrolling works perfectly
    <div className="flex-1 w-full flex flex-col relative max-w-6xl mx-auto px-4 lg:px-8 pt-4 pb-32 overflow-y-auto no-scrollbar">
      
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-stone-900 tracking-tight mb-2">Virtual Labs</h1>
          <p className="text-stone-500 font-light text-lg">Learn by doing. Enter the metaverse.</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
          <Sparkles size={16} className="animate-pulse" />
          <span>4 Labs Online</span>
        </div>
      </div>

      {/* --- CINEMATIC HOLOGRAM VIEWER --- */}
      <div className="relative w-full min-h-[480px] rounded-[2.5rem] p-1 shadow-2xl overflow-hidden bg-stone-950 flex flex-col md:flex-row items-center">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSim.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`absolute inset-0 bg-gradient-to-br ${activeSim.color} mix-blend-overlay`}
          />
        </AnimatePresence>

        {/* Abstract Topographical Grid to make it feel like a simulation room */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Top Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20 pointer-events-none">
          <motion.span 
            key={`tag-${activeSim.id}`}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-white/10 backdrop-blur-md border border-white/20 text-white pointer-events-auto shadow-lg ${activeSim.glow}`}
          >
            {activeSim.category}
          </motion.span>
          <button className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-colors pointer-events-auto">
            <Maximize size={20} />
          </button>
        </div>

        {/* Left Side: Content */}
        <div className="relative z-10 w-full md:w-1/2 p-8 md:p-12 pt-24 md:pt-12 flex flex-col justify-center h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${activeSim.id}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4 leading-[1.1] tracking-tight drop-shadow-lg">
                {activeSim.title}
              </h2>
              <p className="text-white/80 text-lg md:text-xl font-light mb-10 max-w-md leading-relaxed">
                {activeSim.description}
              </p>
              
              <button className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-stone-900 rounded-full text-base font-bold overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                <Play size={18} fill="currentColor" className="mr-3" />
                <span>Initialize Environment</span>
                <ArrowRight size={18} className="ml-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all absolute right-5" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Hologram / 3D Mock */}
        <div className="relative z-0 w-full md:w-1/2 h-64 md:h-full flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`holo-${activeSim.id}`}
              initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 15 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="relative flex items-center justify-center w-full h-full"
            >
              {/* Massive blurred background glow */}
              <div className={`absolute w-64 h-64 rounded-full blur-[80px] bg-current opacity-40 ${activeSim.accent}`} />
              
              {/* The "3D" Floating Object */}
              <motion.div
                animate={{ 
                  y: [-15, 15, -15], 
                  rotateY: [0, 10, -10, 0] // Fakes a subtle 3D rotation
                }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className={`relative z-10 ${activeSim.accent}`}
              >
                {/* Dynamically rendering the icon component */}
                {React.createElement(activeSim.icon, { size: 200, strokeWidth: 0.5 })}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* --- CAROUSEL OF OTHER LABS --- */}
      <div className="mt-10">
        <h3 className="text-xl font-medium text-stone-800 mb-6 font-serif">Explore more labs</h3>
        <div className="flex space-x-5 overflow-x-auto no-scrollbar pb-6 pl-2 -ml-2">
          
          {inactiveSims.map((sim) => (
            <motion.button
              key={sim.id}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSimId(sim.id)}
              className="flex-shrink-0 w-80 p-6 rounded-[2rem] bg-white border border-stone-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all text-left group"
            >
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${sim.color} shadow-inner`}>
                {React.createElement(sim.icon, { size: 28, className: "text-white" })}
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400 block mb-2">
                {sim.category}
              </span>
              <h4 className="text-2xl font-serif text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors tracking-tight">
                {sim.title}
              </h4>
              <p className="text-sm text-stone-500 font-light leading-relaxed">
                {sim.subtitle}
              </p>
            </motion.button>
          ))}

          {/* Locked / Coming Soon Card */}
          <div className="flex-shrink-0 w-80 p-6 rounded-[2rem] bg-stone-50/50 border-2 border-stone-200 border-dashed flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-stone-200 flex items-center justify-center mb-4">
              <Beaker size={24} className="text-stone-400" />
            </div>
            <span className="text-stone-600 font-medium text-lg font-serif">More labs syncing...</span>
            <span className="text-sm text-stone-400 mt-1 font-light">Keep leveling up your profile</span>
          </div>

        </div>
      </div>

    </div>
  );
}