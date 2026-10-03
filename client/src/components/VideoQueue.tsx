import React, { useState } from 'react';
import { ListVideo, Plus, Trash2, SkipForward } from 'lucide-react';
import { useRoom } from '../context/RoomContext';

function extractYouTubeId(url: string): string | null {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([-\w]+)/, /^([\w-]{11})$/];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

interface VideoQueueProps {
  roomCode: string;
  userId: string;
  onEmit: (event: string, data: unknown) => void;
}

export function VideoQueue({ roomCode, userId, onEmit }: VideoQueueProps) {
  const { roomState, currentUser } = useRoom();
  const [input, setInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const queue = roomState?.queue || [];
  const canControl = currentUser?.role === 'host' || currentUser?.role === 'moderator';

  const handleAdd = () => {
    const videoId = extractYouTubeId(input.trim());
    if (!videoId) return;
    onEmit('add_to_queue', { roomCode, userId, videoId, title: titleInput.trim() || input.trim() });
    setInput(''); setTitleInput('');
  };

  const handleRemove = (index: number) => {
    onEmit('remove_from_queue', { roomCode, userId, index });
  };

  const handlePlayNext = () => {
    onEmit('play_next', { roomCode, userId });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <ListVideo className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Queue</h3>
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400">{queue.length}</span>
        </div>
        {canControl && queue.length > 0 && (
          <button onClick={handlePlayNext} className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-400/10 hover:bg-violet-400/20 px-3 py-1.5 rounded-xl transition-all">
            <SkipForward className="w-3.5 h-3.5" /> Play Next
          </button>
        )}
      </div>

      {/* Add to queue form (host/mod only) */}
      {canControl && (
        <div className="px-3 py-3 border-b border-white/5 space-y-2 shrink-0">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="YouTube URL or video ID..."
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all" />
          <div className="flex gap-2">
            <input value={titleInput} onChange={e => setTitleInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Title (optional)"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all" />
            <button onClick={handleAdd} disabled={!input.trim()}
              className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl transition-all text-sm">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {queue.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <ListVideo className="w-10 h-10 text-gray-700" />
            <p className="text-xs text-gray-600">Queue is empty{canControl ? '. Add videos above!' : '.'}</p>
          </div>
        )}
        {queue.map((item, i) => (
          <div key={item.id} className="flex items-center gap-3 p-3 glass rounded-xl group">
            <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-black">
              <img src={`https://img.youtube.com/vi/${item.videoId}/default.jpg`} className="w-full h-full object-cover" alt="" />
              <div className="absolute top-0.5 left-0.5 bg-black/70 text-white text-xs px-1 rounded font-mono">{i + 1}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">{item.title}</p>
              <p className="text-xs text-gray-600 mt-0.5">by {item.addedBy}</p>
            </div>
            {canControl && (
              <button onClick={() => handleRemove(i)} className="p-1.5 text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
