import React from 'react';
import { useRoom } from '../context/RoomContext';

export function EmojiReactionsOverlay() {
  const { reactions } = useRoom();
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {reactions.map(r => (
        <div
          key={r.id}
          className="emoji-float absolute bottom-4 text-3xl select-none"
          style={{ left: `${r.x}%` }}
          title={r.username}
        >
          {r.emoji}
        </div>
      ))}
    </div>
  );
}

const EMOJIS = ['❤️', '😂', '😮', '🔥', '👏', '😢', '💯', '🎉', '😍', '🤩', '🙌', '⚡'];

interface EmojiReactionBarProps {
  roomCode: string;
  userId: string;
  username: string;
  onReact: (emoji: string) => void;
}

export function EmojiReactionBar({ onReact }: EmojiReactionBarProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {EMOJIS.map(e => (
        <button
          key={e}
          onClick={() => onReact(e)}
          className="text-xl sm:text-2xl hover:scale-125 active:scale-110 transition-transform p-1 rounded-lg hover:bg-white/10"
          title={`React with ${e}`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
