import React, { useState } from 'react';
import { Play, Pause, Film, Lock } from 'lucide-react';
import { useRoom } from '../context/RoomContext';

function extractYouTubeId(url: string): string | null {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([-\w]+)/, /^([\w-]{11})$/];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

export function Controls({ roomCode, userId, onEmit }: { roomCode: string; userId: string; onEmit: (event: string, data: unknown) => void }) {
  const { roomState, currentUser } = useRoom();
  const [videoInput, setVideoInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const canControl = currentUser?.role === 'host' || currentUser?.role === 'moderator';
  const playing = roomState?.videoState?.playing;

  const handleChangeVideo = () => {
    const videoId = extractYouTubeId(videoInput.trim());
    if (!videoId) { alert('Invalid YouTube URL or ID'); return; }
    onEmit('change_video', { roomCode, userId, videoId });
    setVideoInput(''); setShowInput(false);
  };

  if (!canControl) {
    return (
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 glass rounded-xl text-xs sm:text-sm text-gray-400">
        <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span>Playback controlled by host / moderator</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {playing ? (
          <button
            onClick={() => onEmit('pause', { roomCode, userId, currentTime: roomState?.videoState?.currentTime || 0 })}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-violet-900/30"
          >
            <Pause className="w-4 h-4" />Pause
          </button>
        ) : (
          <button
            onClick={() => onEmit('play', { roomCode, userId, currentTime: roomState?.videoState?.currentTime || 0 })}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-violet-900/30"
          >
            <Play className="w-4 h-4 fill-white" />Play
          </button>
        )}
        <button
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 glass border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs sm:text-sm font-medium transition-all"
        >
          <Film className="w-4 h-4 text-violet-400" />Change Video
        </button>
      </div>

      {showInput && (
        <div className="flex flex-col sm:flex-row gap-2 animate-fade-in w-full">
          <input
            type="text"
            value={videoInput}
            onChange={e => setVideoInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChangeVideo()}
            placeholder="Paste YouTube URL or video ID..."
            className="flex-1 px-3.5 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-all"
          />
          <div className="flex gap-2">
            <button
              onClick={handleChangeVideo}
              className="flex-1 sm:flex-initial px-4 py-2 sm:py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-md"
            >
              Load
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="px-3.5 py-2 sm:py-2.5 glass border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs sm:text-sm transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
