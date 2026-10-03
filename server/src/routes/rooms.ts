import { Router, Request, Response } from 'express';
import { RoomManager } from '../classes/RoomManager';

export function createRoomsRouter(roomManager: RoomManager): Router {
  const router = Router();

  // GET /api/rooms/:code - Check if a room exists
  router.get('/:code', (req: Request, res: Response) => {
    const { code } = req.params;
    const room = roomManager.getRoom(code.toUpperCase());
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    res.json({
      roomId: room.roomId,
      roomCode: room.roomCode,
      participantCount: room.participants.size,
      videoState: room.videoState,
    });
  });

  // GET /api/rooms - Stats (for debugging)
  router.get('/', (_req: Request, res: Response) => {
    res.json({ roomCount: roomManager.getRoomCount() });
  });

  return router;
}
