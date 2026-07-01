"use client";

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, BookOpen, Settings } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 font-sans flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-100 p-6 flex flex-col justify-between border-r border-stone-800">
        <div>
          <div className="mb-10 px-2">
            <h1 className="font-serif font-bold text-2xl tracking-tight text-white">KapiKitab.</h1>
            <span className="text-xs text-emerald-400 font-medium tracking-widest uppercase block mt-1">CMS Engine</span>
          </div>
          
          <nav className="space-y-2">
            <Link href="/admin" className="flex items-center space-x-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white font-medium">
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </Link>
            <Link href="/admin/chapter/new" className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-stone-400 hover:text-white">
              <PlusCircle size={18} />
              <span>New Chapter</span>
            </Link>
            <Link href="/dashboard/lesson" className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-stone-400 hover:text-white pt-8 border-t border-white/5">
              <BookOpen size={18} />
              <span>Student Map</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3 px-2 text-stone-500 text-xs font-light">
          <Settings size={14} />
          <span>v1.0.0 • Connected to Atlas</span>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto max-w-5xl">
        {children}
      </main>

    </div>
  );
}