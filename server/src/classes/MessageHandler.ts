import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { RoomManager } from './RoomManager';
import { Role } from '../types';

export class MessageHandler {
  private roomManager: RoomManager;
  private io: Server;

  constructor(io: Server, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  handleJoinRoom(socket: Socket, data: { roomCode: string; username: string; userId: string; isCreating?: boolean; videoId?: string }) {
    const { roomCode, username, userId, isCreating, videoId } = data;
    if (!roomCode || !username || !userId) {
      socket.emit('error_event', { message: 'Missing required fields' });
      return;
    }
    let room;
    let participant;
    if (isCreating) {
      const existingRoom = this.roomManager.getRoom(roomCode);
      if (existingRoom) {
        if (videoId) existingRoom.updateVideoState({ videoId, playing: false, currentTime: 0 });
        const result = this.roomManager.joinRoom(roomCode, { userId, username, socketId: socket.id });
        if (!result) { socket.emit('error_event', { message: 'Failed to create room' }); return; }
        room = result.room; participant = result.participant;
      } else {
        room = this.roomManager.createRoom({ userId, username, socketId: socket.id }, roomCode, videoId);
        const p = room.getParticipant(userId);
        if (!p) { socket.emit('error_event', { message: 'Failed to create room' }); return; }
        participant = p;
        socket.join(room.roomId);
      }
    } else {
      const result = this.roomManager.joinRoom(roomCode, { userId, username, socketId: socket.id });
      if (!result) { socket.emit('error_event', { message: 'Room not found. Check your room code.' }); return; }
      room = result.room; participant = result.participant;
      socket.join(room.roomId);
    }
    const participants = room.getParticipantsData();
    socket.emit('room_joined', {
      roomId: room.roomId, roomCode: room.roomCode, hostId: room.hostId,
      participant: participant.toData(), participants,
      videoState: room.videoState, messages: room.messages.slice(-50), queue: room.queue,
    });
    socket.to(room.roomId).emit('user_joined', {
      userId: participant.userId, username: participant.username,
      role: participant.role, participants,
    });
    console.log(`[${room.roomCode}] ${username} joined as ${participant.role}`);
  }

  handlePlay(socket: Socket, data: { roomCode: string; userId: string; currentTime: number }) {
    const { roomCode, userId, currentTime } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant?.canControl()) { socket.emit('error_event', { message: 'No permission to control playback' }); return; }
    room.updateVideoState({ playing: true, currentTime });
    room.broadcast('sync_state', { videoState: room.videoState, triggeredBy: userId, action: 'play' });
  }

  handlePause(socket: Socket, data: { roomCode: string; userId: string; currentTime: number }) {
    const { roomCode, userId, currentTime } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant?.canControl()) { socket.emit('error_event', { message: 'No permission to control playback' }); return; }
    room.updateVideoState({ playing: false, currentTime });
    room.broadcast('sync_state', { videoState: room.videoState, triggeredBy: userId, action: 'pause' });
  }

  handleSeek(socket: Socket, data: { roomCode: string; userId: string; time: number }) {
    const { roomCode, userId, time } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant?.canControl()) { socket.emit('error_event', { message: 'No permission to seek' }); return; }
    room.updateVideoState({ currentTime: time });
    room.broadcast('sync_state', { videoState: room.videoState, triggeredBy: userId, action: 'seek' });
  }

  handleChangeVideo(socket: Socket, data: { roomCode: string; userId: string; videoId: string }) {
    const { roomCode, userId, videoId } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant?.canControl()) { socket.emit('error_event', { message: 'No permission to change video' }); return; }
    room.updateVideoState({ videoId, playing: false, currentTime: 0 });
    room.broadcast('sync_state', { videoState: room.videoState, triggeredBy: userId, action: 'change_video' });
    room.broadcast('video_changed', { videoId, changedBy: participant.username });
  }

  handleAssignRole(socket: Socket, data: { roomCode: string; userId: string; targetUserId: string; role: Role }) {
    const { roomCode, userId, targetUserId, role } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant?.canAssignRoles()) { socket.emit('error_event', { message: 'Only the host can assign roles' }); return; }
    if (targetUserId === userId) { socket.emit('error_event', { message: 'Cannot change your own role' }); return; }
    const success = room.assignRole(targetUserId, role);
    if (!success) { socket.emit('error_event', { message: 'Failed to assign role' }); return; }
    const target = room.getParticipant(targetUserId);
    const participants = room.getParticipantsData();
    room.broadcast('role_assigned', { userId: targetUserId, username: target?.username, role, participants });
  }

  handleRemoveParticipant(socket: Socket, data: { roomCode: string; userId: string; targetUserId: string }) {
    const { roomCode, userId, targetUserId } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant?.canRemoveParticipants()) { socket.emit('error_event', { message: 'Only the host can remove participants' }); return; }
    if (targetUserId === userId) { socket.emit('error_event', { message: 'Cannot remove yourself' }); return; }
    const target = room.getParticipant(targetUserId);
    if (!target) return;
    const targetSocketId = target.socketId;
    room.removeParticipant(targetUserId);
    const participants = room.getParticipantsData();
    this.io.to(targetSocketId).emit('you_were_removed', { message: 'You have been removed from the room by the host' });
    this.io.in(targetSocketId).socketsLeave(room.roomId);
    room.broadcast('participant_removed', { userId: targetUserId, participants });
  }

  handleTransferHost(socket: Socket, data: { roomCode: string; userId: string; targetUserId: string }) {
    const { roomCode, userId, targetUserId } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant?.canTransferHost()) { socket.emit('error_event', { message: 'Only the host can transfer host' }); return; }
    const success = room.transferHost(targetUserId);
    if (!success) { socket.emit('error_event', { message: 'Failed to transfer host' }); return; }
    const newHost = room.getParticipant(targetUserId);
    const participants = room.getParticipantsData();
    room.broadcast('host_transferred', { newHostId: targetUserId, newHostName: newHost?.username, participants });
  }

  handleChatMessage(socket: Socket, data: { roomCode: string; userId: string; username: string; message: string }) {
    const { roomCode, userId, username, message } = data;
    if (!message?.trim()) return;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant) return;
    const chatMsg = { id: uuidv4(), userId, username: participant.username, message: message.trim().slice(0, 500), timestamp: Date.now() };
    room.addMessage(chatMsg);
    room.broadcast('chat_message', chatMsg);
  }

  handleEmojiReaction(socket: Socket, data: { roomCode: string; userId: string; username: string; emoji: string }) {
    const { roomCode, userId, username, emoji } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant) return;
    room.broadcast('emoji_reaction', { id: uuidv4(), emoji, userId, username: participant.username, timestamp: Date.now() });
  }

  handleAddToQueue(socket: Socket, data: { roomCode: string; userId: string; videoId: string; title: string }) {
    const { roomCode, userId, videoId, title } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant?.canControl()) { socket.emit('error_event', { message: 'Only host/moderator can manage the queue' }); return; }
    if (room.queue.length >= 20) { socket.emit('error_event', { message: 'Queue is full (max 20)' }); return; }
    const item = { id: uuidv4(), videoId, title: title || 'Unknown Video', addedBy: participant.username, addedByUserId: userId };
    room.addToQueue(item);
    room.broadcast('queue_updated', { queue: room.queue });
  }

  handleRemoveFromQueue(socket: Socket, data: { roomCode: string; userId: string; index: number }) {
    const { roomCode, userId, index } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant?.canControl()) { socket.emit('error_event', { message: 'Only host/moderator can manage the queue' }); return; }
    room.removeFromQueue(index);
    room.broadcast('queue_updated', { queue: room.queue });
  }

  handlePlayNext(socket: Socket, data: { roomCode: string; userId: string }) {
    const { roomCode, userId } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant?.canControl()) { socket.emit('error_event', { message: 'Only host/moderator can skip to next' }); return; }
    const next = room.playNext();
    if (!next) { socket.emit('error_event', { message: 'Queue is empty' }); return; }
    room.broadcast('sync_state', { videoState: room.videoState, triggeredBy: userId, action: 'change_video' });
    room.broadcast('video_changed', { videoId: next.videoId, changedBy: participant.username });
    room.broadcast('queue_updated', { queue: room.queue });
  }

  handleRequestSync(socket: Socket, data: { roomCode: string; userId: string }) {
    const { roomCode } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    socket.emit('sync_state', { videoState: room.videoState, triggeredBy: 'sync_request', action: 'sync' });
  }

  handleLeaveRoom(socket: Socket, data: { roomCode: string; userId: string }) {
    const { roomCode, userId } = data;
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    const participant = room.getParticipant(userId);
    if (!participant) return;
    const wasHost = participant.userId === room.hostId;
    room.removeParticipant(userId);
    if (wasHost && room.participants.size > 0) {
      const next = Array.from(room.participants.values())[0];
      next.setRole('host');
      room.hostId = next.userId;
    }
    socket.leave(room.roomId);
    const participants = room.getParticipantsData();
    socket.to(room.roomId).emit('user_left', { userId, username: participant.username, participants, newHostId: room.hostId });
  }

  handleDisconnect(socket: Socket) {
    const result = this.roomManager.handleDisconnect(socket.id);
    if (!result) return;
    const { room, participant } = result;
    const participants = room.getParticipantsData();
    room.broadcast('user_left', { userId: participant.userId, username: participant.username, participants, newHostId: room.hostId });
  }
}
