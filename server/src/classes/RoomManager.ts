import { Server } from 'socket.io';
import { customAlphabet } from 'nanoid';
import { Room } from './Room';
import { Participant } from './Participant';
import { ParticipantData } from '../types';

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  createRoom(hostData: Omit<ParticipantData, 'role' | 'joinedAt'>, roomCode?: string, videoId?: string): Room {
    const code = roomCode || nanoid();
    const host = new Participant({ ...hostData, role: 'host', joinedAt: Date.now() });
    const room = new Room(this.io, code, host, videoId);
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  getRoomById(roomId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.roomId === roomId) return room;
    }
    return undefined;
  }

  joinRoom(code: string, participantData: Omit<ParticipantData, 'role' | 'joinedAt'>): { room: Room; participant: Participant } | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    // Check if user already exists (reconnect)
    let participant = room.getParticipant(participantData.userId);
    if (participant) {
      participant.updateSocket(participantData.socketId);
      this.io.in(participantData.socketId).socketsJoin(room.roomId);
    } else {
      participant = new Participant({ ...participantData, role: 'participant', joinedAt: Date.now() });
      room.addParticipant(participant);
    }
    return { room, participant };
  }

  handleDisconnect(socketId: string): { room: Room; participant: Participant } | null {
    for (const room of this.rooms.values()) {
      const participant = room.getParticipantBySocket(socketId);
      if (participant) {
        room.removeParticipant(participant.userId);
        // If host left and there are still participants, promote the first one
        if (participant.userId === room.hostId && room.participants.size > 0) {
          const next = Array.from(room.participants.values())[0];
          next.setRole('host');
          room.hostId = next.userId;
        }
        // Clean up empty rooms
        if (room.isEmpty()) {
          this.rooms.delete(room.roomCode);
        }
        return { room, participant };
      }
    }
    return null;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}
