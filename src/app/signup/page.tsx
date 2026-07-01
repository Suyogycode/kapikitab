"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignup = () => {
    signIn('google', { callbackUrl: '/set-profile' });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        const signInRes = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (signInRes?.error) {
          setError(signInRes.error);
        } else {
          router.push('/set-profile');
        }
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Recreated the soft, elegant gradient background from your screenshot
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-[#FDFCF8] to-[#FDFCF8] relative px-4">
      
      {/* Floating Back Button */}
      <Link href="/" className="absolute top-8 left-8 md:top-12 md:left-12 h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-100 text-stone-600 hover:scale-105 transition-transform">
        <ArrowLeft size={20} />
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-white p-10 md:p-12 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-stone-900 mb-2">Begin your journey</h1>
          <p className="text-stone-500 font-light text-sm">Take a deep breath. Your quiet space to learn awaits.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center border border-red-100">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleSignup}
          type="button"
          className="w-full flex items-center justify-center space-x-3 bg-white border border-stone-200 text-stone-700 py-3.5 rounded-2xl hover:bg-stone-50 transition-colors font-medium mb-6 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-stone-100"></div>
          <span className="flex-shrink-0 mx-4 text-stone-400 text-xs font-light tracking-widest">or simply</span>
          <div className="flex-grow border-t border-stone-100"></div>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-3">
          <input 
            type="text" 
            placeholder="Your full name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-stone-50/50 border border-stone-200 text-stone-800 rounded-2xl py-3.5 px-5 focus:outline-none focus:border-stone-400 transition-all placeholder:text-stone-400 font-light"
          />
          
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-stone-50/50 border border-stone-200 text-stone-800 rounded-2xl py-3.5 pl-12 pr-5 focus:outline-none focus:border-stone-400 transition-all placeholder:text-stone-400 font-light"
            />
          </div>

          <input 
            type="password" 
            placeholder="Create a password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-stone-50/50 border border-stone-200 text-stone-800 rounded-2xl py-3.5 px-5 focus:outline-none focus:border-stone-400 transition-all placeholder:text-stone-400 font-light"
          />

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#232323] hover:bg-black text-white py-4 rounded-2xl font-medium transition-colors mt-4 disabled:opacity-70"
          >
            {isLoading ? 'Creating space...' : 'Continue securely'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-8 font-light">
          Already have an account? <Link href="/login" className="text-stone-900 font-medium hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}