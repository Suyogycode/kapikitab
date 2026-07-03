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

// --- KAPI AVATAR COMPONENT ---
// Adapted from the SetProfile page to serve as a sleek chat avatar
const KapiAvatar = ({ isTyping = false, className = "w-8 h-8" }: { isTyping?: boolean, className?: string }) => (
  <motion.svg 
    viewBox="0 0 200 200" 
    className={`drop-shadow-sm ${className}`}
  >
    <rect x="40" y="60" width="120" height="100" rx="40" fill="#0d3827" /> 
    <rect x="55" y="80" width="90" height="60" rx="20" fill="#FAF9F5" />
    
    <motion.circle cx="75" cy="110" r="8" fill="#1c1917" 
      animate={isTyping ? { scaleY: [1, 0.2, 1] } : { scaleY: 1 }} 
      transition={{ duration: 0.4, repeat: isTyping ? Infinity : 0, repeatDelay: 0.8 }}
    />
    <motion.circle cx="125" cy="110" r="8" fill="#1c1917" 
      animate={isTyping ? { scaleY: [1, 0.2, 1] } : { scaleY: 1 }} 
      transition={{ duration: 0.4, repeat: isTyping ? Infinity : 0, repeatDelay: 0.8 }}
    />
    
    <rect x="60" y="95" width="30" height="30" rx="10" fill="none" stroke="#d97706" strokeWidth="4" />
    <rect x="110" y="95" width="30" height="30" rx="10" fill="none" stroke="#d97706" strokeWidth="4" />
    <line x1="90" y1="110" x2="110" y2="110" stroke="#d97706" strokeWidth="4" />
    <line x1="100" y1="60" x2="100" y2="30" stroke="#0d3827" strokeWidth="6" strokeLinecap="round" />
    <circle cx="100" cy="25" r="8" fill="#d97706" />
  </motion.svg>
);

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm Kapi, your personal tutor. You can ask me questions or upload images of your math problems, and we will untangle them together."
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
    <div className="h-full w-full flex flex-col relative bg-[#FDFCF8]">
      
      {/* --- SCROLLABLE CHAT AREA (Document Style) --- */}
      <div className="flex-1 overflow-y-auto no-scrollbar w-full pt-8 pb-40">
        <div className="max-w-3xl mx-auto flex flex-col space-y-6 px-4 sm:px-6">
          <AnimatePresence>
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex gap-4 group"
                >
                  {/* Avatar */}
                  <div className="shrink-0 pt-1">
                    {isAi ? (
                      <KapiAvatar className="w-8 h-8 sm:w-10 sm:h-10" />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-600 shadow-sm">
                        <User size={18} />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="font-medium text-sm text-stone-900 tracking-wide">
                      {isAi ? 'Kapi' : 'You'}
                    </div>
                    
                    {msg.image && (
                      <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-4 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
                        <Image src={msg.image} alt="Uploaded reference" fill className="object-cover" />
                      </div>
                    )}
                    
                    <p className="text-[15px] sm:text-base text-stone-700 leading-relaxed font-light whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex gap-4">
              <div className="shrink-0 pt-1">
                <KapiAvatar isTyping={true} className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="font-medium text-sm text-stone-900 tracking-wide">Kapi</div>
                <div className="flex items-center space-x-1.5 h-6">
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3, ease: "easeInOut" }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} className="h-4" /> 
        </div>
      </div>

      {/* --- FLOATING COMMAND CENTER INPUT --- */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/95 to-transparent pt-12 pb-6 px-4 sm:px-8 pointer-events-none flex flex-col items-center z-20">
        
        <div className="w-full max-w-3xl pointer-events-auto relative">
          
          {/* Image Preview Thumbnail */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-full mb-4 left-0 bg-white p-2 rounded-2xl shadow-xl border border-stone-200 z-30"
              >
                <button 
                  onClick={() => { setSelectedImage(null); setMimeType(null); }}
                  className="absolute -top-2 -right-2 bg-stone-900 text-white p-1 rounded-full hover:scale-110 transition-transform shadow-md"
                >
                  <X size={14} />
                </button>
                <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                  <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form 
            onSubmit={handleSend}
            className="w-full bg-white border border-stone-200 shadow-[0_4px_30px_rgb(0,0,0,0.06)] rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 flex items-center transition-shadow focus-within:ring-2 focus-within:ring-emerald-500/20"
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
              className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors shrink-0"
            >
              <Paperclip size={20} />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message Kapi..."
              className="flex-1 bg-transparent text-stone-800 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none placeholder:text-stone-400 text-[15px] sm:text-base"
              autoComplete="off"
            />
            
            <button
              type="submit"
              disabled={!canSend}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 transition-all ${
                canSend 
                  ? 'bg-stone-900 text-white shadow-md hover:bg-stone-800' 
                  : 'bg-stone-50 text-stone-300 cursor-not-allowed'
              }`}
            >
              <Send size={18} className={canSend ? "translate-x-0.5 -translate-y-0.5" : ""} />
            </button>
          </form>
          
          <div className="text-center mt-3 mb-1 sm:mb-0">
            <span className="text-[10px] sm:text-[11px] text-stone-400 font-medium tracking-wide uppercase">
              Kapi can make mistakes. Verify important information.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}