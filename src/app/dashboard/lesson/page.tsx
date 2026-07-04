"use client";

import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, Lock, Play, Compass, Orbit, FlaskConical, Dna, Terminal, 
  Sigma, FunctionSquare, Triangle, Brackets, Calculator, Atom, Magnet, 
  Zap, Microscope, Leaf, Bug, Code, Cpu, Database, 
  Plus, Divide, Infinity as InfinityIcon, Pi, 
  Waves, Telescope, Hexagon, Droplets, Sprout, Hash, Braces, Beaker
} from 'lucide-react';
import Link from 'next/link';
import { DashboardContext } from '../layout';

// ============================================================================
// AMBIENT BACKGROUND COMPONENT
// ============================================================================
const FloatingAmbientBackground = ({ icons, color }: { icons: any[], color: string }) => {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      Icon: icons[Math.floor(Math.random() * icons.length)],
      size: Math.random() * (100 - 40) + 40, 
      left: `${Math.random() * 100}vw`,
      top: `${Math.random() * 100}vh`,
      duration: Math.random() * (80 - 40) + 40, 
      delay: Math.random() * -60, 
    }));
    setParticles(generated);
    setMounted(true);
  }, [icons]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute ${color} opacity-[0.15]`}
          style={{ left: p.left, top: p.top }}
          animate={{
            y: [0, -50, 50, 0],
            x: [0, 40, -40, 0],
            rotate: [0, 90, -90, 0], 
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        >
          <p.Icon size={p.size} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// SUBJECT-SPECIFIC THEME & DATA DICTIONARY
// ============================================================================
const subjectThemes: Record<string, any> = {
  math: {
    background: 'bg-[#EBE8DD]', // Deepened to Warm Oat
    text: 'text-[#3E423A]',
    accent: 'bg-[#4A5D4E]', 
    pathColor: 'border-[#4A5D4E]/30',
    watermark: <Sigma className="w-[120vw] h-[120vh] text-[#4A5D4E]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />,
    floatingIcons: [Plus, Divide, InfinityIcon, Pi, Triangle, Brackets],
    nodes: [
      { id: 'foundations', title: "Number Systems", status: 'completed', CustomIcon: Calculator }, 
      { id: 'algebra', title: "Polynomials", status: 'completed', CustomIcon: FunctionSquare },
      { id: 'geometry', title: "Coordinate Geometry", status: 'active', CustomIcon: Triangle },
      { id: 'linear', title: "Linear Equations", status: 'locked', CustomIcon: Brackets }, 
      { id: 'triangles', title: "Triangles", status: 'locked', CustomIcon: Compass }, 
      { id: 'trig', title: "Trigonometry", status: 'locked', CustomIcon: Calculator }, 
      { id: 'complex', title: "Complex Numbers", status: 'locked', CustomIcon: FunctionSquare }, 
      { id: 'calculus', title: "Calculus Peaks", status: 'locked', CustomIcon: Sigma },
    ]
  },
  physics: {
    background: 'bg-[#E2E6EB]', // Deepened to Steel Frost
    text: 'text-[#2C3137]',
    accent: 'bg-[#5C6B89]', 
    pathColor: 'border-[#5C6B89]/30',
    watermark: <Orbit className="w-[120vw] h-[120vh] text-[#5C6B89]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />,
    floatingIcons: [Waves, Telescope, Zap, Magnet, Atom],
    nodes: [
      { id: 'kin', title: "Kinematics", status: 'completed', CustomIcon: Orbit }, 
      { id: 'dyn', title: "Dynamics", status: 'active', CustomIcon: Atom },
      { id: 'em', title: "Electromagnetism", status: 'locked', CustomIcon: Magnet },
      { id: 'thermo', title: "Thermodynamics", status: 'locked', CustomIcon: Zap }, 
      { id: 'quantum', title: "Quantum", status: 'locked', CustomIcon: Orbit }, 
    ]
  },
  chemistry: {
    background: 'bg-[#E1EBE7]', // Deepened to Soft Eucalyptus 
    text: 'text-[#2A3A35]',
    accent: 'bg-[#52796F]',
    pathColor: 'border-[#52796F]/30',
    watermark: <FlaskConical className="w-[120vw] h-[120vh] text-[#52796F]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />,
    floatingIcons: [Hexagon, Droplets, FlaskConical, Atom, Beaker],
    nodes: [
      { id: 'atm', title: "Atomic Structure", status: 'completed', CustomIcon: Atom }, 
      { id: 'bond', title: "Bonding", status: 'active', CustomIcon: FlaskConical },
      { id: 'org', title: "Organic Chem", status: 'locked', CustomIcon: Hexagon },
      { id: 'kinet', title: "Kinetics", status: 'locked', CustomIcon: Zap }, 
      { id: 'eq', title: "Equilibrium", status: 'locked', CustomIcon: Droplets }, 
    ]
  },
  biology: {
    background: 'bg-[#E8E4D5]', // Deepened to Dried Reed
    text: 'text-[#423D33]',
    accent: 'bg-[#8A795D]',
    pathColor: 'border-[#8A795D]/30',
    watermark: <Dna className="w-[120vw] h-[120vh] text-[#8A795D]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />,
    floatingIcons: [Sprout, Leaf, Bug, Dna, Microscope],
    nodes: [
      { id: 'cell', title: "Cell Biology", status: 'completed', CustomIcon: Microscope }, 
      { id: 'gen', title: "Genetics", status: 'active', CustomIcon: Dna },
      { id: 'evo', title: "Evolution", status: 'locked', CustomIcon: Leaf },
      { id: 'eco', title: "Ecology", status: 'locked', CustomIcon: Bug }, 
      { id: 'physio', title: "Physiology", status: 'locked', CustomIcon: Microscope }, 
    ]
  },
  computer: {
    background: 'bg-[#E3E5E9]', // Deepened to Tech Ash
    text: 'text-[#1F2937]',
    accent: 'bg-[#4B5563]',
    pathColor: 'border-[#4B5563]/30',
    watermark: <Terminal className="w-[120vw] h-[120vh] text-[#4B5563]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />,
    floatingIcons: [Code, Hash, Braces, Cpu, Database],
    nodes: [
      { id: 'intro', title: "Intro to Logic", status: 'completed', CustomIcon: Terminal }, 
      { id: 'ds', title: "Data Structures", status: 'active', CustomIcon: Database },
      { id: 'algo', title: "Algorithms", status: 'locked', CustomIcon: Code },
      { id: 'arch', title: "Architecture", status: 'locked', CustomIcon: Cpu }, 
      { id: 'os', title: "Operating Systems", status: 'locked', CustomIcon: Terminal }, 
    ]
  }
};

// ============================================================================
// MASTER COMPONENT
// ============================================================================
export default function LessonPage() {
  const { activeSubject } = useContext(DashboardContext);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const theme = subjectThemes[activeSubject] || subjectThemes['math'];

  useEffect(() => {
    if (window.innerWidth < 1024 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeSubject]);

  return (
    <div className={`fixed inset-0 w-screen h-screen ${theme.background} overflow-hidden transition-colors duration-500`}>
      
      {/* 1. Static Massive Watermark */}
      <div className="pointer-events-none z-0">
        {theme.watermark}
      </div>

      {/* 2. Floating Ambient Particles */}
      <FloatingAmbientBackground icons={theme.floatingIcons} color={theme.text} />

      {/* 3. The Interactive Map Canvas */}
      <div 
        ref={scrollContainerRef}
        className="w-full h-full flex flex-col-reverse lg:flex-row items-center justify-start pt-32 pb-48 lg:pt-0 lg:px-48 gap-16 lg:gap-32 overflow-y-auto lg:overflow-x-auto lg:overflow-y-hidden no-scrollbar relative z-10"
      >
        
        {/* The connecting central line */}
        <div className={`absolute top-0 bottom-0 left-1/2 w-0.5 border-l-2 border-dashed ${theme.pathColor} lg:w-full lg:h-0.5 lg:border-t-2 lg:border-l-0 lg:top-1/2 lg:left-0 lg:bottom-auto -z-10`} />

        {/* Render Chapters */}
        {theme.nodes.map((node: any, index: number) => {
          
          const isEven = index % 2 === 0;
          const zigZagClass = isEven 
            ? "translate-x-12 lg:translate-x-0 lg:-translate-y-24" 
            : "-translate-x-12 lg:translate-x-0 lg:translate-y-24";

          return (
            <div key={node.id} className={`relative flex flex-col items-center justify-center shrink-0 group ${zigZagClass}`}>
              
              {/* Tooltip */}
              <div className="absolute lg:-top-16 -top-12 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-stone-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 transform -translate-y-2 group-hover:translate-y-0">
                <span className={`font-serif font-medium text-lg ${theme.text}`}>{node.title}</span>
              </div>

              <Link href={node.status === 'locked' ? '#' : `/learning/${node.id}`}>
                <motion.button 
                  whileHover={node.status !== 'locked' ? { scale: 1.05 } : {}}
                  whileTap={node.status !== 'locked' ? { scale: 0.95 } : {}}
                  className={`relative flex items-center justify-center w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-white shadow-xl border border-stone-100 transition-all duration-300 ${
                    node.status === 'locked' ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <node.CustomIcon className={`w-10 h-10 lg:w-14 lg:h-14 ${node.status === 'locked' ? 'text-stone-300' : theme.text}`} strokeWidth={1.5} />

                  {/* Status Badges */}
                  <div className={`absolute -bottom-3 -right-3 h-10 w-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg z-30 ${
                    node.status === 'active' ? theme.accent : 
                    node.status === 'completed' ? 'bg-stone-300' : 
                    'bg-stone-200'
                  }`}>
                    {node.status === 'completed' && <Check className="text-white" size={18} strokeWidth={3} />}
                    {node.status === 'active' && <Play className="text-white ml-0.5" size={18} fill="currentColor" />}
                    {node.status === 'locked' && <Lock className="text-stone-400" size={16} />}
                  </div>

                  {/* Gentle ping animation for active node */}
                  {node.status === 'active' && (
                    <div className={`absolute inset-0 -m-2 rounded-3xl border-2 ${theme.pathColor} scale-110 animate-ping z-0`} style={{ animationDuration: '3s' }} />
                  )}
                </motion.button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}