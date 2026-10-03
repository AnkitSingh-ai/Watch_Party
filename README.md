# 🎬 WatchParty — YouTube Watch Party App

Watch YouTube videos together in real-time with friends. Full sync across play, pause, seek, and video changes — powered by WebSockets.

## 🚀 Live Demo

> **Deploy URL:** *(Add your Render/Vercel URL here after deployment)*

---

## ✨ Features

- 🎬 **YouTube IFrame API** — Embedded, controllable YouTube player
- ⚡ **Real-time sync** — Play/pause/seek/change video synced to all participants instantly via Socket.IO
- 🏠 **Room-based model** — Create rooms with unique codes; join via code or link
- 👑 **Role-Based Access Control** — Host / Moderator / Participant with full permission enforcement
- 💬 **Live Chat** — Real-time text chat in every room
- 📋 **Participant list** — See all participants with role badges
- 🔧 **Host controls** — Assign roles, remove participants, transfer host
- 📱 **Mobile responsive** — Works on all screen sizes
- 🌙 **Dark UI** — Glassmorphism-style dark theme

## 🧑‍💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Real-time | Socket.IO (WebSocket) |
| Database | MongoDB + Mongoose |
| Video | YouTube IFrame API |
| OOP | Room, Participant, MessageHandler classes |

---

## 🏗️ Project Structure

```
web3task/
├── server/                    # Node.js + Express backend
│   └── src/
│       ├── classes/
│       │   ├── Participant.ts  # OOP Participant model
│       │   ├── Room.ts         # OOP Room with broadcast methods
│       │   ├── RoomManager.ts  # Manages all active rooms
│       │   └── MessageHandler.ts # WebSocket event handler
│       ├── models/
│       │   └── RoomModel.ts    # MongoDB schema
│       ├── routes/
│       │   └── rooms.ts        # REST API routes
│       ├── socket/
│       │   └── index.ts        # Socket.IO setup
│       └── index.ts            # Server entry point
│
└── client/                    # React frontend
    └── src/
        ├── context/
        │   └── RoomContext.tsx  # Global room state
        ├── hooks/
        │   └── useSocket.ts     # Socket.IO hook
        ├── components/
        │   ├── VideoPlayer.tsx  # YouTube IFrame wrapper
        │   ├── Controls.tsx     # Playback controls
        │   ├── ParticipantList.tsx # Sidebar with roles
        │   ├── Chat.tsx         # Real-time chat
        │   └── Toast.tsx        # Notification toasts
        └── pages/
            ├── Home.tsx         # Create/Join room
            └── Room.tsx         # Watch party room
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (optional — app runs without DB)

### 1. Clone & Install

```bash
# Clone
git clone <your-repo-url>
cd web3task

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

**Server** — create `server/.env`:
```env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/watchparty
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client** — create `client/.env`:
```env
VITE_SERVER_URL=http://localhost:3001
```

### 3. Run Dev Servers

Open two terminals:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 🌐 Deployment

### Render (Recommended for Backend)

1. Push to GitHub
2. Create a new **Web Service** on Render
3. Set **Root Directory** to `server`
4. Build command: `npm install && npm run build`
5. Start command: `node dist/index.js`
6. Add env vars: `MONGODB_URI`, `CLIENT_URL`, `NODE_ENV=production`

### Vercel (Frontend)

1. Import repo on Vercel
2. Set **Root Directory** to `client`
3. Add env var: `VITE_SERVER_URL=https://your-render-backend.onrender.com`
4. Deploy

---

## 🔌 WebSocket Architecture

```
Client (React)
    │
    │  Socket.IO (WebSocket / polling fallback)
    │
Server (Node.js + Express)
    │
    ├── MessageHandler.handleJoinRoom()
    │     └── RoomManager.createRoom() / joinRoom()
    │           └── Room.addParticipant()
    │                 └── io.to(roomId).emit('room_joined', ...)
    │
    ├── MessageHandler.handlePlay()
    │     ├── Participant.canControl() → validate permission
    │     └── Room.broadcast('sync_state', videoState)
    │
    └── MessageHandler.handleAssignRole()
          ├── Participant.canAssignRoles() → host only
          └── Room.broadcast('role_assigned', participants)
```

### Event Flow

| Event | Direction | Who Can Send |
|-------|-----------|-------------|
| `join_room` | Client→Server | Anyone |
| `play/pause/seek` | Client→Server | Host, Moderator |
| `change_video` | Client→Server | Host, Moderator |
| `assign_role` | Client→Server | Host only |
| `remove_participant` | Client→Server | Host only |
| `transfer_host` | Client→Server | Host only |
| `chat_message` | Client→Server | Anyone |
| `sync_state` | Server→Clients | Broadcast |
| `user_joined/left` | Server→Clients | Broadcast |
| `role_assigned` | Server→Clients | Broadcast |

---

## 🔒 Role-Based Access Control

```
Host (creator)
  ├── Full playback control (play/pause/seek/change video)
  ├── Assign roles to participants
  ├── Remove participants
  └── Transfer host to another participant

Moderator (assigned by host)
  ├── Full playback control
  └── (Cannot assign roles or remove participants)

Participant (default for joiners)
  └── Watch only — all controls are server-validated and rejected
```

**Server validates permissions before executing any event** — even if a client sends a forged `play` event, the server checks `participant.canControl()` and rejects it.

---

## 🏛️ OOP Design (Bonus)

```typescript
class Participant {
  canControl()          // host or moderator
  canAssignRoles()      // host only
  canRemoveParticipants() // host only
  canTransferHost()     // host only
}

class Room {
  addParticipant()      // join Socket.IO room
  removeParticipant()   // leave Socket.IO room
  assignRole()          // update role
  transferHost()        // promote new host
  broadcast()           // io.to(roomId).emit()
  updateVideoState()    // patch video state
}

class RoomManager {
  createRoom()          // new room + host
  joinRoom()            // add participant or reconnect
  handleDisconnect()    // cleanup on socket drop
}

class MessageHandler {
  // Routes + validates all socket events
  handlePlay(), handlePause(), handleSeek()
  handleAssignRole(), handleRemoveParticipant()
  handleTransferHost(), handleChatMessage()
}
```

---

## 📝 License

MIT
