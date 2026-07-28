// src/components/interactives/labs/FunctionMachineLab.tsx
'use client';

import React, { useState, useEffect } from 'react';

export default function FunctionMachineLab() {
  const [operator, setOperator] = useState('+');
  const [operand, setOperand] = useState(3);
  const [currentInput, setCurrentInput] = useState(8);
  const [animPhase, setAnimPhase] = useState<'idle' | 'entering' | 'processing' | 'exiting'>('idle');
  const [history, setHistory] = useState([
    { in: 8, out: 11 },
    { in: 9, out: 12 },
    { in: 12, out: 15 }
  ]);

  const calculateOutput = (input: number, op: string, val: number) => {
    switch (op) {
      case '+': return input + val;
      case '-': return input - val;
      case '×': return input * val;
      case '÷': return input / val;
      default: return input;
    }
  };

  useEffect(() => {
    if (animPhase === 'entering') {
      const timer1 = setTimeout(() => setAnimPhase('processing'), 1000);
      return () => clearTimeout(timer1);
    }
    if (animPhase === 'processing') {
      const timer2 = setTimeout(() => setAnimPhase('exiting'), 800);
      return () => clearTimeout(timer2);
    }
    if (animPhase === 'exiting') {
      const timer3 = setTimeout(() => {
        setHistory(prev => [...prev, { 
          in: currentInput, 
          out: calculateOutput(currentInput, operator, operand) 
        }]);
        setAnimPhase('idle');
        setCurrentInput(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer3);
    }
  }, [animPhase, currentInput, operator, operand]);

  const handleAnimate = () => {
    if (animPhase === 'idle') setAnimPhase('entering');
  };

  const getBlockStyle = () => {
    const baseStyle = "absolute top-[60%] w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-800 font-bold text-lg transition-all duration-1000 ease-linear z-20";
    switch (animPhase) {
      case 'idle': return `${baseStyle} left-0 opacity-100`;
      case 'entering': return `${baseStyle} left-[40%] opacity-100`;
      case 'processing': return `${baseStyle} left-[50%] opacity-0 scale-50`;
      case 'exiting': return `${baseStyle} left-[100%] opacity-100 scale-100 duration-1000`;
      default: return `${baseStyle} left-0 opacity-0`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 rounded-2xl border border-slate-200 font-sans text-slate-800">
      <div className="mb-8">
        <p className="mb-4 text-sm font-medium text-slate-600">Create the expression for your function by selecting an operation and a number.</p>
        <div className="flex flex-wrap gap-2">
          {['+', '-', '×', '÷'].map(op => (
            <button key={op} onClick={() => setOperator(op)} className={`w-9 h-9 rounded-lg border text-sm font-bold transition-all ${operator === op ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-slate-200'}`}>{op}</button>
          ))}
          <div className="w-3" />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <button key={num} onClick={() => setOperand(num)} className={`w-9 h-9 rounded-lg border text-sm font-bold transition-all ${operand === num ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-pink-600 border-slate-200'}`}>{num}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative w-full md:w-2/3 h-72 bg-white border border-slate-200 rounded-xl p-4 overflow-hidden shadow-inner">
          <div className="absolute top-4 left-[40%] border-2 border-slate-800 bg-white px-3 py-1 font-mono font-bold text-base z-30 rounded-md">
            a <span className="text-indigo-600">{operator}</span> <span className="text-pink-600">{operand}</span>
          </div>

          <div className={getBlockStyle()}>
            {animPhase === 'exiting' ? calculateOutput(currentInput, operator, operand) : currentInput}
          </div>

          <div className="absolute top-[65%] left-0 w-[40%] h-4 bg-teal-200 border-y-2 border-slate-800 z-10" />
          <div className="absolute top-[20%] left-[35%] w-[30%] h-[70%] bg-teal-400 border-2 border-slate-800 rounded-t-lg z-30 flex items-center justify-center">
            {animPhase === 'processing' && <span className="text-xs font-bold animate-pulse text-white uppercase tracking-wider">Processing...</span>}
          </div>
          <div className="absolute top-[65%] right-0 w-[40%] h-4 bg-teal-200 border-y-2 border-slate-800 z-10" />

          <div className="absolute bottom-4 left-4 flex gap-2 z-40">
            <button onClick={handleAnimate} disabled={animPhase !== 'idle'} className="px-4 py-1.5 border-2 border-indigo-600 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 uppercase">Animate</button>
            <button onClick={() => { setHistory(prev => [...prev, { in: currentInput, out: calculateOutput(currentInput, operator, operand) }]); setCurrentInput(prev => prev + 1); }} className="px-4 py-1.5 border border-slate-300 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 uppercase">Skip</button>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <table className="w-full border-collapse border border-slate-200 bg-white text-center text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono">
                <th className="py-2 border-r border-slate-200">Input (a)</th>
                <th className="py-2">Output (a {operator} {operand})</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 font-mono">
                  <td className="py-2 border-r border-slate-200">{row.in}</td>
                  <td className="py-2 font-bold text-indigo-600">{row.out}</td>
                </tr>
              ))}
              <tr className="font-mono bg-indigo-50/30">
                <td className="py-2 border-r border-slate-200">{currentInput}</td>
                <td className="py-2 text-slate-400">?</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}