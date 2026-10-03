import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Shield, Users, MessageSquare, Film, ListVideo, Code2, Server, Globe, Cpu } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  const techStack = [
    { name: 'React 18', desc: 'Frontend UI library with hooks & context', icon: Code2, color: 'text-cyan-400' },
    { name: 'TypeScript', desc: 'Type-safe JavaScript across the stack', icon: Cpu, color: 'text-blue-400' },
    { name: 'Vite', desc: 'Lightning-fast dev server & bundler', icon: Zap, color: 'text-yellow-400' },
    { name: 'TailwindCSS', desc: 'Utility-first CSS with custom animations', icon: Globe, color: 'text-teal-400' },
    { name: 'Node.js + Express', desc: 'HTTP server & REST API', icon: Server, color: 'text-green-400' },
    { name: 'Socket.IO', desc: 'WebSocket-based real-time bidirectional events', icon: Zap, color: 'text-orange-400' },
    { name: 'MongoDB + Mongoose', desc: 'Persistent room & session storage', icon: Cpu, color: 'text-emerald-400' },
    { name: 'YouTube IFrame API', desc: 'Embedded controllable YouTube player', icon: Film, color: 'text-red-400' },
  ];

  const roles = [
    { role: 'Host', badge: 'bg-yellow-400/15 border-yellow-400/30 text-yellow-300', perms: 'Full playback control, assign roles, remove participants, transfer host' },
    { role: 'Moderator', badge: 'bg-blue-400/15 border-blue-400/30 text-blue-300', perms: 'Play, pause, seek, change video, manage queue' },
    { role: 'Participant', badge: 'bg-gray-400/15 border-gray-400/30 text-gray-300', perms: 'Watch only — all controls server-enforced' },
  ];

  const flow = [
    { from: 'Host presses Play', to: 'socket.emit("play", { roomCode, userId, currentTime })' },
    { from: 'Server receives', to: 'Participant.canControl() → validates role' },
    { from: 'If allowed', to: 'Room.updateVideoState({ playing: true })' },
    { from: 'Server broadcasts', to: 'io.to(roomId).emit("sync_state", videoState)' },
    { from: 'All clients receive', to: 'YouTube player.playVideo() triggered' },
  ];

  return (
    <div className="min-h-screen bg-[#08080f]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-800/10 rounded-full blur-3xl" />
        <div style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} className="absolute inset-0" />
      </div>

      <div className="relative z-10">
        <header className="glass border-b border-white/5 px-4 sm:px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-white font-bold text-lg">About WatchParty</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-16">

          {/* Hero */}
          <section className="text-center">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">Built for <span className="gradient-text">Real-time</span> Together</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              WatchParty is a full-stack MERN application using WebSockets to synchronize YouTube playback across multiple users in real time, with role-based access control and live chat.
            </p>
          </section>

          {/* WebSocket Flow */}
          <section>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> WebSocket Event Flow</h3>
            <div className="glass rounded-2xl p-6 font-mono text-sm space-y-3">
              {flow.map((f, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2">
                  <span className="text-gray-500 shrink-0 sm:w-48">{f.from}</span>
                  <span className="text-gray-700 hidden sm:block">→</span>
                  <span className="text-violet-300">{f.to}</span>
                </div>
              ))}
            </div>
          </section>

          {/* OOP Architecture */}
          <section>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Code2 className="w-5 h-5 text-blue-400" /> OOP Backend Architecture</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { cls: 'Participant', desc: 'Stores userId, username, role, socketId. Exposes canControl(), canAssignRoles(), canRemoveParticipants()' },
                { cls: 'Room', desc: 'Manages participant Map, videoState, messages, queue. Exposes broadcast(), addParticipant(), removeParticipant(), transferHost()' },
                { cls: 'RoomManager', desc: 'In-memory registry of all rooms. Handles createRoom(), joinRoom(), handleDisconnect() with auto host promotion' },
                { cls: 'MessageHandler', desc: 'Routes all Socket.IO events. Validates permissions before delegating to Room/RoomManager. One method per event.' },
              ].map(({ cls, desc }) => (
                <div key={cls} className="glass rounded-xl p-5 border border-violet-500/10">
                  <h4 className="text-violet-400 font-mono font-bold mb-2">class {cls}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Role system */}
          <section>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-blue-400" /> Role-Based Access Control</h3>
            <div className="space-y-3">
              {roles.map(({ role, badge, perms }) => (
                <div key={role} className="glass rounded-xl p-5 flex flex-col sm:flex-row gap-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg border text-sm font-bold h-fit shrink-0 ${badge}`}>{role}</span>
                  <p className="text-gray-400 text-sm">{perms}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tech stack */}
          <section>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Cpu className="w-5 h-5 text-green-400" /> Tech Stack</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {techStack.map(({ name, desc, icon: Icon, color }) => (
                <div key={name} className="glass rounded-xl p-4 flex items-start gap-3 card-hover">
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} />
                  <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
