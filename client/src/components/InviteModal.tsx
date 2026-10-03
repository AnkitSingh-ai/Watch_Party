import React, { useState } from 'react';
import { X, Copy, Check, Link, Hash } from 'lucide-react';

interface InviteModalProps {
  roomCode: string;
  onClose: () => void;
}

export function InviteModal({ roomCode, onClose }: InviteModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const shareUrl = `${window.location.origin}/room/${roomCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&bgcolor=0f0f1a&color=a78bfa&data=${encodeURIComponent(shareUrl)}`;

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative glass-strong rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white rounded-xl hover:bg-white/10 transition-all">
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Link className="w-5 h-5 text-violet-400" /> Invite Friends
        </h2>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-[#0f0f1a] rounded-2xl border border-white/10">
            <img src={qrUrl} alt="QR Code" width={160} height={160} className="rounded-xl" />
          </div>
        </div>

        {/* Room Code */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1 mb-2"><Hash className="w-3 h-3" /> Room Code</label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-mono text-2xl text-white font-black tracking-[0.3em] text-center">
              {roomCode}
            </div>
            <button onClick={copyCode} className={`px-4 rounded-xl border transition-all ${copiedCode ? 'bg-green-600/20 border-green-500/30 text-green-400' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}>
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Share Link */}
        <div>
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1 mb-2"><Link className="w-3 h-3" /> Share Link</label>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 truncate">{shareUrl}</div>
            <button onClick={copyLink} className={`px-4 rounded-xl border transition-all shrink-0 ${copiedLink ? 'bg-green-600/20 border-green-500/30 text-green-400' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}>
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
