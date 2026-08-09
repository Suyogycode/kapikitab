"use client";

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Loader2, AlertCircle, PlayCircle } from 'lucide-react';

interface HlsVideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
}

export default function HlsVideoPlayer({ src, title, poster }: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsReady(true);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network connection issue while loading video stream.");
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media decoding error encountered.");
              hls?.recoverMediaError();
              break;
            default:
              setError("Failed to load video stream.");
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support for Safari / iOS
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsReady(true);
      });
    } else {
      setError("HLS playback is not supported on this browser.");
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <div className="relative w-full aspect-video bg-stone-950 dark:bg-[#0F1117] rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-slate-800 group">
      {/* Loading overlay */}
      {!isReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/90 text-stone-300 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
          <p className="text-xs font-mono">Initializing HLS Stream...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900 text-stone-300 z-10 p-4 text-center">
          <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-sm font-medium text-stone-200">{error}</p>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        className="w-full h-full object-contain"
      />
    </div>
  );
}