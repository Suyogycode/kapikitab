"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Sparkles, Loader2, Volume2, VolumeX, ChevronDown, ChevronUp, RefreshCw, AlertCircle, Languages } from 'lucide-react';

type Language = 'hinglish' | 'english';
type DialogueItem = { speaker: 'A' | 'B'; text: string; };

interface AudioOverviewPlayerProps {
  chapterId: string;
  chapterTitle: string;
}

export default function AudioOverviewPlayer({ chapterId, chapterTitle }: AudioOverviewPlayerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('hinglish');
  
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const [script, setScript] = useState<DialogueItem[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => playlist.forEach(url => URL.revokeObjectURL(url));
  }, [playlist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    const handleEnded = () => {
      if (currentTrackIndex < playlist.length - 1) {
        const nextIndex = currentTrackIndex + 1;
        setCurrentTrackIndex(nextIndex);
        setAudioUrl(playlist[nextIndex]);
        setTimeout(() => audioRef.current?.play().catch(console.error), 50);
      } else {
        setIsPlaying(false);
        setCurrentTrackIndex(0);
        setAudioUrl(playlist[0]);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, currentTrackIndex, playlist]);

  const handleGenerateOverview = async () => {
    setError(null);
    setIsGeneratingScript(true);
    setIsPlaying(false);

    try {
      const scriptRes = await fetch('/api/ai/podcast/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, language: selectedLanguage }),
      });

      if (!scriptRes.ok) throw new Error('Failed to generate dialogue script.');

      const scriptData = await scriptRes.json();
      const generatedScript: DialogueItem[] = scriptData.script || [];
      if (generatedScript.length === 0) throw new Error('Received empty script.');

      setScript(generatedScript);
      setShowTranscript(true);
      setIsGeneratingScript(false);
      setIsSynthesizingAudio(true);

      const audioRes = await fetch('/api/ai/podcast/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: generatedScript, language: selectedLanguage }),
      });

      if (!audioRes.ok) throw new Error('Failed to synthesize audio stream.');
      const audioData = await audioRes.json();

      const newPlaylist = audioData.audio.map((base64Str: string) => {
        const binaryString = atob(base64Str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        return URL.createObjectURL(blob);
      });

      setPlaylist(newPlaylist);
      setCurrentTrackIndex(0);
      setAudioUrl(newPlaylist[0]);
      setIsSynthesizingAudio(false);

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }, 300);

    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.');
      setIsGeneratingScript(false);
      setIsSynthesizingAudio(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isProcessing = isGeneratingScript || isSynthesizingAudio;

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <audio ref={audioRef} src={audioUrl || undefined} />

      <div className="bg-[#FAF9F6] dark:bg-[#282C3D] border border-stone-200 dark:border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-colors duration-500">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-stone-200/60 dark:border-slate-700/50 transition-colors">
          <div>
            <h3 className="font-serif text-2xl text-stone-800 dark:text-slate-100 tracking-wide mb-1 transition-colors">Audio Overview</h3>
            <p className="text-sm text-stone-500 dark:text-slate-400 font-light transition-colors">{chapterTitle}</p>
          </div>

          <div className="flex items-center bg-stone-100/50 dark:bg-[#151821] p-1 rounded-xl self-start sm:self-auto border border-stone-200/50 dark:border-slate-700/50 transition-colors">
            <button onClick={() => setSelectedLanguage('hinglish')} disabled={isProcessing} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${selectedLanguage === 'hinglish' ? 'bg-white dark:bg-[#282C3D] text-stone-800 dark:text-slate-200 shadow-sm' : 'text-stone-400 dark:text-slate-500 hover:text-stone-600 dark:hover:text-slate-300'}`}>
              <Languages size={14} className={selectedLanguage === 'hinglish' ? 'text-amber-600 dark:text-amber-500' : ''} /> <span>Hinglish</span>
            </button>
            <button onClick={() => setSelectedLanguage('english')} disabled={isProcessing} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${selectedLanguage === 'english' ? 'bg-white dark:bg-[#282C3D] text-stone-800 dark:text-slate-200 shadow-sm' : 'text-stone-400 dark:text-slate-500 hover:text-stone-600 dark:hover:text-slate-300'}`}>
              <Languages size={14} className={selectedLanguage === 'english' ? 'text-amber-600 dark:text-amber-500' : ''} /> <span>English</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl flex items-center gap-3 text-sm text-red-800 dark:text-red-300 font-light transition-colors">
            <AlertCircle size={18} className="shrink-0 text-red-400" /><span>{error}</span>
          </div>
        )}

        {!audioUrl && !isProcessing ? (
          <div className="py-12 flex flex-col items-center text-center">
            <p className="text-stone-500 dark:text-slate-400 font-light max-w-md mb-8 leading-relaxed transition-colors">Synthesize a natural dialogue summarizing this chapter. The audio will be generated in <span className="font-medium text-stone-700 dark:text-slate-200">{selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}</span>.</p>
            <button onClick={handleGenerateOverview} className="bg-stone-800 dark:bg-blue-600 hover:bg-stone-700 dark:hover:bg-blue-500 text-[#FAF9F6] dark:text-white px-8 py-3.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 tracking-wide shadow-md">
              <Sparkles size={16} className="text-amber-200" /><span>Generate Conversation</span>
            </button>
          </div>
        ) : isProcessing ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <Loader2 size={28} className="animate-spin text-stone-400 dark:text-slate-500 mb-4 transition-colors" />
            <h4 className="text-sm tracking-wide text-stone-600 dark:text-slate-400 font-light transition-colors">{isGeneratingScript ? 'Writing script...' : 'Synthesizing audio...'}</h4>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <button onClick={togglePlayPause} className="w-14 h-14 rounded-full bg-stone-800 dark:bg-blue-500 text-[#FAF9F6] dark:text-white flex items-center justify-center hover:bg-stone-700 dark:hover:bg-blue-400 transition-all active:scale-95 shrink-0 shadow-md">
                {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
              </button>

              <div className="flex-1 space-y-2">
                <div className="w-full h-1.5 bg-stone-200/50 dark:bg-slate-700 rounded-full overflow-hidden flex gap-0.5 transition-colors">
                   {playlist.map((_, i) => (
                      <div key={i} className={`h-full flex-1 transition-colors duration-500 rounded-full ${i < currentTrackIndex ? 'bg-stone-400 dark:bg-slate-500' : i === currentTrackIndex ? 'bg-amber-700/80 dark:bg-blue-400' : 'bg-stone-200 dark:bg-slate-700'}`} />
                   ))}
                </div>
                <div className="flex justify-between text-xs font-light text-stone-400 dark:text-slate-500 tracking-wide transition-colors">
                  <span>Part {currentTrackIndex + 1} of {playlist.length}</span>
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={toggleMute} className="p-3 rounded-full hover:bg-stone-200/50 dark:hover:bg-slate-700 text-stone-500 dark:text-slate-400 transition-colors">
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button onClick={handleGenerateOverview} className="p-3 rounded-full hover:bg-stone-200/50 dark:hover:bg-slate-700 text-stone-500 dark:text-slate-400 transition-colors"><RefreshCw size={18} /></button>
              </div>
            </div>

            {script.length > 0 && (
              <div className="pt-4 flex justify-between items-center border-t border-stone-200/60 dark:border-slate-700/50 transition-colors">
                <button onClick={() => setShowTranscript(!showTranscript)} className="flex items-center gap-2 text-sm font-light text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 transition-colors tracking-wide">
                  <span>{showTranscript ? 'Hide Transcript' : 'Read Transcript'}</span>
                  {showTranscript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {showTranscript && script.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 pt-4 border-t border-stone-200/60 dark:border-slate-700/50 max-h-72 overflow-y-auto space-y-3 pr-4 scrollbar-thin transition-colors">
              {script.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 text-sm leading-relaxed p-3.5 rounded-xl transition-all duration-500 ${
                    currentTrackIndex === idx && !isProcessing
                      ? 'bg-stone-100/80 dark:bg-[#151821] shadow-sm opacity-100' 
                      : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <span className={`font-serif text-xs font-medium px-2.5 py-1 rounded-md shrink-0 h-fit tracking-wide transition-colors ${line.speaker === 'A' ? 'bg-stone-200/80 dark:bg-[#282C3D] text-stone-700 dark:text-slate-400' : 'bg-transparent border border-stone-300 dark:border-slate-600 text-stone-500 dark:text-slate-500'}`}>
                    {line.speaker}
                  </span>
                  <p className="font-light text-stone-700 dark:text-slate-300 pt-0.5 transition-colors">{line.text}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}