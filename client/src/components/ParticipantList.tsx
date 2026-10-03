import React, { useState } from 'react';
import { Crown, Shield, User, MoreVertical, UserMinus, Star } from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { ParticipantData } from '../types';

const roleConfig = {
  host: { label: 'Host', icon: Crown, badge: 'text-yellow-300 bg-yellow-400/10 border-yellow-400/25' },
  moderator: { label: 'Mod', icon: Shield, badge: 'text-blue-300 bg-blue-400/10 border-blue-400/25' },
  participant: { label: 'Viewer', icon: User, badge: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
};

const avatarGradients = [
  'from-violet-500 to-purple-700', 'from-blue-500 to-cyan-500',
  'from-green-500 to-teal-500', 'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500', 'from-yellow-500 to-orange-500',
];

function getGradient(userId: string) { return avatarGradients[userId.charCodeAt(0) % avatarGradients.length]; }
function getInitials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

function ParticipantItem({ participant, isCurrentUser, isCurrentHost, roomCode, userId, onEmit }: {
  participant: ParticipantData; isCurrentUser: boolean; isCurrentHost: boolean;
  roomCode: string; userId: string;
  onEmit: (event: string, data: unknown) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = roleConfig[participant.role];
  const RoleIcon = cfg.icon;

  const emit = (event: string, extra: object) => {
    onEmit(event, { roomCode, userId, targetUserId: participant.userId, ...extra });
    setMenuOpen(false);
  };

  return (
    <div className="relative flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(participant.userId)} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md`}>
        {getInitials(participant.username)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-semibold truncate ${
            participant.role === 'host' ? 'text-yellow-200' : participant.role === 'moderator' ? 'text-blue-200' : 'text-white'
          }`}>{participant.username}</span>
          {isCurrentUser && <span className="text-xs text-gray-600">(you)</span>}
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border font-semibold ${cfg.badge}`}>
          <RoleIcon className="w-2.5 h-2.5" />{cfg.label}
        </span>
      </div>
      {isCurrentHost && !isCurrentUser && (
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-gray-600 hover:text-white rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 glass-strong border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-fade-in">
              {participant.role !== 'moderator' && (
                <button onClick={() => emit('assign_role', { role: 'moderator' })}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  <Shield className="w-4 h-4 text-blue-400" />Make Moderator
                </button>
              )}
              {participant.role !== 'participant' && (
                <button onClick={() => emit('assign_role', { role: 'participant' })}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  <User className="w-4 h-4 text-gray-400" />Make Participant
                </button>
              )}
              <button onClick={() => confirm(`Transfer host to ${participant.username}?`) && emit('transfer_host', {})}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                <Star className="w-4 h-4 text-yellow-400" />Transfer Host
              </button>
              <div className="border-t border-white/10 my-1" />
              <button onClick={() => confirm(`Remove ${participant.username}?`) && emit('remove_participant', {})}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors">
                <UserMinus className="w-4 h-4" />Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ParticipantList({ roomCode, userId, onEmit }: { roomCode: string; userId: string; onEmit: (event: string, data: unknown) => void }) {
  const { roomState, currentUser } = useRoom();
  const participants = roomState?.participants || [];
  const isHost = currentUser?.role === 'host';
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <h3 className="text-sm font-semibold text-white">Participants</h3>
        <span className="text-xs text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">{participants.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {participants.map(p => (
          <ParticipantItem key={p.userId} participant={p}
            isCurrentUser={p.userId === userId} isCurrentHost={isHost}
            roomCode={roomCode} userId={userId} onEmit={onEmit} />
        ))}
      </div>
    </div>
  );
}
