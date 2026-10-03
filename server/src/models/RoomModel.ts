import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomDocument extends Document {
  roomId: string;
  roomCode: string;
  hostId: string;
  videoId: string;
  participantCount: number;
  createdAt: Date;
  lastActive: Date;
}

const RoomSchema = new Schema<IRoomDocument>({
  roomId:           { type: String, required: true, unique: true },
  roomCode:         { type: String, required: true, unique: true, uppercase: true },
  hostId:           { type: String, required: true },
  videoId:          { type: String, default: 'LBqE4YOvhyc' },
  participantCount: { type: Number, default: 1 },
  lastActive:       { type: Date, default: Date.now },
  createdAt:        { type: Date, default: Date.now, expires: 86400 }, // auto-delete after 24h
});

// Update lastActive before every save
RoomSchema.pre('save', function (next) {
  this.lastActive = new Date();
  next();
});

export const RoomModel = mongoose.model<IRoomDocument>('Room', RoomSchema);
