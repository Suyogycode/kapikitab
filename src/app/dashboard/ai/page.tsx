"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Paperclip, X } from 'lucide-react';
import Image from 'next/image';

type Message = {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  image?: string; // Base64 string for displaying uploaded images
};

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
  
  // File Upload State
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

  // Handle file selection and convert to Base64
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
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !selectedImage) return;

    // 1. Render User Message immediately
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
    
    // Reset inputs
    setInputValue("");
    setSelectedImage(null);
    setMimeType(null);
    setIsTyping(true);

    // 2. Call the Gemini API Route
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentInput,
          imageBase64: currentImage,
          mimeType: currentMimeType,
          threadId: "global" // <--- This connects it to the master Dashboard memory room
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

  return (
    <div className="h-full w-full flex flex-col relative max-w-4xl mx-auto">
      
      {/* --- SCROLLABLE CHAT AREA --- */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 lg:px-8 pt-8 pb-40 space-y-8">
        
        <AnimatePresence>
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex max-w-[85%] md:max-w-[70%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                  
                  <div className={`shrink-0 flex items-center justify-center h-10 w-10 rounded-full shadow-sm mt-auto mb-2 ${
                    isAi ? 'bg-emerald-100 border border-emerald-200 mr-4' : 'bg-stone-200 border border-stone-300 ml-4'
                  }`}>
                    {isAi ? <Sparkles size={18} className="text-emerald-700" /> : <User size={18} className="text-stone-600" />}
                  </div>

                  <div className={`p-5 rounded-3xl shadow-sm flex flex-col ${
                    isAi 
                      ? 'bg-white border border-stone-100 text-stone-800 rounded-bl-sm' 
                      : 'bg-stone-900 text-white rounded-br-sm'
                  }`}>
                    {/* Render User Uploaded Image if it exists */}
                    {msg.image && (
                      <div className="relative w-48 h-48 mb-3 rounded-xl overflow-hidden border border-white/20">
                        <Image src={msg.image} alt="Uploaded reference" fill className="object-cover" />
                      </div>
                    )}
                    
                    <p className="text-[15px] leading-relaxed font-light whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
            <div className="flex flex-row max-w-[85%]">
              <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 border border-emerald-200 mr-4 mt-auto mb-2">
                <Sparkles size={18} className="text-emerald-700" />
              </div>
              <div className="bg-white border border-stone-100 p-5 rounded-3xl rounded-bl-sm shadow-sm flex items-center justify-center space-x-1">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-emerald-300 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-emerald-300 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-emerald-300 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} /> 
      </div>

      {/* --- FLOATING INPUT AREA --- */}
      <div className="absolute bottom-6 left-0 w-full px-4 lg:px-8 pointer-events-none flex flex-col items-center">
        
        {/* Image Preview Thumbnail (Appears when file is selected) */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="pointer-events-auto mb-4 relative bg-white p-2 rounded-2xl shadow-xl border border-stone-200 self-start ml-4"
            >
              <button 
                onClick={() => { setSelectedImage(null); setMimeType(null); }}
                className="absolute -top-2 -right-2 bg-stone-800 text-white p-1 rounded-full hover:scale-110 transition-transform z-10"
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
          className="pointer-events-auto w-full bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-2 rounded-[2.5rem] flex items-center relative overflow-hidden"
        >
          {/* Hidden File Input */}
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
            className="h-12 w-12 rounded-full flex items-center justify-center text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors ml-1 shrink-0"
          >
            <Paperclip size={22} />
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Kapi or upload an image..."
            className="flex-1 bg-transparent text-stone-800 px-4 py-3 focus:outline-none placeholder:text-stone-400 text-[15px]"
            autoComplete="off"
          />
          
          <button
            type="submit"
            disabled={(!inputValue.trim() && !selectedImage) || isTyping}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
              (inputValue.trim() || selectedImage) && !isTyping 
                ? 'bg-emerald-600 text-white shadow-md hover:scale-105 hover:bg-emerald-700' 
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Send size={20} className={(inputValue.trim() || selectedImage) && !isTyping ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}