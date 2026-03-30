# Video_conferencing

# Smart-Meet 🎥

A full-stack video conferencing web application built with React, Node.js, MongoDB, Socket.io, and Agora RTC/RTM.

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Application Flow](#application-flow)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)

---

## 📖 About

Smart-Meet is a real-time video conferencing application that allows users to create and join meeting rooms instantly. It supports video/audio calls, in-meeting chat, and screen sharing — similar to Google Meet or Zoom.

---

## ✨ Features

- 🔐 **User Authentication** — Register and login with JWT tokens
- 🎥 **Video Calls** — Real-time video/audio using Agora RTC
- 💬 **In-Meet Chat** — Real-time messaging using Agora RTM
- 🖥️ **Screen Sharing** — Share your screen with participants
- 🔇 **Mute/Unmute** — Toggle microphone on/off
- 📷 **Camera Toggle** — Turn camera on/off
- 🏠 **Create Rooms** — Instantly create a meeting room
- 🔗 **Join Rooms** — Join existing rooms via Room ID
- 📅 **Scheduled Meetings** — Schedule meetings for later
- 🔒 **Protected Routes** — Only logged-in users can access rooms
- 👥 **Multiple Participants** — Multiple users can join the same room

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI framework |
| React Router DOM | Client-side routing |
| Agora RTC SDK | Video/audio calls |
| Agora RTM SDK | Real-time messaging/chat |
| Socket.io Client | Real-time room events |
| Axios | HTTP requests |
| Context API | Global state management |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| MongoDB + Mongoose | Database |
| Socket.io | Real-time communication |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| dotenv | Environment variables |

---

## 📁 Project Structure

```
smart-meet/
├── client/                         # React frontend
│   └── src/
│       ├── components/             # Reusable UI components
│       ├── context/
│       │   └── AuthContext.js      # Global auth state
│       ├── pages/
│       │   ├── Login.js            # Login page
│       │   ├── Register.js         # Register page
│       │   ├── Home.js             # Home/dashboard page
│       │   └── Room.js             # Video call room page
│       ├── protectedRoute/
│       │   └── ProtectedRoute.js   # Route guard for auth
│       ├── styles/
│       │   ├── Auth.css            # Login/Register styles
│       │   ├── Home.css            # Home page styles
│       │   └── Room.css            # Room page styles
│       ├── AgoraSetup.js           # Agora RTC configuration
│       ├── AgoraRTMSetup.js        # Agora RTM configuration
│       ├── Socket.js               # Socket.io client setup
│       └── App.js                  # Main app with routes
│
└── server/                         # Node.js backend
    ├── controllers/
    │   └── auth.js                 # Register & login logic
    ├── middleware/
    │   └── auth.js                 # JWT verification
    ├── models/
    │   ├── User.js                 # User MongoDB schema
    │   └── Rooms.js                # Room MongoDB schema
    ├── routes/
    │   └── auth.js                 # Auth API routes
    ├── socket/
    │   └── roomHandler.js          # Socket.io room events
    ├── .env                        # Environment variables
    └── index.js                    # Server entry point
```

---

## ✅ Prerequisites

Make sure you have these installed before running the project:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v8 or higher
- [Git](https://git-scm.com/)
- [MongoDB Atlas](https://cloud.mongodb.com/) account (free)
- [Agora](https://console.agora.io/) account (free) with a project in **Testing mode**

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-meet.git
cd smart-meet
```

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Install client dependencies

```bash
cd ../client
npm install
```

---

## 🔐 Environment Variables

### Server — create `server/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/smartmeet?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
AGORA_APP_ID=your_agora_app_id
```

### Client — create `client/.env`

```env
REACT_APP_AGORA_APP_ID=your_agora_app_id
```

> **Note:** Never commit `.env` files to GitHub. They are already in `.gitignore`.

---

## 🚀 Running the App

You need **two terminals** running at the same time:

### Terminal 1 — Start the server

```bash
cd server
node index.js
```

You should see:
```
MongoDB connected!
Server running on port 5000
```

### Terminal 2 — Start the client

```bash
cd client
npm start
```

The app will open at `http://localhost:3000`

---

## 🔄 Application Flow

### Host
1. Register/Login
2. Create a room (instant or scheduled)
3. Share the Room ID with participants
4. Manage video/audio controls
5. Use in-meet chat
6. Share screen if needed
7. End meeting by leaving room

### Participant
1. Register/Login
2. Enter Room ID on Home page
3. Join the room
4. Engage in video call and chat
5. Share screen if needed
6. Leave room when done

---

## 📡 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |

### Register Request Body
```json
{
  "username": "John",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login Request Body
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response (both endpoints)
```json
{
  "message": "Success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f3a2b1c4e5d6f7a8b9c0d1",
    "username": "John",
    "email": "john@example.com"
  }
}
```

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `join-room` | Client → Server | User joins a room |
| `user-joined` | Server → Client | Notify others of new user |
| `leave-room` | Client → Server | User leaves a room |
| `user-left` | Server → Client | Notify others user left |
| `room-users` | Server → Client | List of users in room |

---

## 🗄️ Database Models

### User Model
| Field | Type | Required |
|---|---|---|
| username | String | Yes |
| email | String | Yes (unique) |
| password | String | Yes (hashed) |
| createdAt | Date | Auto |

### Room Model
| Field | Type | Required |
|---|---|---|
| roomId | String | Yes (unique) |
| roomName | String | Yes |
| host | ObjectId (User) | Yes |
| participants | [ObjectId] | No |
| meetType | String | instant/scheduled |
| meetTimings | Date | No |
| isActive | Boolean | Default true |

---

## 👩‍💻 Developer

**Payal Pal**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

---

## 📄 License

This project is for educational purposes.
