"use client";

import React from 'react';
import { Settings, Shield, Key, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 mb-3">Platform Settings</h1>
        <p className="text-stone-500 font-light text-base max-w-2xl">
          Manage your platform configurations, API keys, and administrative access here.
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 mb-6">
          <Settings size={28} className="animate-[spin_4s_linear_infinite]" />
        </div>
        <h3 className="text-xl font-serif text-stone-800 mb-2">Settings Hub Coming Soon</h3>
        <p className="text-stone-400 font-light text-sm max-w-md mx-auto leading-relaxed">
          This area will eventually house your Cloudflare R2 bucket keys, Bunny Stream API configurations, and admin password reset protocols. 
        </p>
      </div>
    </div>
  );
}