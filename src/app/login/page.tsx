"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8] px-4">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-stone-100">
        
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
            <Sparkles size={24} />
          </div>
        </div>
        
        <h1 className="text-3xl font-serif text-center text-stone-900 mb-2 tracking-tight">Welcome back</h1>
        <p className="text-center text-stone-500 font-light mb-8">Continue your journey in KapiKitab</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center border border-red-100">{error}</div>}

        <button 
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-stone-100 p-3.5 rounded-2xl text-stone-700 font-medium hover:bg-stone-50 transition-colors mb-6 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
          <span>Log in with Google</span>
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-stone-200"></div>
          <span className="px-4 text-stone-400 text-sm bg-white">or</span>
          <div className="flex-grow border-t border-stone-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-stone-50 border border-stone-200 px-4 py-3.5 rounded-2xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-stone-800" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-stone-50 border border-stone-200 px-4 py-3.5 rounded-2xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-stone-800" />
          
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3.5 rounded-2xl transition-colors mt-2 shadow-md disabled:opacity-70">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-center text-stone-500 text-sm mt-8">
          Don't have an account? <Link href="/signup" className="text-emerald-600 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}