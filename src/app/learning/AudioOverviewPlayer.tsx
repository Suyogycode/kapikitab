"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Sparkles, Loader2, Volume2, VolumeX, ChevronDown, ChevronUp, RefreshCw, Bot, Mic, MessageSquare, AlertCircle } from 'lucide-react';

type Engine = 'sarvam' | 'azure' | 'kokoro';
type DialogueItem = { speaker: 'A' | 'B'; text: string; };

interface AudioOverviewPlayerProps {
  chapterId: string;
  chapterTitle: string;
  sarvamCharsUsed?: number;
  sarvamLimit?: number;
}

export default function AudioOverviewPlayer({ chapterId, chapterTitle, sarvamCharsUsed = 0, sarvamLimit = 10000 }: AudioOverviewPlayerProps) {
  const [selectedEngine, setSelectedEngine] = useState<Engine>('sarvam');
  
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- NEW PLAYLIST STATE ---
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
  const isSarvamLimitReached = sarvamCharsUsed >= sarvamLimit;

  // Cleanup Blob URLs to prevent memory leaks
  useEffect(() => {
    return () => playlist.forEach(url => URL.revokeObjectURL(url));
  }, [playlist]);

  // Handle Playlist Transitions
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    // Smoothly transition to the next chunk when current finishes
    const handleEnded = () => {
      if (currentTrackIndex < playlist.length - 1) {
        const nextIndex = currentTrackIndex + 1;
        setCurrentTrackIndex(nextIndex);
        setAudioUrl(playlist[nextIndex]);
        setTimeout(() => {
          if (audioRef.current) audioRef.current.play().catch(e => console.error(e));
        }, 50);
      } else {
        setIsPlaying(false);
        setCurrentTrackIndex(0); // Reset playlist
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
        body: JSON.stringify({ chapterId, engine: selectedEngine }),
      });

      if (!scriptRes.ok) throw new Error('Failed to generate dialogue script.');

      const scriptData = await scriptRes.json();
      const generatedScript: DialogueItem[] = scriptData.script || [];
      if (generatedScript.length === 0) throw new Error('Received empty script.');

      setScript(generatedScript);
      setShowTranscript(true); // Auto-open transcript for the karaoke effect
      setIsGeneratingScript(false);
      setIsSynthesizingAudio(true);

      const audioRes = await fetch('/api/ai/podcast/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: generatedScript, engine: selectedEngine }),
      });

      if (!audioRes.ok) throw new Error(`Failed to synthesize using ${selectedEngine.toUpperCase()}`);
      
      const audioData = await audioRes.json();

      // Convert Base64 array into playable Blob URLs
      const newPlaylist = audioData.audio.map((base64Str: string) => {
        const binaryString = atob(base64Str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
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
      setError(err.message || 'Error occurred during generation.');
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
    <div className="w-full max-w-4xl mx-auto my-6">
      <audio ref={audioRef} src={audioUrl || undefined} />

      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all duration-300">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold uppercase tracking-widest mb-1.5">
              <Sparkles size={12} className="text-emerald-600" />
              <span>NotebookLM Hinglish Overview</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl text-stone-900 font-medium">2-Speaker Audio Summary</h3>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl self-start sm:self-auto">
            <button onClick={() => !isSarvamLimitReached && setSelectedEngine('sarvam')} disabled={isSarvamLimitReached || isProcessing} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${selectedEngine === 'sarvam' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500 hover:text-stone-800'}`}>
              <Mic size={12} className={selectedEngine === 'sarvam' ? 'text-emerald-600' : ''} /> <span>Sarvam</span>
            </button>
            <button onClick={() => setSelectedEngine('azure')} disabled={isProcessing} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${selectedEngine === 'azure' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500 hover:text-stone-800'}`}>
              <Bot size={12} className={selectedEngine === 'azure' ? 'text-blue-600' : ''} /> <span>Azure</span>
            </button>
            <button onClick={() => setSelectedEngine('kokoro')} disabled={isProcessing} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${selectedEngine === 'kokoro' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500 hover:text-stone-800'}`}>
              <Bot size={12} className={selectedEngine === 'kokoro' ? 'text-purple-600' : ''} /> <span>Kokoro</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-500" /><span>{error}</span>
          </div>
        )}

        {!audioUrl && !isProcessing ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3"><Sparkles size={22} /></div>
            <p className="text-sm text-stone-600 font-sans max-w-md mb-5 leading-relaxed">Synthesize a natural, 2-host Hinglish podcast summarizing this chapter using the <span className="font-semibold text-stone-800">{selectedEngine.toUpperCase()}</span> engine.</p>
            <button onClick={handleGenerateOverview} className="bg-stone-900 hover:bg-stone-800 text-white px-7 py-3 rounded-full text-sm font-medium transition-all flex items-center gap-2 shadow-md">
              <Sparkles size={16} className="text-emerald-400" /><span>Generate Audio Overview</span>
            </button>
          </div>
        ) : isProcessing ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <Loader2 size={32} className="animate-spin text-emerald-600 mb-3" />
            <h4 className="text-base font-serif text-stone-900 font-medium mb-1">{isGeneratingScript ? 'Writing Dialogue Script...' : 'Synthesizing Audio Stream...'}</h4>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button onClick={togglePlayPause} className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800 transition-transform active:scale-95 shrink-0 shadow-md">
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1.5">
                {/* Visual chunk indicator replacing standard progress bar */}
                <div className="w-full h-2 bg-stone-100 rounded-lg overflow-hidden flex">
                   {playlist.map((_, i) => (
                      <div key={i} className={`h-full flex-1 border-r border-white transition-colors duration-300 ${i < currentTrackIndex ? 'bg-emerald-300' : i === currentTrackIndex ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                   ))}
                </div>
                <div className="flex justify-between text-[11px] font-mono text-stone-400">
                  <span>Part {currentTrackIndex + 1} of {playlist.length}</span>
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
              </div>

              <button onClick={toggleMute} className="p-2.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors shrink-0">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button onClick={handleGenerateOverview} className="p-2.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors shrink-0"><RefreshCw size={18} /></button>
            </div>

            {script.length > 0 && (
              <div className="pt-2 flex justify-between items-center border-t border-stone-100">
                <button onClick={() => setShowTranscript(!showTranscript)} className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors">
                  <MessageSquare size={14} className="text-emerald-600" /><span>{showTranscript ? 'Hide Transcript' : 'View Dialogue Transcript'}</span>
                  {showTranscript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* DYNAMIC TRANSCRIPT HIGHLIGHTING */}
        <AnimatePresence>
          {showTranscript && script.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-stone-100 max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
              {script.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 text-xs leading-relaxed p-2 rounded-xl transition-all duration-300 ${
                    currentTrackIndex === idx && !isProcessing
                      ? 'bg-emerald-50/50 border border-emerald-100 shadow-sm opacity-100' 
                      : 'opacity-50 hover:opacity-80 border border-transparent'
                  }`}
                >
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 h-fit ${line.speaker === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-800'}`}>
                    Speaker {line.speaker}
                  </span>
                  <p className={`font-sans pt-0.5 ${line.speaker === 'A' ? 'text-stone-900' : 'text-stone-700'}`}>{line.text}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}