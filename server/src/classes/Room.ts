import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { Participant } from './Participant';
import { VideoState, ChatMessage, RoomState, Role, ParticipantData, QueueItem } from '../types';

const DEFAULT_VIDEO_ID = 'LBqE4YOvhyc';

export class Room {
  roomId: string;
  roomCode: string;
  hostId: string;
  participants: Map<string, Participant>;
  videoState: VideoState;
  messages: ChatMessage[];
  queue: QueueItem[];
  private io: Server;
  createdAt: number;

  constructor(io: Server, roomCode: string, hostParticipant: Participant, initialVideoId?: string) {
    this.roomId = uuidv4();
    this.roomCode = roomCode;
    this.io = io;
    this.hostId = hostParticipant.userId;
    this.participants = new Map();
    this.messages = [];
    this.queue = [];
    this.createdAt = Date.now();
    this.videoState = {
      videoId: initialVideoId || DEFAULT_VIDEO_ID,
      playing: false,
      currentTime: 0,
      updatedAt: Date.now(),
    };
    this.addParticipant(hostParticipant);
  }

  addParticipant(participant: Participant): void {
    this.participants.set(participant.userId, participant);
    participant.socketId && this.io.in(participant.socketId).socketsJoin(this.roomId);
  }

  removeParticipant(userId: string): Participant | undefined {
    const p = this.participants.get(userId);
    if (p) {
      this.io.in(p.socketId).socketsLeave(this.roomId);
      this.participants.delete(userId);
    }
    return p;
  }

  getParticipant(userId: string): Participant | undefined {
    return this.participants.get(userId);
  }

  getParticipantBySocket(socketId: string): Participant | undefined {
    for (const p of this.participants.values()) {
      if (p.socketId === socketId) return p;
    }
    return undefined;
  }

  assignRole(targetUserId: string, role: Role): boolean {
    const target = this.participants.get(targetUserId);
    if (!target) return false;
    if (role === 'host') return false;
    target.setRole(role);
    return true;
  }

  transferHost(newHostId: string): boolean {
    const current = this.participants.get(this.hostId);
    const newHost = this.participants.get(newHostId);
    if (!current || !newHost) return false;
    current.setRole('participant');
    newHost.setRole('host');
    this.hostId = newHostId;
    return true;
  }

  updateVideoState(patch: Partial<VideoState>): void {
    this.videoState = { ...this.videoState, ...patch, updatedAt: Date.now() };
  }

  addMessage(msg: ChatMessage): void {
    this.messages.push(msg);
    if (this.messages.length > 200) this.messages.shift();
  }

  addToQueue(item: QueueItem): void {
    this.queue.push(item);
  }

  removeFromQueue(index: number): void {
    this.queue.splice(index, 1);
  }

  playNext(): QueueItem | null {
    if (this.queue.length === 0) return null;
    const next = this.queue.shift()!;
    this.updateVideoState({ videoId: next.videoId, playing: false, currentTime: 0 });
    return next;
  }

  getParticipantsData(): ParticipantData[] {
    return Array.from(this.participants.values()).map((p) => p.toData());
  }

  broadcast(event: string, data: unknown): void {
    this.io.to(this.roomId).emit(event, data);
  }

  broadcastExcept(exceptSocketId: string, event: string, data: unknown): void {
    this.io.to(this.roomId).except(exceptSocketId).emit(event, data);
  }

  isEmpty(): boolean {
    return this.participants.size === 0;
  }

  toState(): RoomState {
    return {
      roomId: this.roomId,
      roomCode: this.roomCode,
      hostId: this.hostId,
      participants: this.getParticipantsData(),
      videoState: this.videoState,
      messages: this.messages.slice(-50),
      queue: this.queue,
    };
  }
}
