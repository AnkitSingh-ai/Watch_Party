import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRoom } from '../context/RoomContext';
import { ParticipantData, VideoState, ChatMessage } from '../types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

let socketInstance: Socket | null = null;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { updateParticipants, updateVideoState, addMessage, addToast, updateHostId, setCurrentUser } = useRoom();

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
    }
    socketRef.current = socketInstance;

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      addToast('error', 'Connection error. Retrying...');
    });

    socket.on('sync_state', (data: { videoState: VideoState; triggeredBy: string }) => {
      updateVideoState(data.videoState);
    });

    socket.on('user_joined', (data: { userId: string; username: string; role: string; participants: ParticipantData[] }) => {
      updateParticipants(data.participants);
      addToast('info', `${data.username} joined the room`);
    });

    socket.on('user_left', (data: { userId: string; username: string; participants: ParticipantData[]; newHostId?: string }) => {
      updateParticipants(data.participants);
      addToast('info', `${data.username} left the room`);
      if (data.newHostId) updateHostId(data.newHostId);
    });

    socket.on('role_assigned', (data: { userId: string; username: string; role: string; participants: ParticipantData[] }) => {
      updateParticipants(data.participants);
      setCurrentUser((prev) => {
        if (!prev) return null;
        if (prev.userId === data.userId) {
          addToast('info', `Your role has been changed to ${data.role}`);
          return { ...prev, role: data.role as any };
        }
        return prev;
      });
      addToast('info', `${data.username} is now a ${data.role}`);
    });

    socket.on('participant_removed', (data: { userId: string; participants: ParticipantData[] }) => {
      updateParticipants(data.participants);
    });

    socket.on('host_transferred', (data: { newHostId: string; newHostName: string; participants: ParticipantData[] }) => {
      updateParticipants(data.participants);
      updateHostId(data.newHostId);
      addToast('info', `${data.newHostName} is now the host`);
    });

    socket.on('video_changed', (data: { videoId: string; changedBy: string }) => {
      addToast('info', `${data.changedBy} changed the video`);
    });

    socket.on('chat_message', (msg: ChatMessage) => {
      addMessage(msg);
    });

    socket.on('you_were_removed', (data: { message: string }) => {
      addToast('error', data.message);
    });

    socket.on('error_event', (data: { message: string }) => {
      addToast('error', data.message);
    });

    return () => {
      socket.off('sync_state');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('role_assigned');
      socket.off('participant_removed');
      socket.off('host_transferred');
      socket.off('video_changed');
      socket.off('chat_message');
      socket.off('you_were_removed');
      socket.off('error_event');
    };
  }, [updateParticipants, updateVideoState, addMessage, addToast, updateHostId, setCurrentUser]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const onEvent = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  return { socket: socketRef.current, emit, onEvent };
}
