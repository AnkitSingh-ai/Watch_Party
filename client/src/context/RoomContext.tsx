import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ParticipantData, VideoState, ChatMessage, RoomState, ToastMessage, QueueItem, EmojiReaction } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface RoomContextValue {
  roomState: RoomState | null;
  currentUser: ParticipantData | null;
  toasts: ToastMessage[];
  reactions: EmojiReaction[];
  syncAction: string | null;
  setRoomState: (state: RoomState | null) => void;
  setCurrentUser: (user: ParticipantData | null | ((prev: ParticipantData | null) => ParticipantData | null)) => void;
  updateParticipants: (participants: ParticipantData[]) => void;
  updateVideoState: (videoState: VideoState) => void;
  addMessage: (msg: ChatMessage) => void;
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
  updateHostId: (hostId: string) => void;
  updateQueue: (queue: QueueItem[]) => void;
  addReaction: (reaction: EmojiReaction) => void;
  setSyncAction: (action: string | null) => void;
}

const RoomContext = createContext<RoomContextValue | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [currentUser, setCurrentUser] = useState<ParticipantData | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);
  const [syncAction, setSyncAction] = useState<string | null>(null);

  const updateParticipants = useCallback((participants: ParticipantData[]) => {
    setRoomState((prev) => prev ? { ...prev, participants } : null);
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = participants.find((p) => p.userId === prev.userId);
      return updated ? { ...prev, role: updated.role } : prev;
    });
  }, []);

  const updateVideoState = useCallback((videoState: VideoState) => {
    setRoomState((prev) => prev ? { ...prev, videoState } : null);
  }, []);

  const addMessage = useCallback((msg: ChatMessage) => {
    setRoomState((prev) => prev ? { ...prev, messages: [...prev.messages, msg].slice(-200) } : null);
  }, []);

  const updateHostId = useCallback((hostId: string) => {
    setRoomState((prev) => prev ? { ...prev, hostId } : null);
  }, []);

  const updateQueue = useCallback((queue: QueueItem[]) => {
    setRoomState((prev) => prev ? { ...prev, queue } : null);
  }, []);

  const addReaction = useCallback((reaction: EmojiReaction) => {
    setReactions((prev) => [...prev, reaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 4000);
  }, []);

  return (
    <RoomContext.Provider value={{
      roomState, currentUser, toasts, reactions, syncAction,
      setRoomState, setCurrentUser, updateParticipants, updateVideoState,
      addMessage, addToast, removeToast, updateHostId, updateQueue, addReaction, setSyncAction,
    }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be used within RoomProvider');
  return ctx;
}
