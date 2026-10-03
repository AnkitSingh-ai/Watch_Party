import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Play } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#08080f] flex flex-col items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 text-center">
        <div className="text-[120px] sm:text-[180px] font-black leading-none mb-4" style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed, #2e1065)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Lost in Space 🚀</h1>
        <p className="text-gray-500 mb-8 max-w-sm">The page you're looking for doesn't exist. Maybe the room expired, or the link is broken.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-all active:scale-95">
            <Home className="w-4 h-4" /> Go Home
          </button>
          <button onClick={() => navigate('/explore')} className="flex items-center justify-center gap-2 px-6 py-3 glass border border-white/10 text-gray-300 hover:text-white rounded-xl font-semibold transition-all">
            <Play className="w-4 h-4" /> Explore Videos
          </button>
        </div>
      </div>
    </div>
  );
}
