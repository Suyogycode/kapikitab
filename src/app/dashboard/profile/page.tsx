"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, Save, Loader2, ShieldCheck, Target, Edit2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Map backend keys to human-readable labels for the success alert
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
  
  // Track original data to compare changes
  const [originalData, setOriginalData] = useState({
    name: '', state: '', class: '', board: '', exams: [] as string[]
  });
  
  const [formData, setFormData] = useState({
    name: '', state: '', class: '', board: '', exams: [] as string[]
  });

  // Track which fields are currently unlocked for editing
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
    setAlertMessage(null); // Clear alerts when typing
  };

  const toggleExam = (examName: string) => {
    if (!editMode.exams) return; // Prevent clicks if locked
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

    // 1. Calculate what actually changed
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
        // Sync original data to the new saved state
        setOriginalData(formData);
        
        // Lock all fields again
        setEditMode({ name: false, state: false, class: false, board: false, exams: false });
        
        // Show dynamic success message
        setAlertMessage({ type: 'success', text: `Successfully updated: ${changedFields.join(', ')}` });

        // If the class changed, update the NextAuth layout token
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
      <div className="w-full h-[70vh] flex flex-col items-center justify-center text-stone-800">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <h2 className="font-serif text-xl font-medium">Loading Profile...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 w-full pb-32 sm:pb-40">
      <div className="flex items-center space-x-4 mb-10 mt-4">
        <div className="h-16 w-16 bg-stone-200 text-stone-600 rounded-2xl flex items-center justify-center shadow-sm">
          <User size={32} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-stone-900">Account Profile</h1>
          <p className="text-stone-500 font-light text-sm">Manage your personal data and curriculum settings.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8 bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-stone-200">
        
        {/* Dynamic Alert Banner */}
        <AnimatePresence>
          {alertMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: 'auto' }} 
              exit={{ opacity: 0, y: -10, height: 0 }}
              className={`flex items-center space-x-3 p-4 rounded-xl text-sm font-medium border ${
                alertMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              {alertMessage.type === 'success' && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
              <span>{alertMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Read-Only Email Field */}
        <div>
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Email Address</label>
          <div className="flex items-center space-x-3 w-full bg-stone-50 border border-stone-100 text-stone-500 p-4 rounded-xl cursor-not-allowed">
            <ShieldCheck size={18} />
            <span className="font-mono text-sm">{session?.user?.email}</span>
          </div>
        </div>

        {/* Name Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Full Name</label>
            <button type="button" onClick={() => toggleEdit('name')} className={`p-1.5 rounded-md transition-colors ${editMode.name ? 'bg-emerald-100 text-emerald-700' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'}`}>
              <Edit2 size={14} />
            </button>
          </div>
          <input 
            type="text" name="name" value={formData.name} onChange={handleChange} disabled={!editMode.name}
            className={`w-full p-4 rounded-xl outline-none transition-all ${
              editMode.name 
                ? 'bg-white border-2 border-emerald-400 text-stone-900 focus:ring-4 focus:ring-emerald-50' 
                : 'bg-stone-50 border border-stone-100 text-stone-500 cursor-not-allowed'
            }`}
          />
        </div>

        {/* Class & Board Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Class</label>
              <button type="button" onClick={() => toggleEdit('class')} className={`p-1.5 rounded-md transition-colors ${editMode.class ? 'bg-emerald-100 text-emerald-700' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'}`}>
                <Edit2 size={14} />
              </button>
            </div>
            <select 
              name="class" value={formData.class} onChange={handleChange} disabled={!editMode.class}
              className={`w-full p-4 rounded-xl outline-none transition-all appearance-none ${
                editMode.class 
                  ? 'bg-white border-2 border-emerald-400 text-stone-900 focus:ring-4 focus:ring-emerald-50 cursor-pointer' 
                  : 'bg-stone-50 border border-stone-100 text-stone-500 cursor-not-allowed'
              }`}
            >
              <option value="" disabled>Select Class</option>
              {['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Board</label>
              <button type="button" onClick={() => toggleEdit('board')} className={`p-1.5 rounded-md transition-colors ${editMode.board ? 'bg-emerald-100 text-emerald-700' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'}`}>
                <Edit2 size={14} />
              </button>
            </div>
            <select 
              name="board" value={formData.board} onChange={handleChange} disabled={!editMode.board}
              className={`w-full p-4 rounded-xl outline-none transition-all appearance-none ${
                editMode.board 
                  ? 'bg-white border-2 border-emerald-400 text-stone-900 focus:ring-4 focus:ring-emerald-50 cursor-pointer' 
                  : 'bg-stone-50 border border-stone-100 text-stone-500 cursor-not-allowed'
              }`}
            >
              <option value="" disabled>Select Board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
            </select>
          </div>
        </div>

        {/* State Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">State / Union Territory</label>
            <button type="button" onClick={() => toggleEdit('state')} className={`p-1.5 rounded-md transition-colors ${editMode.state ? 'bg-emerald-100 text-emerald-700' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'}`}>
              <Edit2 size={14} />
            </button>
          </div>
          <select 
            name="state" value={formData.state} onChange={handleChange} disabled={!editMode.state}
            className={`w-full p-4 rounded-xl outline-none transition-all appearance-none ${
              editMode.state 
                ? 'bg-white border-2 border-emerald-400 text-stone-900 focus:ring-4 focus:ring-emerald-50 cursor-pointer' 
                : 'bg-stone-50 border border-stone-100 text-stone-500 cursor-not-allowed'
            }`}
          >
            <option value="" disabled>Select State</option>
            {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>

        {/* Exams Tag System */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center space-x-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
              <Target size={14} />
              <span>Target Exams</span>
            </label>
            <button type="button" onClick={() => toggleEdit('exams')} className={`p-1.5 rounded-md transition-colors ${editMode.exams ? 'bg-emerald-100 text-emerald-700' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'}`}>
              <Edit2 size={14} />
            </button>
          </div>
          <div className={`flex flex-wrap gap-2 sm:gap-3 transition-opacity duration-300 ${!editMode.exams && 'opacity-60 grayscale-[30%]'}`}>
            {PRESET_EXAMS.map(exam => {
              const isSelected = formData.exams.includes(exam);
              return (
                <button
                  key={exam}
                  type="button"
                  onClick={() => toggleExam(exam)}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border-2 ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm' 
                      : 'border-stone-100 bg-stone-50 text-stone-500'
                  } ${editMode.exams && !isSelected ? 'hover:border-stone-300 hover:text-stone-700 cursor-pointer' : !editMode.exams ? 'cursor-not-allowed' : ''}`}
                >
                  {exam}
                </button>
              );
            })}
          </div>
        </div>

       {/* Responsive Footer Actions */}
        <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between border-t border-stone-100 gap-4 sm:gap-0">
          <button 
            type="button" 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm w-full sm:w-auto"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
          
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center justify-center space-x-2 bg-stone-900 text-white px-8 py-4 sm:py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-50 font-medium w-full sm:w-auto"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}