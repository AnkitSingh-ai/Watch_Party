import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

const EMOJI_GROUPS = [
  ['😀','😂','😍','🥰','😎','🤩','😭','😡','🥺','😴'],
  ['👍','👎','👏','🙌','🤝','🫶','💪','✌️','🤞','👋'],
  ['❤️','🧡','💛','💚','💙','💜','🖤','💔','💯','✨'],
  ['🔥','⚡','🌟','🎉','🎊','🎶','🎬','🎮','🏆','🚀'],
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="p-2 text-gray-400 hover:text-yellow-400 rounded-xl hover:bg-white/5 transition-all">
        <Smile className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 glass-strong rounded-2xl p-3 shadow-2xl z-50 w-56 animate-slide-up">
          {EMOJI_GROUPS.map((group, i) => (
            <div key={i} className="flex gap-1 mb-1">
              {group.map(e => (
                <button key={e} onClick={() => { onSelect(e); setOpen(false); }}
                  className="text-lg hover:scale-125 transition-transform p-0.5 rounded hover:bg-white/10 flex-1">
                  {e}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
