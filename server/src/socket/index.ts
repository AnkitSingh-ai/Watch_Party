import { Server, Socket } from 'socket.io';
import { RoomManager } from '../classes/RoomManager';
import { MessageHandler } from '../classes/MessageHandler';

export function initSocket(io: Server): RoomManager {
  const roomManager = new RoomManager(io);
  const handler = new MessageHandler(io, roomManager);

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('join_room', (data) => handler.handleJoinRoom(socket, data));
    socket.on('leave_room', (data) => handler.handleLeaveRoom(socket, data));
    socket.on('play', (data) => handler.handlePlay(socket, data));
    socket.on('pause', (data) => handler.handlePause(socket, data));
    socket.on('seek', (data) => handler.handleSeek(socket, data));
    socket.on('change_video', (data) => handler.handleChangeVideo(socket, data));
    socket.on('assign_role', (data) => handler.handleAssignRole(socket, data));
    socket.on('remove_participant', (data) => handler.handleRemoveParticipant(socket, data));
    socket.on('transfer_host', (data) => handler.handleTransferHost(socket, data));
    socket.on('chat_message', (data) => handler.handleChatMessage(socket, data));
    socket.on('emoji_reaction', (data) => handler.handleEmojiReaction(socket, data));
    socket.on('add_to_queue', (data) => handler.handleAddToQueue(socket, data));
    socket.on('remove_from_queue', (data) => handler.handleRemoveFromQueue(socket, data));
    socket.on('play_next', (data) => handler.handlePlayNext(socket, data));
    socket.on('request_sync', (data) => handler.handleRequestSync(socket, data));
    socket.on('disconnect', () => handler.handleDisconnect(socket));
  });

  return roomManager;
}
