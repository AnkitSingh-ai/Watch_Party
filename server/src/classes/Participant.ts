import { Role, ParticipantData } from '../types';

export class Participant {
  userId: string;
  username: string;
  socketId: string;
  role: Role;
  joinedAt: number;

  constructor(data: ParticipantData) {
    this.userId = data.userId;
    this.username = data.username;
    this.socketId = data.socketId;
    this.role = data.role;
    this.joinedAt = data.joinedAt || Date.now();
  }

  canControl(): boolean {
    return this.role === 'host' || this.role === 'moderator';
  }

  canAssignRoles(): boolean {
    return this.role === 'host';
  }

  canRemoveParticipants(): boolean {
    return this.role === 'host';
  }

  canTransferHost(): boolean {
    return this.role === 'host';
  }

  setRole(role: Role): void {
    this.role = role;
  }

  updateSocket(socketId: string): void {
    this.socketId = socketId;
  }

  toData(): ParticipantData {
    return {
      userId: this.userId,
      username: this.username,
      role: this.role,
      socketId: this.socketId,
      joinedAt: this.joinedAt,
    };
  }
}
