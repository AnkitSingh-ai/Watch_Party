# 🎬 WatchParty — YouTube Watch Party App

Watch YouTube videos together in real-time with friends. Full sync across play, pause, seek, and video changes — powered by WebSockets.

## 🚀 Live Deployment

The application is deployed as two Render services:

- **Frontend:** [WatchParty live app](https://watch-party-ktbe.onrender.com)
- **Backend:** [Add the live backend URL here](https://your-backend-service.onrender.com)

> Replace the placeholder URLs above with the actual URLs from your Render dashboard
> after both services finish deploying.

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

## ⚙️ Setup and Run Instructions

Follow these steps to run WatchParty locally.

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (optional — app runs without DB)

### 1. Clone the repository

```bash
git clone https://github.com/AnkitSingh-ai/Watch_Party.git
cd Watch_Party
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure environment variables

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

### 4. Run the application

Open two terminals:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The backend runs on `http://localhost:3001` and the frontend runs on
`http://localhost:5173`.

---

## 🌐 Deploying on Render

This project is set up to deploy as **two services** on Render:

- **Backend**: Node.js Web Service
- **Frontend**: Static Site

### 1) Backend setup

Create a new **Web Service** in Render and connect this GitHub repository.

Use these settings:

- **Root Directory:** `server`
- **Build Command:** `npm install --include=dev && npm run build`
- **Start Command:** `node dist/index.js`

Add these environment variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/watchparty?retryWrites=true&w=majority
CLIENT_URL=https://<your-frontend-service>.onrender.com
```

### 2) Frontend setup

Create a new **Static Site** in Render and connect the same repository.

Use these settings:

- **Root Directory:** `client`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

Add this environment variable:

```env
VITE_SERVER_URL=https://<your-backend-service>.onrender.com
```

### 3) MongoDB Atlas checklist

Before the backend can connect to your database:

1. Create a MongoDB Atlas cluster
2. Create a database user
3. Copy the connection string into `MONGODB_URI`
4. Allow network access for Render

If needed, add this IP address in MongoDB Atlas:

```text
0.0.0.0/0
```

### 4) After deployment

- Open the frontend Render URL
- Make sure the frontend is using the deployed backend URL
- Confirm rooms, chat, and playback sync work correctly

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
