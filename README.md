# 🎬 WatchParty

WatchParty lets friends watch YouTube videos together in the same online room.
Everyone stays in sync when the host plays, pauses, seeks, or changes a video.
The app also includes live chat, participant roles, and host controls.

## 🚀 Live Deployment

The frontend is available here:

[Open WatchParty](https://watch-party-ktbe.onrender.com)

The backend runs as a separate Render service. Add its public URL here once it
is available.

---

## ✨ Features

- 🎬 Watch YouTube videos together with synchronized playback
- ⚡ Keep play, pause, seek, and video changes synchronized in real time
- 🏠 Create a room and invite others with a room code or link
- 👑 Give participants host, moderator, or viewer permissions
- 💬 Chat with everyone in the room
- 📋 See who is currently watching
- 🔧 Manage roles, remove participants, and transfer host controls
- 📱 Use the app comfortably on desktop and mobile
- 🌙 Enjoy a dark, modern interface

## 🧑‍💻 Tech Stack

| Part | Technology |
|------|-----------|
| Frontend | React, TypeScript, Vite, and Tailwind CSS |
| Backend | Node.js and Express |
| Real-time features | Socket.IO |
| Database | MongoDB with Mongoose |
| Video player | YouTube IFrame API |

---

## 📁 Project Structure

The project is split into a frontend and a backend:

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

## ⚙️ Run WatchParty locally

Follow the steps below to run the application on your computer.

### What you need

- Node.js 18 or newer
- npm
- A MongoDB Atlas account (optional; the app can run in memory without it)

### 1. Download the project

```bash
git clone https://github.com/AnkitSingh-ai/Watch_Party.git
cd Watch_Party
```

### 2. Install the packages

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Add your local settings

Create a file named `server/.env`:
```env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/watchparty
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create a file named `client/.env`:
```env
VITE_SERVER_URL=http://localhost:3001
```

### 4. Start the app

Open two terminal windows. Run the backend in the first one:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# In the second terminal, start the frontend
cd client
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.
The backend listens on port `3001`.

---

## 🌐 Deploy on Render

WatchParty uses two Render services:

- **Backend**: Node.js Web Service
- **Frontend**: Static Site

### Backend service

Create a Render **Web Service** from this repository and use:

- **Root Directory:** `server`
- **Build Command:** `npm install --include=dev && npm run build`
- **Start Command:** `node dist/index.js`

Add these environment variables in Render. Keep `MONGODB_URI` private:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/watchparty?retryWrites=true&w=majority
CLIENT_URL=https://<your-frontend-service>.onrender.com
```

### Frontend service

Create a Render **Static Site** from the same repository and use:

- **Root Directory:** `client`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

Add this environment variable:

```env
VITE_SERVER_URL=https://<your-backend-service>.onrender.com
```

### MongoDB setup

Before the backend can connect to MongoDB:

1. Create a MongoDB Atlas cluster
2. Create a database user
3. Copy the connection string into `MONGODB_URI`
4. Allow network access for Render

For a quick deployment, allow Render to connect by adding this IP range in
MongoDB Atlas:

```text
0.0.0.0/0
```

### After deployment

- Open the frontend URL
- Create a room and join it from another browser window
- Test chat, playback controls, and participant permissions

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
