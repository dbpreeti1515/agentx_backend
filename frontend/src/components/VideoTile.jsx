import React, { useEffect, useRef } from "react";
import { User, MicOff } from "lucide-react";

export function VideoTile({ peer, stream, label, isLocal = false, isMuted = false }) {
  const videoRef = useRef();
  const videoTracks = stream?.getVideoTracks?.() || [];
  const hasEnabledVideo = videoTracks.some(
    (track) => track.enabled && track.readyState === "live"
  );
  const showFallback = !stream || !hasEnabledVideo;
  const normalizedLabel =
    isLocal && (label || "").toLowerCase().includes("you")
      ? label
      : `${label || "Participant"}${isLocal ? " (You)" : ""}`;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      const playPromise = videoRef.current.play?.();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl group">
      {/* Video Content */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || isMuted}
        onLoadedMetadata={() => {
          const playPromise = videoRef.current?.play?.();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        }}
        className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''} ${
          showFallback ? "opacity-0" : "opacity-100"
        }`}
      />
      
      {/* Fallback avatar for camera-off/no-video */}
      {showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
           <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 border border-white/5 shadow-inner">
             <User size={40} />
           </div>
        </div>
      )}

      {/* Overlay Labels */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/10">
            {normalizedLabel}
          </div>
        </div>
        
        {isMuted && (
          <div className="p-2 bg-red-500 rounded-xl shadow-lg border border-red-400">
            <MicOff size={14} className="text-white" />
          </div>
        )}
      </div>

      {/* Active Speaker Border (Simulated) */}
      <div className="absolute inset-0 border-2 border-indigo-500/0 group-hover:border-indigo-500/30 rounded-3xl transition-all" />
    </div>
  );
}
