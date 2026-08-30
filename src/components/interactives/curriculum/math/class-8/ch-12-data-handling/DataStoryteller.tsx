'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Calendar, MapPin, Lightbulb, Activity, GitMerge } from 'lucide-react';

// ==================================================================
// DATASETS & MATH ENGINE
// ==================================================================
const DATASETS = {
  weather: {
    title: 'Monthly Maximum Temperature (°C)',
    yAxisMax: 50,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [
      { 
        id: 'punjab', name: 'Punjab', color: '#f59e0b', // Amber
        data: [19, 22, 28, 34, 39, 40, 35, 34, 34, 32, 26, 21],
        notes: { 4: "Peak Heatwave", 5: "40°C - Absolute Peak", 11: "Winter Chill Begins" }
      },
      { 
        id: 'kerala', name: 'Kerala', color: '#10b981', // Emerald
        data: [31, 32, 33, 33, 32, 30, 29, 29, 30, 30, 31, 31],
        notes: { 2: "Pre-monsoon Heat", 5: "Monsoon Drops Temp", 6: "Coolest Month" }
      }
    ]
  }
};

export default function DataStoryteller() {
  const [timeIndex, setTimeIndex] = useState<number>(0); // 0 to 11 (Months)
  const [compareMode, setCompareMode] = useState<boolean>(true);
  
  const dataset = DATASETS.weather;
  const activeSeries = compareMode ? dataset.series : [dataset.series[0]];

  // SVG Coordinate Mapping
  const SVG_W = 800;
  const SVG_H = 400;
  const MARGIN_X = 60;
  const MARGIN_Y = 40;
  const GRAPH_W = SVG_W - MARGIN_X * 2;
  const GRAPH_H = SVG_H - MARGIN_Y * 2;

  const getX = (index: number) => MARGIN_X + (index / (dataset.labels.length - 1)) * GRAPH_W;
  const getY = (val: number) => SVG_H - MARGIN_Y - (val / dataset.yAxisMax) * GRAPH_H;

  // Generate SVG Path up to the current time index
  const getPath = (data: number[]) => {
    if (timeIndex === 0) return `M ${getX(0)} ${getY(data[0])}`;
    let path = `M ${getX(0)} ${getY(data[0])}`;
    for (let i = 1; i <= timeIndex; i++) {
      path += ` L ${getX(i)} ${getY(data[i])}`;
    }
    return path;
  };

 // Find active contextual notes for the current month
  const activeNotes = useMemo(() => {
    const notes: { seriesName: string, text: string, color: string }[] = [];
    activeSeries.forEach(s => {
      // The double-cast (unknown -> Record) forces TypeScript to accept the dynamic number index
      const noteMap = s.notes as unknown as Record<number, string>;
      const noteText = noteMap[timeIndex];
      
      if (noteText) {
        notes.push({ seriesName: s.name, text: noteText, color: s.color });
      }
    });
    return notes;
  }, [timeIndex, activeSeries]);

  return (
    <div className="w-full h-full min-h-[750px] bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="mb-6 z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <LineChart className="text-emerald-500" /> The Data Storyteller
          </h2>
          <p className="text-stone-400 text-sm mt-1">{dataset.title}</p>
        </div>

        <button 
          onClick={() => setCompareMode(!compareMode)}
          className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border-2 ${compareMode ? 'bg-blue-950/50 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-stone-900 border-stone-700 text-stone-400 hover:bg-stone-800'}`}
        >
          <GitMerge size={16} />
          {compareMode ? 'Comparison Mode: ON' : 'Comparison Mode: OFF'}
        </button>
      </div>

      {/* THE MAIN GRAPH CANVAS */}
      <div className="flex-1 w-full bg-[#1c1917] rounded-2xl border border-stone-800 shadow-inner relative flex flex-col items-center justify-center p-4 z-10 overflow-hidden">
        
        <div className="w-full max-w-4xl relative aspect-[2/1]">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full drop-shadow-xl">
            
            {/* Grid & Axes */}
            <g className="text-stone-700" strokeDasharray="4 4">
              {[0, 10, 20, 30, 40, 50].map(val => (
                <line key={`grid-y-${val}`} x1={MARGIN_X} y1={getY(val)} x2={SVG_W - MARGIN_X} y2={getY(val)} stroke="currentColor" strokeWidth="1" opacity={0.3} />
              ))}
              {dataset.labels.map((_, i) => (
                <line key={`grid-x-${i}`} x1={getX(i)} y1={MARGIN_Y} x2={getX(i)} y2={SVG_H - MARGIN_Y} stroke="currentColor" strokeWidth="1" opacity={0.3} />
              ))}
            </g>

            {/* Y-Axis Labels */}
            <g className="text-stone-500 font-mono text-[10px]" fill="currentColor" textAnchor="end" alignmentBaseline="middle">
              {[0, 10, 20, 30, 40, 50].map(val => (
                <text key={`label-y-${val}`} x={MARGIN_X - 10} y={getY(val)}>{val}°</text>
              ))}
            </g>

            {/* X-Axis Labels */}
            <g className="text-stone-500 font-mono text-[10px]" fill="currentColor" textAnchor="middle">
              {dataset.labels.map((label, i) => (
                <text key={`label-x-${i}`} x={getX(i)} y={SVG_H - MARGIN_Y + 20} className={i === timeIndex ? 'fill-emerald-400 font-bold text-xs' : ''}>
                  {label}
                </text>
              ))}
            </g>

            {/* The Data Lines */}
            <AnimatePresence>
              {activeSeries.map((series, sIdx) => (
                <g key={series.id}>
                  {/* The Line */}
                  <motion.path 
                    d={getPath(series.data)}
                    fill="none"
                    stroke={series.color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                  
                  {/* The Data Points */}
                  {series.data.map((val, i) => {
                    if (i > timeIndex) return null;
                    const isCurrent = i === timeIndex;
                    return (
                      <motion.circle
                        key={`pt-${sIdx}-${i}`}
                        cx={getX(i)}
                        cy={getY(val)}
                        r={isCurrent ? 6 : 4}
                        fill={series.color}
                        stroke="#1c1917"
                        strokeWidth="2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={isCurrent ? 'filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}
                      />
                    );
                  })}

                  {/* Current Value Floating Label */}
                  <motion.text
                    x={getX(timeIndex)}
                    y={getY(series.data[timeIndex]) - 15}
                    fill={series.color}
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {series.data[timeIndex]}°
                  </motion.text>
                </g>
              ))}
            </AnimatePresence>

            {/* Vertical Scrubber Line */}
            <motion.line 
              x1={getX(timeIndex)} y1={MARGIN_Y} x2={getX(timeIndex)} y2={SVG_H - MARGIN_Y} 
              stroke="#ffffff" strokeWidth="2" strokeDasharray="4 4" opacity={0.2}
              initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
            />
          </svg>
        </div>

        {/* Floating Tooltip/Note Area */}
        <div className="absolute top-8 right-8 flex flex-col gap-2 z-20">
          <AnimatePresence>
            {activeNotes.map((note, i) => (
              <motion.div 
                key={`note-${i}`}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="bg-black/80 backdrop-blur-md border px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3"
                style={{ borderColor: `${note.color}50` }}
              >
                <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: note.color, color: note.color }} />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block mb-0.5">{note.seriesName}</span>
                  <span className="text-sm font-medium text-white">{note.text}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* AHA! MESSAGE & LEGEND */}
      <div className="mt-4 flex flex-col md:flex-row items-stretch gap-4 z-10 shrink-0">
        
        {/* AHA Panel */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {compareMode && timeIndex >= 4 && timeIndex <= 6 ? (
              <motion.div key="intersect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full bg-blue-950/40 border border-blue-900/50 p-4 rounded-xl flex items-start gap-3 shadow-lg">
                <GitMerge size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-stone-300 text-sm leading-relaxed">
                  <strong>The Intersection:</strong> Look at April and May. Kerala's temperature is stable, but Punjab's skyrockets right past it! Line graphs are powerful because they don't just show data; they show the <em>rate of change</em>. The steeper the line, the faster the temperature is climbing.
                </p>
              </motion.div>
            ) : (
              <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full bg-stone-900 border border-stone-800 p-4 rounded-xl flex items-start gap-3 shadow-lg">
                <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-stone-400 text-sm leading-relaxed">
                  Drag the timeline slider below to advance through the year. Watch how the line visually constructs the "story" of the changing seasons. Turn on <strong>Comparison Mode</strong> to see how two different geographies behave over the same timeframe.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="shrink-0 bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-center gap-3 min-w-[200px]">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Map Legend</span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-amber-500" />
              <span className="text-sm font-medium text-stone-300">Punjab (North)</span>
            </div>
            {compareMode && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-emerald-500" />
                <span className="text-sm font-medium text-stone-300">Kerala (South)</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* TIMELINE SCRUBBER */}
      <div className="mt-4 bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-sm z-10 shrink-0">
        <div className="flex justify-between items-end mb-3">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
            <Calendar size={16} className="text-emerald-500" /> Timeline (Month)
          </label>
          <span className="text-sm font-mono font-bold text-white bg-stone-800 px-3 py-1 rounded-md border border-stone-700">
            {dataset.labels[timeIndex]}
          </span>
        </div>
        <input 
          type="range" min="0" max="11" step="1" 
          value={timeIndex} 
          onChange={(e) => setTimeIndex(parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-stone-700 accent-emerald-500"
        />
        <div className="w-full flex justify-between mt-2 px-1">
          {dataset.labels.map((lbl, i) => (
             <span key={`tick-${i}`} className={`text-[9px] font-mono uppercase cursor-pointer transition-colors ${i === timeIndex ? 'text-emerald-400 font-bold' : 'text-stone-600 hover:text-stone-400'}`} onClick={() => setTimeIndex(i)}>
               {lbl.charAt(0)}
             </span>
          ))}
        </div>
      </div>

    </div>
  );
}