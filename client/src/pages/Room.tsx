import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Users, MessageSquare, Copy, Check, ArrowLeft, Wifi, WifiOff, X } from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { Controls } from '../components/Controls';
import { ParticipantList } from '../components/ParticipantList';
import { Chat } from '../components/Chat';
import { ParticipantWebcams } from '../components/ParticipantWebcams';
import { ToastContainer } from '../components/Toast';
import { ParticipantData, VideoState, ChatMessage, QueueItem } from '../types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

type SidebarTab = 'participants' | 'chat';

export default function Room() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const username = searchParams.get('username') || 'Anonymous';
  const userId = searchParams.get('userId') || 'unknown';
  const isCreating = searchParams.get('creating') === 'true';

  const {
    setRoomState,
    setCurrentUser,
    updateParticipants,
    updateVideoState,
    addMessage,
    addToast,
    updateHostId,
    roomState,
  } = useRoom();

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('participants');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile for full-screen video
  const [copied, setCopied] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);

  useEffect(() => {
    // Open sidebar by default on desktop screens (>= 1024px)
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!roomCode || !userId || !username) {
      navigate('/');
      return;
    }

    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_room', {
        roomCode: roomCode.toUpperCase(),
        username,
        userId,
        isCreating,
        videoId: searchParams.get('videoId') || undefined,
      });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('connect_error', () => {
      addToast('error', 'Connection failed. Retrying...');
    });

    socket.on('room_joined', (data: {
      roomId: string;
      roomCode: string;
      hostId: string;
      participant: ParticipantData;
      participants: ParticipantData[];
      videoState: VideoState;
      messages: ChatMessage[];
      queue: QueueItem[];
    }) => {
      setRoomState({
        roomId: data.roomId,
        roomCode: data.roomCode,
        hostId: data.hostId,
        participants: data.participants,
        videoState: data.videoState,
        messages: data.messages,
        queue: data.queue,
      });
      setCurrentUser(data.participant);
      setJoined(true);
    });

    socket.on('sync_state', (data: { videoState: VideoState }) => {
      updateVideoState(data.videoState);
    });

    socket.on('user_joined', (data: { userId: string; username: string; participants: ParticipantData[] }) => {
      updateParticipants(data.participants);
      addToast('info', `${data.username} joined the room`);
    });

    socket.on('user_left', (data: { userId: string; username: string; participants: ParticipantData[]; newHostId?: string }) => {
      updateParticipants(data.participants);
      addToast('info', `${data.username} left`);
      if (data.newHostId) updateHostId(data.newHostId);
    });

    socket.on('role_assigned', (data: { userId: string; username: string; role: string; participants: ParticipantData[] }) => {
      updateParticipants(data.participants);
      if (data.userId === userId) {
        setCurrentUser((prev) => prev ? { ...prev, role: data.role as any } : null);
        addToast('info', `Your role changed to ${data.role}`);
      } else {
        addToast('info', `${data.username} is now a ${data.role}`);
      }
    });

    socket.on('participant_removed', (data: { userId: string; participants: ParticipantData[] }) => {
      updateParticipants(data.participants);
    });

    socket.on('host_transferred', (data: { newHostId: string; newHostName: string; participants: ParticipantData[] }) => {
      updateParticipants(data.participants);
      updateHostId(data.newHostId);
      addToast('info', `${data.newHostName} is now the host`);
      if (data.newHostId === userId) {
        setCurrentUser((prev) => prev ? { ...prev, role: 'host' } : null);
      }
    });

    socket.on('video_changed', (data: { videoId: string; changedBy: string }) => {
      addToast('info', `${data.changedBy} changed the video`);
    });

    socket.on('chat_message', (msg: ChatMessage) => {
      addMessage(msg);
      setSidebarTab((currentTab) => {
        if (currentTab !== 'chat') setUnreadChat((n) => n + 1);
        return currentTab;
      });
    });

    socket.on('you_were_removed', () => {
      addToast('error', 'You were removed from the room');
      setTimeout(() => navigate('/'), 2000);
    });

    socket.on('error_event', (data: { message: string }) => {
      addToast('error', data.message);
    });

    return () => {
      socket.emit('leave_room', { roomCode: roomCode?.toUpperCase(), userId });
      socket.disconnect();
      setRoomState(null);
      setCurrentUser(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, userId, username]);

  const emit = (event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode?.toUpperCase() || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSidebarTab = (tab: SidebarTab) => {
    setSidebarTab(tab);
    if (tab === 'chat') setUnreadChat(0);
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-gray-400">
            Joining room <span className="text-white font-mono">{roomCode}</span>...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-900 flex flex-col overflow-hidden select-none">
      <ToastContainer />

      {/* Top Bar */}
      <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-dark-800/90 backdrop-blur border-b border-white/5 shrink-0 z-20">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 sm:p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          title="Leave Room"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm hidden sm:block">Watch Party</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Connection status badge */}
          <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
            connected ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
          }`}>
            {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-medium">{connected ? 'Connected' : 'Reconnecting...'}</span>
          </div>

          {/* Room Code Copy Button */}
          <button
            onClick={copyRoomCode}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-dark-700 hover:bg-dark-600 border border-white/10 rounded-xl text-xs sm:text-sm transition-all group"
          >
            <span className="text-gray-400 text-xs hidden sm:inline">Code:</span>
            <span className="text-white font-mono font-bold tracking-wider">{roomCode?.toUpperCase()}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-200" />
            )}
          </button>

          {/* Sidebar Drawer Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              sidebarOpen
                ? 'bg-violet-600 text-white border-violet-500 shadow-md'
                : 'bg-white/5 text-gray-300 hover:text-white border-white/10 hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">People & Chat</span>
            {unreadChat > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {unreadChat}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Player + Controls (Always takes 100% width on mobile) */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Video area */}
          <div className="flex-1 bg-black min-h-0 relative">
            <VideoPlayer roomCode={roomCode!} userId={userId} onEmit={emit} />
          </div>

          {/* Controls bar */}
          <div className="px-3 sm:px-4 py-3 sm:py-4 bg-dark-800/80 border-t border-white/5 shrink-0 z-10">
            <Controls roomCode={roomCode!} userId={userId} onEmit={emit} />
          </div>
        </div>

        {/* Mobile Backdrop Overlay (When Sidebar is open on mobile) */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in"
          />
        )}

        {/* Sidebar Drawer (Mobile Overlay Drawer / Desktop Side Panel) */}
        {sidebarOpen && (
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xs sm:max-w-sm lg:static lg:w-80 flex flex-col bg-dark-800/95 lg:bg-dark-800/60 backdrop-blur-2xl border-l border-white/10 shrink-0 overflow-hidden shadow-2xl animate-slide-in">
            {/* Mobile Header Close */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 lg:hidden bg-white/5">
              <span className="text-white font-semibold text-sm">Party Members & Chat</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex border-b border-white/5 shrink-0 bg-dark-900/40">
              <button
                onClick={() => handleSidebarTab('participants')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                  sidebarTab === 'participants'
                    ? 'text-white border-b-2 border-violet-500 font-semibold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Users className="w-4 h-4 text-violet-400" />
                <span>People</span>
                <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-mono">
                  {roomState?.participants.length || 1}
                </span>
              </button>

              <button
                onClick={() => handleSidebarTab('chat')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                  sidebarTab === 'chat'
                    ? 'text-white border-b-2 border-violet-500 font-semibold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-violet-400" />
                <span>Chat</span>
                {unreadChat > 0 && (
                  <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold">
                    {unreadChat}
                  </span>
                )}
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              {sidebarTab === 'participants' ? (
                <ParticipantList roomCode={roomCode!} userId={userId} onEmit={emit} />
              ) : (
                <Chat roomCode={roomCode!} userId={userId} username={username} onEmit={emit} />
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-white/5 bg-black/40 text-center shrink-0">
              <p className="text-xs font-semibold text-gray-400">
                Made with ❤️ by <span className="text-violet-300 font-bold">Krishti Mittal</span>
              </p>
            </div>
          </aside>
        )}

        {/* Floating Participant Webcams Overlay (Bottom Right of Video) */}
        <div className="absolute bottom-16 sm:bottom-20 right-4 z-30 pointer-events-auto">
          <ParticipantWebcams onEmit={emit} />
        </div>
      </div>
    </div>
  );
}
