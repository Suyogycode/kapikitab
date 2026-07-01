"use client";

import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Check, Lock, Beaker } from 'lucide-react';
import Link from 'next/link';
import { DashboardContext } from '../layout';
import Image from 'next/image';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// --- THE EXPANDED CONCEPT GRAPH ---
const nodes = [
  { id: 'foundations', title: "Number Systems", x: 50, y: 53, status: 'completed', prereqs: [] }, 
  { id: 'algebra', title: "Polynomials", x: 33, y: 71, status: 'completed', prereqs: ['foundations'] },
  { id: 'geometry', title: "Coordinate Geometry", x: 18, y: 59, status: 'active', prereqs: ['algebra'] },
  { id: 'linear', title: "Linear Equations", x: 19, y: 35, status: 'locked', prereqs: ['geometry'] }, 
  { id: 'triangles', title: "Triangles", x: 37, y: 22, status: 'locked', prereqs: ['linear'] }, 
  { id: 'trig', title: "Trigonometry", x: 67, y: 23, status: 'locked', prereqs: ['foundations'] }, 
  { id: 'complex', title: "Complex Numbers", x: 82, y: 36, status: 'locked', prereqs: ['trig'] }, 
  { id: 'calculus', title: "Calculus Peaks", x: 65, y: 70, status: 'locked', prereqs: ['complex', 'algebra'] },
];

export default function LessonPage() {
  const { activeSubject } = useContext(DashboardContext);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  if (activeSubject !== 'math') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="h-20 w-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 border-2 border-stone-200 border-dashed">
          <Beaker size={32} className="text-stone-400" />
        </div>
        <h2 className="text-3xl font-serif text-stone-800 mb-2">Subject Syncing...</h2>
        <p className="text-stone-500 text-lg">We are currently perfecting the Mathematics vertical.</p>
      </div>
    );
  }

  return (
    // FULLSCREEN BACKGROUND OVERLAY
    <div className="fixed inset-0 w-screen h-screen z-0 bg-[#b6c7a4] overflow-hidden">
      
      <div className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <TransformWrapper
          initialScale={1}
          initialPositionX={-400} // Centers the map roughly on load
          initialPositionY={-200}
          minScale={0.6} // Prevents zooming out so far that the background shows
          maxScale={2.5} // Prevents zooming in so far it gets blurry
          limitToBounds={true} // Creates the "wall" collision so you can't drag off-screen
          centerZoomedOut={true}
          wheel={{ step: 0.1 }} // Smooth mouse wheel zooming
          doubleClick={{ step: 0.5 }} // Zooms exactly where the mouse pointer is!
        >
          <TransformComponent wrapperStyle={{ width: "100vw", height: "100vh" }}>
            
            {/* THE MASSIVE GAME WORLD (2500x1600) */}
            <div className="relative" style={{ width: '2500px', height: '1600px' }}>
              
              {/* LAYER 1: THE TERRAIN */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <Image 
                  src="/village-map.png" 
                  alt="Learning Village Map" 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>

              {/* LAYER 2: THE GLOWING PATHS */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {nodes.map((node) => {
                  return node.prereqs.map((prereqId) => {
                    const parent = nodes.find(n => n.id === prereqId);
                    if (!parent) return null;
                    
                    const isPathActive = node.status === 'active' || node.status === 'completed';
                    
                    return (
                      <line 
                        key={`${parent.id}-${node.id}`} 
                        x1={`${parent.x}%`} y1={`${parent.y}%`} 
                        x2={`${node.x}%`} y2={`${node.y}%`} 
                        stroke={isPathActive ? "rgba(252, 211, 77, 0.8)" : "rgba(255, 255, 255, 0.4)"} 
                        strokeWidth="8" 
                        strokeDasharray={isPathActive ? "none" : "15 15"} 
                        strokeLinecap="round" 
                      />
                    );
                  });
                })}
              </svg>

              {/* LAYER 3: THE BUILDINGS */}
              {nodes.map((node) => (
                <div 
                  key={node.id} 
                  className="absolute z-20 flex flex-col items-center justify-center group" 
                  style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="absolute -top-16 bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-xl shadow-lg border border-stone-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 transform -translate-y-2 group-hover:translate-y-0">
                    <span className="font-serif font-medium text-xl text-stone-800">{node.title}</span>
                  </div>

                  <Link href={node.status === 'locked' ? '#' : `/learning/${node.id}`}>
                    <motion.button 
                      whileHover={node.status !== 'locked' ? { scale: 1.05, y: -5 } : {}}
                      whileTap={node.status !== 'locked' ? { scale: 0.95 } : {}}
                      className={`relative flex items-center justify-center transition-all duration-300 ${
                        node.status === 'locked' ? 'cursor-not-allowed opacity-60 grayscale' : 'cursor-pointer'
                      }`}
                    >
                      {node.id !== 'foundations' && (
                        <Image 
                          src="/observatory.png" 
                          alt={node.title} 
                          width={240} // Scaled up to match the massive 2500px map
                          height={240} 
                          className="drop-shadow-2xl"
                        />
                      )}

                      <div className={`absolute -bottom-4 right-8 h-12 w-12 rounded-full border-4 border-white flex items-center justify-center shadow-xl z-30 ${
                        node.status === 'active' ? 'bg-amber-500 animate-bounce' : 
                        node.status === 'completed' ? 'bg-emerald-500' : 
                        'bg-stone-400'
                      }`}>
                        {node.status === 'completed' && <Check className="text-white" size={24} strokeWidth={3} />}
                        {node.status === 'active' && <Play className="text-white ml-1" size={24} fill="currentColor" />}
                        {node.status === 'locked' && <Lock className="text-white" size={20} />}
                      </div>

                      {node.status === 'active' && (
                        <div className="absolute inset-0 -m-4 rounded-full border-4 border-amber-400/40 scale-125 animate-ping z-0" style={{ animationDuration: '3s' }} />
                      )}
                    </motion.button>
                  </Link>
                </div>
              ))}
            </div>

          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}