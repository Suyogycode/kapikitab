"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, LogOut, Menu, X } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Removed obsolete routes to prevent 404s and clean up the UI
  const navItems = [
    { name: 'Curriculum Hub', href: '/admin', icon: LayoutDashboard },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex text-stone-800 font-sans">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-stone-900 text-white z-50 flex items-center justify-between px-4 shadow-sm">
        <span className="font-serif font-bold text-xl tracking-tight">Kapikitab Admin</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR (Desktop & Mobile) - Fixed height and scroll issues */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-stone-900 text-stone-300 z-40 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none overflow-y-auto
        ${isMobileMenuOpen ? 'translate-x-0 pt-16' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 hidden lg:block border-b border-white/5 shrink-0">
          <span className="font-serif font-bold text-2xl tracking-tight text-white">Kapikitab.</span>
          <p className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase mt-1">Command Center</p>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'hover:bg-white/5 hover:text-white'
                }`}>
                  <Icon size={18} />
                  <span className="text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button 
            onClick={() => signOut({ callbackUrl: '/signup' })}
            className="flex items-center space-x-3 px-4 py-3.5 w-full text-left rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut size={18} />
            <span>Secure Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0 min-h-screen">
        <div className="flex-1 p-4 sm:p-8 lg:p-12">
          {children}
        </div>
      </main>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}