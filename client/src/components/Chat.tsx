import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { EmojiPicker } from './EmojiPicker';

function formatTime(ts: number) { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

const nameColors = ['text-violet-400','text-blue-400','text-green-400','text-pink-400','text-yellow-400','text-cyan-400','text-orange-400'];
function getColor(userId: string) { return nameColors[userId.charCodeAt(0) % nameColors.length]; }

export function Chat({ roomCode, userId, username, onEmit }: { roomCode: string; userId: string; username: string; onEmit: (event: string, data: unknown) => void }) {
  const { roomState } = useRoom();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const messages = roomState?.messages || [];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const send = () => {
    if (!input.trim()) return;
    onEmit('chat_message', { roomCode, userId, username, message: input.trim() });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 shrink-0">
        <MessageSquare className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">Chat</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && <p className="text-xs text-gray-700 text-center pt-6">No messages yet. Say hi! 👋</p>}
        {messages.map(msg => (
          <div key={msg.id}>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className={`text-xs font-bold ${getColor(msg.userId)}`}>{msg.username}</span>
              <span className="text-[10px] text-gray-700">{formatTime(msg.timestamp)}</span>
            </div>
            <p className="text-sm text-gray-300 break-words leading-snug">{msg.message}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="px-3 py-3 border-t border-white/5 shrink-0">
        <div className="flex gap-2 items-center">
          <EmojiPicker onSelect={e => setInput(prev => prev + e)} />
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            maxLength={500} placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all" />
          <button onClick={send} disabled={!input.trim()}
            className="p-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl transition-all active:scale-95 shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
