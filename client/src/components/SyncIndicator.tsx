import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useRoom } from '../context/RoomContext';

export function SyncIndicator() {
  const { syncAction } = useRoom();
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!syncAction) return;
    const labels: Record<string, string> = { play: 'Playing', pause: 'Paused', seek: 'Seeked', change_video: 'New Video', sync: 'Synced' };
    setLabel(labels[syncAction] || 'Syncing');
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, [syncAction]);

  if (!visible) return null;
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 rounded-full text-xs text-violet-300 animate-fade-in">
      <Zap className="w-3 h-3 sync-pulse" />
      <span>{label}</span>
    </div>
  );
}
