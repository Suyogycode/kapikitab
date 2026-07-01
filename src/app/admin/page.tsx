"use client";

import React from 'react';
import { BookOpen, Video, FileText, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  // Static metrics for placeholder setup
  const metrics = [
    { title: "Total Chapters", value: "8", icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
    { title: "Hosted Videos", value: "14", icon: Video, color: "bg-amber-50 text-amber-600" },
    { title: "R2 Resources", value: "29", icon: FileText, color: "bg-blue-50 text-blue-600" },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-serif font-medium text-stone-900">Curriculum Center</h2>
          <p className="text-stone-500 font-light mt-1">Manage your subjects, modules, and multimedia pipelines.</p>
        </div>
        <Link href="/admin/chapter/new">
          <button className="bg-stone-900 hover:bg-black text-white px-6 py-3 rounded-full font-medium shadow-sm transition-colors">
            Create Chapter
          </button>
        </Link>
      </div>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white border border-stone-200 p-6 rounded-3xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <div>
              <p className="text-stone-400 text-sm font-light uppercase tracking-wider">{m.title}</p>
              <h3 className="text-3xl font-serif font-bold text-stone-800 mt-2">{m.value}</h3>
            </div>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${m.color}`}>
              <m.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* RECENT UPLOADS / SYNC STATUS */}
      <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 size={20} className="text-stone-400" />
          <h3 className="text-xl font-medium text-stone-800">Connected Microservices</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-stone-100">
            <span className="font-medium">Cloudflare R2 Bucket</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Active (Free Tier)</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-stone-100">
            <span className="font-medium">Bunny Stream CDN</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Prepaid Active</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="font-medium">MongoDB Atlas Cluster</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}