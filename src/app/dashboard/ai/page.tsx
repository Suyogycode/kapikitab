"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Paperclip, X } from 'lucide-react';
import Image from 'next/image';

type Message = {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  image?: string; 
};

// --- REFINED KAPI AVATAR ---
const KapiAvatar = ({ isTyping = false, className = "w-8 h-8" }: { isTyping?: boolean, className?: string }) => (
  <motion.svg 
    viewBox="0 0 200 200" 
    // Added the specific emissive glow for dark mode to keep Kapi visible and premium
    className={`drop-shadow-sm dark:drop-shadow-[0_0_12px_rgba(96,165,250,0.4)] transition-all duration-500 ${className}`}
  >
    <rect x="40" y="60" width="120" height="100" rx="35" fill="#4A5D4E" /> 
    <rect x="55" y="80" width="90" height="60" rx="18" fill="#FDFCF8" />
    
    <motion.circle cx="75" cy="110" r="7" fill="#53594D" 
      animate={isTyping ? { scaleY: [1, 0.2, 1] } : { scaleY: 1 }} 
      transition={{ duration: 0.4, repeat: isTyping ? Infinity : 0, repeatDelay: 0.8 }}
    />
    <motion.circle cx="125" cy="110" r="7" fill="#53594D" 
      animate={isTyping ? { scaleY: [1, 0.2, 1] } : { scaleY: 1 }} 
      transition={{ duration: 0.4, repeat: isTyping ? Infinity : 0, repeatDelay: 0.8 }}
    />
    
    <rect x="60" y="95" width="30" height="30" rx="10" fill="none" stroke="#8A795D" strokeWidth="3" />
    <rect x="110" y="95" width="30" height="30" rx="10" fill="none" stroke="#8A795D" strokeWidth="3" />
    <line x1="90" y1="110" x2="110" y2="110" stroke="#8A795D" strokeWidth="3" />
    <line x1="100" y1="60" x2="100" y2="35" stroke="#4A5D4E" strokeWidth="5" strokeLinecap="round" />
    <circle cx="100" cy="30" r="7" fill="#8A795D" />
  </motion.svg>
);

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hello. I'm Kapi, your personal tutor.\n\nYou can ask me questions, explore complex topics, or upload images of your math problems, and we will untangle them together."
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, selectedImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setMimeType(file.type);
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !selectedImage) return;

    const newUserMsg: Message = { 
      id: Date.now(), 
      sender: 'user', 
      text: inputValue,
      image: selectedImage || undefined 
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    const currentInput = inputValue;
    const currentImage = selectedImage;
    const currentMimeType = mimeType;
    
    setInputValue("");
    setSelectedImage(null);
    setMimeType(null);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentInput,
          imageBase64: currentImage,
          mimeType: currentMimeType,
          threadId: "global"
        }),
      });

      if (!res.ok) throw new Error("API Network error");
      
      const data = await res.json();
      const newAiMsg: Message = { id: Date.now() + 1, sender: 'ai', text: data.text };
      setMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { id: Date.now() + 1, sender: 'ai', text: "I'm having a little trouble connecting to my neural net. Can we try that again?" };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const canSend = (inputValue.trim() || selectedImage) && !isTyping;

  return (
    <div className="h-full w-full flex flex-col relative bg-[#FDFCF8] dark:bg-[#1C1F2B] transition-colors duration-500">
      
      <div className="flex-1 overflow-y-auto no-scrollbar w-full pt-12 pb-48">
        <div className="max-w-2xl mx-auto flex flex-col space-y-12 px-6 sm:px-8">
          <AnimatePresence>
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full flex gap-5 sm:gap-6 group"
                >
                  <div className="shrink-0 pt-0.5">
                    {isAi ? (
                      <KapiAvatar className="w-8 h-8 sm:w-9 sm:h-9" />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#282C3D] border border-stone-200 dark:border-slate-700/50 flex items-center justify-center text-stone-400 dark:text-slate-400 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-colors">
                        <User size={16} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="font-serif font-medium text-[13px] sm:text-sm text-stone-800 dark:text-slate-200 tracking-wide transition-colors">
                      {isAi ? 'Kapi' : 'You'}
                    </div>
                    
                    {msg.image && (
                      <div className="relative w-48 h-48 sm:w-64 sm:h-64 mt-3 mb-4 rounded-2xl overflow-hidden border border-stone-100 dark:border-slate-700/50 shadow-sm transition-colors">
                        <Image src={msg.image} alt="Uploaded reference" fill className="object-cover" />
                      </div>
                    )}
                    
                    <p className="text-[15px] sm:text-base text-stone-600 dark:text-slate-300 leading-relaxed sm:leading-[1.8] font-light whitespace-pre-wrap tracking-wide transition-colors">
                      {msg.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex gap-5 sm:gap-6">
              <div className="shrink-0 pt-0.5">
                <KapiAvatar isTyping={true} className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="font-serif font-medium text-[13px] sm:text-sm text-stone-800 dark:text-slate-200 tracking-wide transition-colors">Kapi</div>
                <div className="flex items-center space-x-1.5 h-7">
                  <motion.div animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-[#8A795D] dark:bg-blue-400/80 rounded-full" />
                  <motion.div animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-[#8A795D] dark:bg-blue-400/80 rounded-full" />
                  <motion.div animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-[#8A795D] dark:bg-blue-400/80 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} className="h-4" /> 
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-[#FDFCF8] dark:from-[#1C1F2B] via-[#FDFCF8]/95 dark:via-[#1C1F2B]/95 to-transparent pt-16 pb-8 px-4 sm:px-8 pointer-events-none flex flex-col items-center z-20 transition-colors duration-500">
        
        <div className="w-full max-w-2xl pointer-events-auto relative">
          
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-full mb-4 left-0 bg-white dark:bg-[#282C3D] p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-stone-100 dark:border-slate-700/50 z-30 transition-colors"
              >
                <button 
                  onClick={() => { setSelectedImage(null); setMimeType(null); }}
                  className="absolute -top-2 -right-2 bg-stone-800 dark:bg-slate-700 text-white p-1 rounded-full hover:scale-105 transition-transform shadow-md"
                >
                  <X size={12} strokeWidth={2} />
                </button>
                <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                  <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form 
            onSubmit={handleSend}
            className="w-full bg-[#FCFBFA] dark:bg-[#282C3D] border border-stone-200/60 dark:border-slate-700/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-[2rem] p-1.5 sm:p-2 flex items-center transition-all duration-300 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus-within:border-stone-300/50 dark:focus-within:border-blue-500/30"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 sm:p-3.5 rounded-full text-stone-400 dark:text-slate-400 hover:text-stone-600 dark:hover:text-slate-200 hover:bg-stone-100/50 dark:hover:bg-slate-700/50 transition-colors shrink-0"
            >
              <Paperclip size={18} strokeWidth={1.5} />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message Kapi..."
              className="flex-1 bg-transparent text-stone-700 dark:text-slate-200 px-3 sm:px-4 py-3 sm:py-3.5 focus:outline-none placeholder:text-stone-300 dark:placeholder:text-slate-500 text-[15px] sm:text-[15px] font-light tracking-wide transition-colors"
              autoComplete="off"
            />
            
            <button
              type="submit"
              disabled={!canSend}
              className={`p-3 sm:p-3.5 rounded-full shrink-0 transition-all duration-300 ${
                canSend 
                  ? 'bg-[#4A5D4E] dark:bg-blue-500 text-white shadow-sm hover:bg-[#3E4F42] dark:hover:bg-blue-600 hover:-translate-y-0.5' 
                  : 'bg-stone-100/50 dark:bg-slate-800/50 text-stone-300 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send size={16} strokeWidth={1.5} className={canSend ? "translate-x-0.5 -translate-y-0.5" : ""} />
            </button>
          </form>
          
          <div className="text-center mt-4">
            <span className="text-[10px] text-stone-400/80 dark:text-slate-500 font-light tracking-[0.05em] transition-colors">
              Kapi can make mistakes. Please verify important information.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}