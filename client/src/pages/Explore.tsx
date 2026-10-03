import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Play, ArrowLeft, Search, Music, Gamepad2, Tv,
  Cpu, Globe, Sparkles, Radio, Compass, CheckCircle2, Video, Laugh, Code, BookOpen, UserCheck, Flame, Film, ExternalLink
} from 'lucide-react';

interface VideoItem {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  category: string;
  views?: string;
  tags?: string[];
}

const categories = [
  { id: 'all', label: 'All YouTube Videos', icon: Compass },
  { id: 'comedy', label: 'Samay, Harsh & Gaurav Comedy', icon: Laugh },
  { id: 'movies', label: 'Indian Movies & Trailers', icon: Film },
  { id: 'dsa', label: 'C++ & DSA', icon: Code },
  { id: 'java', label: 'Java & DSA', icon: BookOpen },
  { id: 'interviews', label: 'Indian Tech Interviews', icon: UserCheck },
  { id: 'tech', label: 'Hindi Web Dev', icon: Cpu },
  { id: 'music', label: 'Bollywood & Punjabi', icon: Music },
];

const builtInCatalog: VideoItem[] = [
  // Standup Comedy Specials
  { videoId: 'rkKZIMPecRA', title: "INDIA'S GOT LATENT S2 EP7 ft. Nawazuddin Siddiqui, Bhuvan Bam, Mukesh Chhabra", channel: 'Samay Raina', duration: '42:15', category: 'comedy', views: '28M', tags: ['samay raina', 'india\'s got latent', 'comedy'] },
  
  // Movies & Blockbusters
  { videoId: 'COv52Qyctws', title: 'JAWAN Official Trailer | Shah Rukh Khan | Atlee | Nayanthara', channel: 'Red Chillies Entertainment', duration: '2:45', category: 'movies', views: '110M', tags: ['jawan', 'srk', 'shah rukh khan', 'action', 'movie'] },
  { videoId: 'BddP6PYo2gs', title: 'Kesariya - Brahmastra | Ranbir Kapoor, Alia Bhatt', channel: 'Sony Music India', duration: '3:10', category: 'music', views: '150M', tags: ['kesariya', 'brahmastra', 'music'] },
  { videoId: '0e3GPea1Tyg', title: '$456,000 Squid Game In Real Life!', channel: 'MrBeast', duration: '2:38', category: 'movies', views: '65M', tags: ['squid game', 'mrbeast', 'challenge'] },
  { videoId: 'shW9i6k8cB0', title: 'Spider-Man: Across the Spider-Verse - Official Trailer', channel: 'Sony Pictures', duration: '2:25', category: 'movies', views: '58M', tags: ['spiderman', 'movies', 'animation'] },
  { videoId: 'Way9Dexny3w', title: 'Dune: Part Two | Official Trailer 2 | Timothée Chalamet', channel: 'Warner Bros. Pictures', duration: '3:02', category: 'movies', views: '34M', tags: ['dune', 'movies', 'sci-fi'] },
  { videoId: 'E3Huy2cdih0', title: 'ELDEN RING - Official Gameplay Reveal', channel: 'Bandai Namco Europe', duration: '2:10', category: 'movies', views: '28M', tags: ['elden ring', 'gaming', 'trailer'] },
  { videoId: 'QdBZY2fkU-0', title: 'Grand Theft Auto VI Cinematic Movie Trailer 1', channel: 'Rockstar Games', duration: '1:31', category: 'movies', views: '220M', tags: ['gta6', 'gaming', 'trailer'] },

  // C++ & DSA
  { videoId: 'WQoB2z67hvY', title: 'Lecture 1: Intro to Programming & Flowcharts', channel: 'CodeHelp - by Babbar', duration: '22:10', category: 'dsa', views: '7.2M', tags: ['programming', 'flowcharts', 'coding'] },
  { videoId: 'vLnPwxZdW4Y', title: 'C++ Tutorial for Beginners - Full Course', channel: 'freeCodeCamp.org', duration: '16:45', category: 'dsa', views: '5.8M', tags: ['c++', 'tutorial', 'programming'] },
  { videoId: 'z9bZufPHFLU', title: 'Introduction to C++ | Data Structures and Algorithms', channel: 'Apna College', duration: '25:40', category: 'dsa', views: '3.1M', tags: ['c++', 'dsa', 'programming'] },

  // Java & DSA
  { videoId: 'yRpLlJmRo2w', title: 'Introduction to Java Language | Complete Placement Course', channel: 'Apna College', duration: '19:15', category: 'java', views: '6.4M', tags: ['java', 'placement', 'programming'] },
  { videoId: 'gfDE2a7MKjA', title: 'Python Tutorial For Beginners In Hindi', channel: 'CodeWithHarry', duration: '31:20', category: 'tech', views: '9.1M', tags: ['python', 'hindi', 'programming'] },

  // Indian Tech Interviews
  { videoId: 'tVzUXW6siu0', title: 'Installing VS Code & How Websites Work', channel: 'CodeWithHarry', duration: '15:10', category: 'tech', views: '2.4M', tags: ['vs code', 'web development', 'coding'] },
  { videoId: 'bMknfKXIFA8', title: 'React Course - Beginner\'s Tutorial for React JavaScript Library', channel: 'freeCodeCamp.org', duration: '21:05', category: 'tech', views: '2.8M', tags: ['react', 'javascript', 'frontend'] },

  // Hindi Web Dev
  { videoId: 'w7ejDZ8SWv8', title: 'React JS Crash Course', channel: 'Traversy Media', duration: '11:42', category: 'tech', views: '1.2M', tags: ['react', 'webdev', 'frontend', 'javascript'] },

  // Bollywood & Punjabi Music
  { videoId: 'RLzC55ai0eo', title: 'Heeriye (Official Video) Jasleen Royal ft. Arijit Singh', channel: 'Jasleen Royal', duration: '3:19', category: 'music', views: '410M', tags: ['heeriye', 'arijit singh', 'jasleen royal', 'music'] },
];

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

function VideoCard({ video, onWatch }: { video: VideoItem; onWatch: (videoId: string, title: string) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="glass rounded-2xl overflow-hidden card-hover cursor-pointer group border border-white/5 flex flex-col justify-between transition-all duration-300 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-950/30"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onWatch(video.videoId, video.title)}
    >
      {/* Cover Photo / Thumbnail */}
      <div className="relative aspect-video bg-dark-900 overflow-hidden">
        <img
          src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
          alt={video.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-105' : 'scale-100'}`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-center justify-center transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-13 h-13 bg-orange-600 rounded-full flex items-center justify-center shadow-xl shadow-orange-900/60 scale-95 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
        <span className={`absolute bottom-2 right-2 text-xs font-mono font-bold px-2 py-0.5 rounded ${
          video.duration === 'LIVE' ? 'bg-red-600 text-white animate-pulse' : 'bg-black/80 text-white/90 backdrop-blur-sm'
        }`}>
          {video.duration}
        </span>
        {video.views && (
          <span className="absolute top-2 left-2 bg-black/70 text-amber-300 text-[11px] px-2.5 py-0.5 rounded-md backdrop-blur-sm font-semibold flex items-center gap-1 border border-amber-500/20">
            🇮🇳 {video.views} views
          </span>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-dark-800/40">
        <div>
          <h3 className="text-white font-semibold text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-orange-300 transition-colors">
            {video.title}
          </h3>
          <p className="text-gray-400 text-xs flex items-center gap-1 font-medium">
            <span>{video.channel}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 inline shrink-0 fill-amber-400/20" />
          </p>
        </div>
        
        {/* Launch Button */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-amber-300 uppercase tracking-wider font-bold bg-amber-950/60 border border-amber-500/20 px-2 py-0.5 rounded">
            {video.category}
          </span>
          <span className="text-xs text-orange-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Start Party →
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const getUserId = () => {
    let id = localStorage.getItem('watchparty_userId');
    if (!id) { id = uuidv4(); localStorage.setItem('watchparty_userId', id); }
    return id;
  };

  const handleWatch = (videoId: string, title: string) => {
    const username = localStorage.getItem('watchparty_username') || 'Guest';
    const userId = getUserId();
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    navigate(`/room/${code}?creating=true&username=${encodeURIComponent(username)}&userId=${userId}&videoId=${videoId}`);
  };

  // Detect custom YouTube URL or ID
  const customVideoId = useMemo(() => {
    if (!search.trim()) return null;
    return extractYouTubeId(search.trim());
  }, [search]);

  // Dynamic search across catalog
  const filteredVideos = useMemo(() => {
    const query = search.toLowerCase().trim();
    return builtInCatalog.filter((v) => {
      const matchCat = activeCategory === 'all' || v.category === activeCategory;
      if (!query) return matchCat;
      const matchText =
        v.title.toLowerCase().includes(query) ||
        v.channel.toLowerCase().includes(query) ||
        v.category.toLowerCase().includes(query) ||
        v.tags?.some((t) => t.toLowerCase().includes(query));
      return matchCat && matchText;
    });
  }, [activeCategory, search]);

  // Recommended videos generator
  const recommendedVideos = useMemo(() => {
    const filteredIds = new Set(filteredVideos.map((v) => v.videoId));
    return builtInCatalog
      .filter((v) => !filteredIds.has(v.videoId))
      .slice(0, 6);
  }, [filteredVideos]);

  return (
    <div className="min-h-screen bg-[#08080f] text-gray-100 pb-16">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-60 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-3xl" />
        <div
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="glass border-b border-white/5 sticky top-0 z-30 px-4 sm:px-6 py-3.5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xl">🇮🇳</span>
                <h1 className="text-white font-bold text-lg hidden sm:block">YouTube Watch Party Hub</h1>
              </div>
            </div>

            {/* Live Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ANY YouTube video, Samay, Jawan, C++, Java, or paste link..."
                className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white bg-white/10 w-5 h-5 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Custom YouTube Link Banner */}
          {customVideoId && (
            <div className="mb-8 p-5 glass rounded-2xl border border-orange-500/40 bg-orange-950/20 shadow-2xl animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-600/30 border border-orange-500/40 rounded-2xl flex items-center justify-center shrink-0">
                  <Video className="w-7 h-7 text-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-orange-300 uppercase tracking-wider">Custom YouTube Video Ready</span>
                  </div>
                  <p className="text-white font-semibold text-base mt-0.5">Video ID: <span className="font-mono text-amber-200">{customVideoId}</span></p>
                  <p className="text-gray-400 text-xs mt-0.5">Click to launch watch party with your custom YouTube link!</p>
                </div>
              </div>
              <button
                onClick={() => handleWatch(customVideoId, 'Custom YouTube Video')}
                className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-900/40 flex items-center justify-center gap-2 shrink-0 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                Launch Watch Party Now
              </button>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-white/5">
            {categories.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveCategory(id); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === id
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-900/30 font-semibold'
                    : 'glass text-gray-400 hover:text-white border border-white/5 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Search Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <span>{search ? `Search Results for "${search}"` : categories.find((c) => c.id === activeCategory)?.label}</span>
              <span className="text-xs font-normal text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                {filteredVideos.length} videos
              </span>
            </h2>
          </div>

          {/* Video Grid */}
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredVideos.map((video) => (
                <VideoCard key={video.videoId + video.title} video={video} onWatch={handleWatch} />
              ))}
            </div>
          ) : (
            <div className="p-8 glass rounded-2xl border border-orange-500/30 my-4 text-center">
              <Search className="w-12 h-12 text-orange-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-1">Search YouTube Video</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">
                Paste any YouTube link or video ID above to watch it together with your friends!
              </p>
            </div>
          )}

          {/* Recommended Section */}
          {recommendedVideos.length > 0 && (
            <div className="mt-14 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-white font-bold text-lg">Top Recommended Videos</h3>
                <span className="text-xs text-gray-400 ml-2">Handpicked for your watch party</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {recommendedVideos.map((video) => (
                  <VideoCard key={'rec-' + video.videoId} video={video} onWatch={handleWatch} />
                ))}
              </div>
            </div>
            )}
            {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-white/10 text-center font-medium text-sm text-gray-400">
            Made with ❤️ by <span className="text-amber-300 font-bold">Krishti Mittal</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
