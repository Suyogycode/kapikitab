"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, Save, Loader2, ShieldCheck, Target, Edit2, CheckCircle2, ArrowLeft, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", 
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", 
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", 
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const PRESET_EXAMS = [
  "School Exam", "Board Exam", "JEE Main", "JEE Advanced", "NEET", 
  "CUET", "NDA"
];

const FIELD_LABELS: Record<string, string> = {
  name: "Full Name",
  class: "Class",
  board: "Board",
  state: "State",
  exams: "Target Exams"
};

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'info', text: string } | null>(null);
  
  // Theme State Setup
  const [isDark, setIsDark] = useState(false);

  // Sync theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark') || localStorage.getItem('kapikitab-theme') === 'dark';
      setIsDark(isDarkMode);
      if (isDarkMode) document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kapikitab-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kapikitab-theme', 'light');
    }
  };
  
  const [originalData, setOriginalData] = useState({
    name: '', state: '', class: '', board: '', exams: [] as string[]
  });
  
  const [formData, setFormData] = useState({
    name: '', state: '', class: '', board: '', exams: [] as string[]
  });

  const [editMode, setEditMode] = useState({
    name: false, state: false, class: false, board: false, exams: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          const loadedData = {
            name: data.name || '',
            state: data.state || '',
            class: data.class || '',
            board: data.board || '',
            exams: data.exams || []
          };
          setFormData(loadedData);
          setOriginalData(loadedData);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setAlertMessage(null); 
  };

  const toggleExam = (examName: string) => {
    if (!editMode.exams) return; 
    setFormData(prev => {
      const isSelected = prev.exams.includes(examName);
      if (isSelected) return { ...prev, exams: prev.exams.filter(e => e !== examName) };
      return { ...prev, exams: [...prev.exams, examName] };
    });
    setAlertMessage(null);
  };

  const toggleEdit = (field: keyof typeof editMode) => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }));
    setAlertMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMessage(null);

    const changedFields: string[] = [];
    Object.keys(formData).forEach(key => {
      const k = key as keyof typeof formData;
      if (JSON.stringify(formData[k]) !== JSON.stringify(originalData[k])) {
        changedFields.push(FIELD_LABELS[k]);
      }
    });

    if (changedFields.length === 0) {
      setAlertMessage({ type: 'info', text: "No changes were made." });
      setEditMode({ name: false, state: false, class: false, board: false, exams: false });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setOriginalData(formData);
        setEditMode({ name: false, state: false, class: false, board: false, exams: false });
        setAlertMessage({ type: 'success', text: `Successfully updated: ${changedFields.join(', ')}` });

        if (formData.class !== originalData.class) {
          const formattedClassId = 'c' + formData.class.replace('Class ', '').trim();
          await update({ classId: formattedClassId });
        }
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#FDFCF8] dark:bg-[#1C1F2B] transition-colors duration-500">
        <Loader2 className="animate-spin text-emerald-600 dark:text-blue-400 mb-6 opacity-40" size={28} strokeWidth={1} />
        <h2 className="font-serif text-xs tracking-[0.3em] text-stone-500 dark:text-slate-400 uppercase">Syncing Profile</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] dark:bg-[#1C1F2B] transition-colors duration-500 pt-12 relative overflow-x-hidden">
      
      {/* Mobile Padding updated to pb-48 to easily clear the bottom navigation */}
      <div className="max-w-2xl mx-auto px-6 sm:px-8 w-full pb-48 sm:pb-40">
        
        {/* Header section with Dedicated Theme Toggle */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between w-full gap-8 sm:gap-0 mb-16 mt-4">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="h-20 w-20 bg-white dark:bg-[#282C3D] border border-stone-100 dark:border-slate-700/50 text-stone-400 dark:text-slate-400 rounded-[2rem] flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-colors duration-500 shrink-0">
              <User size={32} strokeWidth={1.5} />
            </div>
            
            <div className="pt-2">
              <h1 className="text-3xl font-serif text-stone-800 dark:text-slate-100 tracking-wide mb-1 transition-colors">Account Profile</h1>
              <p className="text-stone-400 dark:text-slate-400 font-light text-sm tracking-wide transition-colors">Manage your personal data and curriculum settings.</p>
            </div>
          </div>

          {/* Dedicated Theme Button with Credibility */}
          <div className="flex items-center justify-between w-full sm:w-auto space-x-4 bg-white dark:bg-[#282C3D] px-5 py-3 rounded-2xl border border-stone-100 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-colors duration-500 shrink-0">
            <span className="text-[10px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-[0.2em]">Theme</span>
            <button 
              onClick={toggleTheme} 
              className="relative w-14 h-8 flex items-center bg-stone-100 dark:bg-[#0E1017] rounded-full p-1 transition-colors duration-300 shrink-0"
              aria-label="Toggle Dark Mode"
            >
              <motion.div
                layout
                className="w-6 h-6 bg-white dark:bg-[#282C3D] rounded-full shadow-sm flex items-center justify-center"
                animate={{ x: isDark ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
              >
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
                )}
              </motion.div>
            </button>
          </div>

        </div>

        <form onSubmit={handleSave} className="space-y-10">
          
          <AnimatePresence>
            {alertMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }} 
                animate={{ opacity: 1, y: 0, height: 'auto' }} 
                exit={{ opacity: 0, y: -10, height: 0 }}
                className={`flex items-center space-x-3 p-5 rounded-2xl text-sm font-medium border shadow-sm ${
                  alertMessage.type === 'success' 
                    ? 'bg-[#E1EBE7]/50 dark:bg-blue-900/20 text-[#52796F] dark:text-blue-300 border-[#52796F]/20 dark:border-blue-800/30' 
                    : 'bg-stone-50 dark:bg-[#222534] text-stone-500 dark:text-slate-400 border-stone-100 dark:border-slate-700/50'
                }`}
              >
                {alertMessage.type === 'success' && <CheckCircle2 size={18} strokeWidth={1.5} className="text-[#52796F] dark:text-blue-400 shrink-0" />}
                <span className="font-light tracking-wide">{alertMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Read-Only Email Field */}
          <div>
            <label className="block text-[10px] font-medium text-stone-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2 transition-colors">Email Address</label>
            <div className="flex items-center space-x-3 w-full bg-stone-50/50 dark:bg-[#151821] border border-stone-100 dark:border-slate-700/30 text-stone-400 dark:text-slate-500 p-5 rounded-2xl cursor-not-allowed transition-all">
              <ShieldCheck size={18} strokeWidth={1.5} />
              <span className="font-mono text-sm tracking-wide">{session?.user?.email}</span>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-[10px] font-medium text-stone-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2 transition-colors">Full Name</label>
            <div className="relative flex items-center w-full group">
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} disabled={!editMode.name}
                className={`w-full p-5 pr-16 rounded-2xl outline-none transition-all duration-500 font-light tracking-wide ${
                  editMode.name 
                    ? 'bg-white dark:bg-[#282C3D] border-2 border-[#4A5D4E]/30 dark:border-blue-400/50 text-stone-800 dark:text-slate-200 shadow-[0_10px_40px_rgb(0,0,0,0.03)]' 
                    : 'bg-stone-50/50 dark:bg-[#151821] border border-stone-100 dark:border-slate-700/30 text-stone-500 dark:text-slate-400 cursor-not-allowed hover:bg-stone-50 dark:hover:bg-[#1A1D27]'
                }`}
              />
              <button 
                type="button" 
                onClick={() => toggleEdit('name')} 
                className={`absolute right-4 p-2.5 rounded-xl transition-all duration-300 ${
                  editMode.name 
                    ? 'bg-[#4A5D4E]/10 dark:bg-blue-900/30 text-[#4A5D4E] dark:text-blue-400 hover:bg-[#4A5D4E]/20 dark:hover:bg-blue-900/50' 
                    : 'text-stone-300 dark:text-slate-600 group-hover:text-stone-500 dark:group-hover:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700'
                }`}
              >
                <Edit2 size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Class & Board Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-6">
            <div>
              <label className="block text-[10px] font-medium text-stone-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2 transition-colors">Class</label>
              <div className="relative flex items-center w-full group">
                <select 
                  name="class" value={formData.class} onChange={handleChange} disabled={!editMode.class}
                  className={`w-full p-5 pr-16 rounded-2xl outline-none transition-all duration-500 font-light tracking-wide appearance-none ${
                    editMode.class 
                      ? 'bg-white dark:bg-[#282C3D] border-2 border-[#4A5D4E]/30 dark:border-blue-400/50 text-stone-800 dark:text-slate-200 shadow-[0_10px_40px_rgb(0,0,0,0.03)] cursor-pointer' 
                      : 'bg-stone-50/50 dark:bg-[#151821] border border-stone-100 dark:border-slate-700/30 text-stone-500 dark:text-slate-400 cursor-not-allowed hover:bg-stone-50 dark:hover:bg-[#1A1D27]'
                  }`}
                >
                  <option value="" disabled>Select Class</option>
                  {['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button 
                  type="button" 
                  onClick={() => toggleEdit('class')} 
                  className={`absolute right-4 p-2.5 rounded-xl transition-all duration-300 ${
                    editMode.class 
                      ? 'bg-[#4A5D4E]/10 dark:bg-blue-900/30 text-[#4A5D4E] dark:text-blue-400 hover:bg-[#4A5D4E]/20 dark:hover:bg-blue-900/50' 
                      : 'text-stone-300 dark:text-slate-600 group-hover:text-stone-500 dark:group-hover:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Edit2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-stone-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2 transition-colors">Board</label>
              <div className="relative flex items-center w-full group">
                <select 
                  name="board" value={formData.board} onChange={handleChange} disabled={!editMode.board}
                  className={`w-full p-5 pr-16 rounded-2xl outline-none transition-all duration-500 font-light tracking-wide appearance-none ${
                    editMode.board 
                      ? 'bg-white dark:bg-[#282C3D] border-2 border-[#4A5D4E]/30 dark:border-blue-400/50 text-stone-800 dark:text-slate-200 shadow-[0_10px_40px_rgb(0,0,0,0.03)] cursor-pointer' 
                      : 'bg-stone-50/50 dark:bg-[#151821] border border-stone-100 dark:border-slate-700/30 text-stone-500 dark:text-slate-400 cursor-not-allowed hover:bg-stone-50 dark:hover:bg-[#1A1D27]'
                  }`}
                >
                  <option value="" disabled>Select Board</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                </select>
                <button 
                  type="button" 
                  onClick={() => toggleEdit('board')} 
                  className={`absolute right-4 p-2.5 rounded-xl transition-all duration-300 ${
                    editMode.board 
                      ? 'bg-[#4A5D4E]/10 dark:bg-blue-900/30 text-[#4A5D4E] dark:text-blue-400 hover:bg-[#4A5D4E]/20 dark:hover:bg-blue-900/50' 
                      : 'text-stone-300 dark:text-slate-600 group-hover:text-stone-500 dark:group-hover:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Edit2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* State Field */}
          <div>
            <label className="block text-[10px] font-medium text-stone-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2 transition-colors">State / Union Territory</label>
            <div className="relative flex items-center w-full group">
              <select 
                name="state" value={formData.state} onChange={handleChange} disabled={!editMode.state}
                className={`w-full p-5 pr-16 rounded-2xl outline-none transition-all duration-500 font-light tracking-wide appearance-none ${
                  editMode.state 
                    ? 'bg-white dark:bg-[#282C3D] border-2 border-[#4A5D4E]/30 dark:border-blue-400/50 text-stone-800 dark:text-slate-200 shadow-[0_10px_40px_rgb(0,0,0,0.03)] cursor-pointer' 
                    : 'bg-stone-50/50 dark:bg-[#151821] border border-stone-100 dark:border-slate-700/30 text-stone-500 dark:text-slate-400 cursor-not-allowed hover:bg-stone-50 dark:hover:bg-[#1A1D27]'
                }`}
              >
                <option value="" disabled>Select State</option>
                {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
              <button 
                type="button" 
                onClick={() => toggleEdit('state')} 
                className={`absolute right-4 p-2.5 rounded-xl transition-all duration-300 ${
                  editMode.state 
                    ? 'bg-[#4A5D4E]/10 dark:bg-blue-900/30 text-[#4A5D4E] dark:text-blue-400 hover:bg-[#4A5D4E]/20 dark:hover:bg-blue-900/50' 
                    : 'text-stone-300 dark:text-slate-600 group-hover:text-stone-500 dark:group-hover:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700'
                }`}
              >
                <Edit2 size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Exams Tag System */}
          <div className="pt-4">
            <label className="flex items-center space-x-3 text-[10px] font-medium text-stone-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2 transition-colors">
              <Target size={14} strokeWidth={1.5} />
              <span>Target Exams</span>
            </label>
            
            <div className={`relative p-6 pr-16 rounded-[2rem] transition-all duration-500 group ${
              editMode.exams 
                ? 'bg-white dark:bg-[#282C3D] border-2 border-[#4A5D4E]/30 dark:border-blue-400/50 shadow-[0_10px_40px_rgb(0,0,0,0.03)]' 
                : 'bg-stone-50/50 dark:bg-[#151821] border border-stone-100 dark:border-slate-700/30'
            }`}>
              <div className={`flex flex-wrap gap-3 transition-opacity duration-500 ${!editMode.exams && 'opacity-60 grayscale-[30%] dark:opacity-40'}`}>
                {PRESET_EXAMS.map(exam => {
                  const isSelected = formData.exams.includes(exam);
                  return (
                    <button
                      key={exam}
                      type="button"
                      onClick={() => toggleExam(exam)}
                      className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-light tracking-wide transition-all duration-300 border ${
                        isSelected 
                          ? 'border-[#4A5D4E] dark:border-blue-500 bg-[#4A5D4E] dark:bg-blue-500 text-white shadow-sm' 
                          : 'border-stone-200 dark:border-slate-600 bg-white dark:bg-[#282C3D] text-stone-500 dark:text-slate-300'
                      } ${editMode.exams && !isSelected ? 'hover:border-stone-300 dark:hover:border-slate-500 hover:text-stone-700 dark:hover:text-slate-100 cursor-pointer' : !editMode.exams ? 'cursor-not-allowed' : ''}`}
                    >
                      {exam}
                    </button>
                  );
                })}
              </div>
              
              <button 
                type="button" 
                onClick={() => toggleEdit('exams')} 
                className={`absolute top-5 right-4 p-2.5 rounded-xl transition-all duration-300 ${
                  editMode.exams 
                    ? 'bg-[#4A5D4E]/10 dark:bg-blue-900/30 text-[#4A5D4E] dark:text-blue-400 hover:bg-[#4A5D4E]/20 dark:hover:bg-blue-900/50' 
                    : 'text-stone-300 dark:text-slate-600 group-hover:text-stone-500 dark:group-hover:text-slate-400 hover:bg-stone-200 dark:hover:bg-slate-700'
                }`}
              >
                <Edit2 size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

         {/* Responsive Footer Actions - Added pb-12 and mb-8 for maximum bottom clearance */}
          <div className="pt-12 mt-8 pb-12 sm:pb-0 mb-8 sm:mb-0 flex flex-col sm:flex-row items-center justify-between border-t border-stone-100 dark:border-slate-800 gap-6 sm:gap-0 transition-colors">
            
            <Link 
              href="/dashboard"
              className="flex items-center justify-center space-x-2 px-6 py-4 text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-2xl transition-all duration-300 font-light tracking-wide text-sm w-full sm:w-auto"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex flex-col-reverse sm:flex-row items-center w-full sm:w-auto gap-4 sm:gap-4">
              <button 
                type="button" 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center justify-center space-x-2 px-6 py-4 text-stone-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-300 font-light tracking-wide text-sm w-full sm:w-auto"
              >
                <LogOut size={18} strokeWidth={1.5} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
              
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center justify-center space-x-2 bg-[#4A5D4E] dark:bg-blue-500 text-white px-10 py-4 rounded-2xl hover:bg-[#3E4F42] dark:hover:bg-blue-600 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-500 disabled:opacity-50 font-light tracking-wide text-sm w-full sm:w-auto"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={1.5} />}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}