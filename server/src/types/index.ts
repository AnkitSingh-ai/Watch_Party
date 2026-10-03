export type Role = 'host' | 'moderator' | 'participant';

export interface ParticipantData {
  userId: string;
  username: string;
  role: Role;
  socketId: string;
  joinedAt: number;
}

export interface VideoState {
  videoId: string;
  playing: boolean;
  currentTime: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  addedBy: string;
  addedByUserId: string;
}

export interface RoomState {
  roomId: string;
  roomCode: string;
  hostId: string;
  participants: ParticipantData[];
  videoState: VideoState;
  messages: ChatMessage[];
  queue: QueueItem[];
}

export interface SyncPayload {
  videoState: VideoState;
  participants: ParticipantData[];
}
