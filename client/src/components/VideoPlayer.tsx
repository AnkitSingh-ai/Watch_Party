import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Play, Pause, Lock } from 'lucide-react';
import { useRoom } from '../context/RoomContext';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    _ytApiLoaded: boolean;
  }
}

export function VideoPlayer({ roomCode, userId, onEmit }: {
  roomCode: string;
  userId: string;
  onEmit: (event: string, data: unknown) => void;
}) {
  const playerRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isRemote = useRef(false);
  const activeVideoIdRef = useRef<string | null>(null);

  const [clickEffect, setClickEffect] = useState<'play' | 'pause' | 'locked' | null>(null);

  const { roomState, currentUser, setSyncAction } = useRoom();
  const canControl = currentUser?.role === 'host' || currentUser?.role === 'moderator';
  const videoState = roomState?.videoState;
  const targetVideoId = videoState?.videoId || 'LBqE4YOvhyc';

  // ─── Initialize YouTube Player ──────────────────────────────────────────────
  const initPlayer = useCallback((videoId: string, startSeconds = 0) => {
    if (!window.YT?.Player || !wrapperRef.current) return;

    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
    }

    wrapperRef.current.innerHTML = '';
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    wrapperRef.current.appendChild(container);

    activeVideoIdRef.current = videoId;

    playerRef.current = new window.YT.Player(container, {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 0,
        controls: canControl ? 1 : 0,
        disablekb: canControl ? 0 : 1,
        modestbranding: 1,
        rel: 0,
        fs: 1,
        iv_load_policy: 3,
        start: Math.floor(startSeconds),
      },
      events: {
        onReady: (e: any) => {
          e.target.setVolume(80);
          if (activeVideoIdRef.current && activeVideoIdRef.current !== videoId) {
            e.target.cueVideoById({ videoId: activeVideoIdRef.current, startSeconds: 0 });
          }
        },
        onStateChange: (e: any) => {
          if (isRemote.current || !canControl) return;
          const t = playerRef.current?.getCurrentTime?.() || 0;
          if (e.data === window.YT.PlayerState.PLAYING) {
            onEmit('play', { roomCode, userId, currentTime: t });
          } else if (e.data === window.YT.PlayerState.PAUSED) {
            onEmit('pause', { roomCode, userId, currentTime: t });
          }
        },
        onError: (e: any) => console.warn('YouTube Player Error:', e.data),
      },
    });
  }, [canControl, roomCode, userId, onEmit]);

  // ─── Load IFrame API Script ────────────────────────────────────────────────
  useEffect(() => {
    const onApiReady = () => {
      window._ytApiLoaded = true;
      initPlayer(targetVideoId, videoState?.currentTime ?? 0);
    };

    if (window._ytApiLoaded && window.YT?.Player) {
      initPlayer(targetVideoId, videoState?.currentTime ?? 0);
      return;
    }

    window.onYouTubeIframeAPIReady = onApiReady;

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── React to videoState updates ───────────────────────────────────────────
  useEffect(() => {
    if (!targetVideoId) return;

    activeVideoIdRef.current = targetVideoId;

    if (!playerRef.current || typeof playerRef.current.cueVideoById !== 'function') {
      if (window._ytApiLoaded && window.YT?.Player && wrapperRef.current) {
        initPlayer(targetVideoId, videoState?.currentTime ?? 0);
      }
      return;
    }

    isRemote.current = true;
    try {
      const currentVideoId: string = playerRef.current.getVideoData?.()?.video_id ?? '';

      if (currentVideoId !== targetVideoId) {
        if (videoState?.playing) {
          playerRef.current.loadVideoById({ videoId: targetVideoId, startSeconds: videoState.currentTime ?? 0 });
        } else {
          playerRef.current.cueVideoById({ videoId: targetVideoId, startSeconds: videoState?.currentTime ?? 0 });
        }
      } else {
        const currentTime = videoState?.currentTime ?? 0;
        const drift = Math.abs((playerRef.current.getCurrentTime?.() ?? 0) - currentTime);
        if (drift > 1.5) playerRef.current.seekTo?.(currentTime, true);

        const state = playerRef.current.getPlayerState?.();
        const PLAYING = window.YT?.PlayerState?.PLAYING;
        if (videoState?.playing && state !== PLAYING) {
          playerRef.current.playVideo?.();
        } else if (!videoState?.playing && state === PLAYING) {
          playerRef.current.pauseVideo?.();
        }
      }
    } catch (err) {
      console.warn('VideoPlayer sync error:', err);
    } finally {
      setTimeout(() => { isRemote.current = false; }, 500);
    }

    setSyncAction(videoState?.playing ? 'play' : 'pause');
  }, [targetVideoId, videoState, initPlayer, setSyncAction]);

  // ─── Screen Click to Toggle Play/Pause ─────────────────────────────────────
  const handleScreenClick = (e: React.MouseEvent) => {
    // Avoid double triggering if controls button is clicked
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;

    if (!canControl) {
      setClickEffect('locked');
      setTimeout(() => setClickEffect(null), 1000);
      return;
    }

    const t = playerRef.current?.getCurrentTime?.() || videoState?.currentTime || 0;

    if (videoState?.playing) {
      // Pause
      onEmit('pause', { roomCode, userId, currentTime: t });
      setClickEffect('pause');
    } else {
      // Play
      onEmit('play', { roomCode, userId, currentTime: t });
      setClickEffect('play');
    }

    setTimeout(() => setClickEffect(null), 800);
  };

  return (
    <div
      onClick={handleScreenClick}
      className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden cursor-pointer group"
    >
      {/* Player Wrapper Container */}
      <div ref={wrapperRef} className="w-full h-full aspect-video max-h-full" />

      {/* Screen Click Animated Pulse Feedback Overlay */}
      {clickEffect && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30 animate-ping duration-500">
          <div className="w-20 h-20 bg-violet-600/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border border-white/20">
            {clickEffect === 'play' && <Play className="w-10 h-10 text-white fill-white ml-1" />}
            {clickEffect === 'pause' && <Pause className="w-10 h-10 text-white fill-white" />}
            {clickEffect === 'locked' && <Lock className="w-8 h-8 text-amber-300" />}
          </div>
        </div>
      )}

      {/* Subtle hover play/pause prompt */}
      <div className="absolute bottom-4 left-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-xs text-white/80 font-medium z-20">
        Click video screen to {videoState?.playing ? 'pause' : 'play'}
      </div>
    </div>
  );
}
