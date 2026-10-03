import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Play, Users, Zap, Shield, Film, ChevronRight, Hash, MessageSquare, Smile, ListVideo, Globe, Info } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-between glass border-b border-white/5">
      <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Play className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="text-lg font-bold text-white">WatchParty</span>
      </button>
      <div className="hidden sm:flex items-center gap-1">
        <button onClick={() => navigate('/explore')} className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">Explore</button>
        <button onClick={() => navigate('/about')} className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">About</button>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/explore')} className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all active:scale-95">
          <Globe className="w-4 h-4" /> Explore
        </button>
        <button onClick={() => navigate('/explore')} className="sm:hidden p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">
          <Globe className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([-\w]+)/,
    /^([\w-]{11})$/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function Home() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ activeRooms: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('watchparty_username');
    if (saved) setUsername(saved);
    fetch(`${SERVER_URL}/api/stats`).then(r => r.json()).then(d => setStats(d)).catch(() => {});
  }, []);

  const getUserId = () => {
    let id = localStorage.getItem('watchparty_userId');
    if (!id) { id = uuidv4(); localStorage.setItem('watchparty_userId', id); }
    return id;
  };

  const handleCreate = async () => {
    if (!username.trim()) { setError('Please enter your name'); return; }
    setLoading(true); setError('');
    const userId = getUserId();
    localStorage.setItem('watchparty_username', username.trim());
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const parsedId = videoUrl.trim() ? extractYouTubeId(videoUrl.trim()) : null;
    const videoParam = parsedId ? `&videoId=${parsedId}` : '';
    navigate(`/room/${code}?creating=true&username=${encodeURIComponent(username.trim())}&userId=${userId}${videoParam}`);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!username.trim()) { setError('Please enter your name'); return; }
    if (!roomCode.trim()) { setError('Please enter a room code'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${SERVER_URL}/api/rooms/${roomCode.trim().toUpperCase()}`);
      if (!res.ok) { setError('Room not found. Check the room code.'); setLoading(false); return; }
      const userId = getUserId();
      localStorage.setItem('watchparty_username', username.trim());
      navigate(`/room/${roomCode.trim().toUpperCase()}?username=${encodeURIComponent(username.trim())}&userId=${userId}`);
    } catch { setError('Could not connect to server.'); }
    setLoading(false);
  };

  const features = [
    { icon: Zap, title: 'Real-time Sync', desc: 'Play, pause & seek synced instantly for everyone', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
    { icon: Shield, title: 'Role Control', desc: 'Host, Moderator & Participant roles with full permission enforcement', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    { icon: MessageSquare, title: 'Live Chat', desc: 'Real-time chat with emoji reactions that float on screen', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
    { icon: ListVideo, title: 'Video Queue', desc: 'Queue up videos so the party never stops', color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/20' },
    { icon: Smile, title: 'Reactions', desc: 'Send emoji reactions that fly across the screen', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
    { icon: Film, title: 'Any YouTube Video', desc: 'Paste any YouTube URL and watch together', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  ];

  const steps = [
    { num: '01', title: 'Create a Room', desc: 'Enter your name and create a watch party room. You become the host with full controls.' },
    { num: '02', title: 'Share the Code', desc: 'Share the 6-character room code or link with your friends.' },
    { num: '03', title: 'Watch Together', desc: 'Play any YouTube video. Everyone stays perfectly in sync, in real time.' },
  ];

  return (
    <div className="min-h-screen bg-[#08080f] flex flex-col">
      <Navbar />

      {/* Bg orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 -left-60 w-[600px] h-[600px] bg-violet-700/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-60 -right-60 w-[600px] h-[600px] bg-purple-800/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-900/10 rounded-full blur-3xl" />
        {/* Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 pt-28 pb-16">
          <div className="text-center mb-10 max-w-3xl">
            {stats.activeRooms > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-xs text-gray-400 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {stats.activeRooms} active room{stats.activeRooms !== 1 ? 's' : ''} right now
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-5 leading-[1.05] tracking-tight">
              Watch Together,
              <br />
              <span className="gradient-text">Stay in Sync</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-xl max-w-xl mx-auto leading-relaxed">
              Host a YouTube watch party with anyone, anywhere. Real-time sync across play, pause, seek — powered by WebSockets.
            </p>
          </div>

          {/* Card */}
          <div className="w-full max-w-md">
            <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-2xl">
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-black/30 rounded-2xl mb-6">
                {(['create', 'join'] as const).map(t => (
                  <button key={t} onClick={() => { setTab(t); setError(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      tab === t ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50' : 'text-gray-400 hover:text-white'
                    }`}>
                    {t === 'create' ? 'Create Room' : 'Join Room'}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Name</label>
                  <input type="text" value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && (tab === 'create' ? handleCreate() : handleJoin())}
                    placeholder="Enter your display name" maxLength={30}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:bg-white/8 transition-all text-sm" />
                </div>

                {tab === 'create' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      YouTube Video Link / ID <span className="text-gray-600 font-normal lowercase">(optional)</span>
                    </label>
                    <div className="relative">
                      <Film className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" value={videoUrl}
                        onChange={e => setVideoUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                        placeholder="Paste YouTube link (e.g. https://youtu.be/...)"
                        className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all text-sm" />
                    </div>
                  </div>
                )}

                {tab === 'join' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Room Code</label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" value={roomCode}
                        onChange={e => { setRoomCode(e.target.value.toUpperCase()); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleJoin()}
                        placeholder="e.g. AB3X7K" maxLength={8}
                        className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all font-mono tracking-widest uppercase text-sm" />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-900/30 border border-red-700/30 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <button onClick={tab === 'create' ? handleCreate : handleJoin} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-violet-900/40 mt-2">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <>{tab === 'create' ? <Play className="w-4 h-4 fill-white" /> : <Users className="w-4 h-4" />}
                      {tab === 'create' ? 'Create Watch Party' : 'Join Room'}
                      <ChevronRight className="w-4 h-4" /></>}
                </button>

                <button onClick={() => navigate('/explore')}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-400 hover:text-white border border-white/8 hover:border-white/20 rounded-xl transition-all">
                  <Film className="w-4 h-4" /> Browse videos to watch
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-4 py-16 sm:py-24 max-w-5xl mx-auto w-full">
          <div className="text-center mb-12">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple & Fast</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-white">How it works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative glass rounded-2xl p-6 card-hover">
                <div className="text-5xl font-black text-violet-900/60 mb-4">{s.num}</div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 text-violet-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="px-4 pb-16 sm:pb-24 max-w-5xl mx-auto w-full">
          <div className="text-center mb-12">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-white">Packed with features</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`glass rounded-2xl p-5 border card-hover flex gap-4 ${bg}`}>
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-black/30`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-4 py-8">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-700 rounded-lg flex items-center justify-center">
                <Play className="w-3 h-3 text-white fill-white" />
              </div>
              <span className="text-sm font-semibold text-gray-400">
                Made with ❤️ by <span className="text-violet-400 font-bold">Krishti Mittal</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/explore')} className="text-sm text-gray-400 hover:text-white transition-colors font-medium">Explore</button>
              <button onClick={() => navigate('/about')} className="text-sm text-gray-400 hover:text-white transition-colors font-medium">About</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
