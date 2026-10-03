import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import { initSocket } from './socket';
import { createRoomsRouter } from './routes/rooms';
import { RoomModel } from './models/RoomModel';

// Force Google DNS (8.8.8.8) to bypass ISP DNS that blocks MongoDB Atlas SRV records
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

dotenv.config();

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = parseInt(process.env.PORT || '3001', 10);
const MONGODB_URI = process.env.MONGODB_URI || '';

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ─── SOCKET.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const roomManager = initSocket(io);

// ─── MONGODB CONNECTION ───────────────────────────────────────────────────────
let dbConnected = false;

async function connectMongoDB(): Promise<void> {
  if (!MONGODB_URI) {
    console.log('⚠️  No MONGODB_URI set — running in memory-only mode');
    return;
  }

  mongoose.set('strictQuery', false);

  // Connection event listeners
  mongoose.connection.on('connected', () => {
    dbConnected = true;
    console.log('✅ MongoDB connected successfully');
  });

  mongoose.connection.on('disconnected', () => {
    dbConnected = false;
    console.warn('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    dbConnected = false;
    console.error('❌ MongoDB error:', err.message);
  });

  mongoose.connection.on('reconnected', () => {
    dbConnected = true;
    console.log('🔄 MongoDB reconnected');
  });

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30s timeout for slow connections
      connectTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      maxPoolSize: 10,
    });
  } catch (err: any) {
    console.error('❌ Initial MongoDB connection failed:', err.message);
    console.log('💡 Retrying in 5 seconds...');
    setTimeout(connectMongoDB, 5000);
  }
}

// ─── REST ROUTES ──────────────────────────────────────────────────────────────
app.use('/api/rooms', createRoomsRouter(roomManager));

// Live stats endpoint
app.get('/api/stats', (_req, res) => {
  res.json({
    activeRooms: roomManager.getRoomCount(),
    dbConnected,
    timestamp: Date.now(),
  });
});

// Health check — shows full system status
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    rooms: roomManager.getRoomCount(),
    database: dbConnected ? 'connected' : (MONGODB_URI ? 'disconnected' : 'not configured'),
    uptime: Math.floor(process.uptime()),
    timestamp: Date.now(),
  });
});

app.get('/', (_req, res) => {
  res.json({ message: 'YouTube Watch Party Server', version: '2.0.0' });
});

// ─── ROOM PERSISTENCE (sync in-memory rooms to MongoDB) ───────────────────────
// Hook into room creation — write to DB whenever a new room is made
// We use a simple polling approach to sync the in-memory state to DB every 30s
setInterval(async () => {
  if (!dbConnected) return;
  try {
    const rooms = roomManager.getAllRooms();
    for (const room of rooms) {
      await RoomModel.findOneAndUpdate(
        { roomCode: room.roomCode },
        {
          roomId: room.roomId,
          roomCode: room.roomCode,
          hostId: room.hostId,
          videoId: room.videoState.videoId,
          participantCount: room.participants.size,
          lastActive: new Date(),
        },
        { upsert: true, new: true }
      );
    }
  } catch (err: any) {
    // Silently fail — in-memory state is source of truth
  }
}, 30000); // every 30 seconds

// ─── START ────────────────────────────────────────────────────────────────────
// Start HTTP server IMMEDIATELY — app works even if MongoDB is slow/down
server.listen(PORT, () => {
  console.log(`🚀 Watch Party Server running on port ${PORT}`);
  console.log(`🌐 Accepting connections from: ${CLIENT_URL}`);
});

// Connect MongoDB non-blocking in background
connectMongoDB();

export default app;
