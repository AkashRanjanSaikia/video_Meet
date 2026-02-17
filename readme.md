# 🎥 VideoMeet

VideoMeet is a full-stack, real-time video meeting application that lets users join or create a room and communicate through live video, audio, and chat directly in the browser.  
It demonstrates how modern video conferencing works using WebRTC for peer-to-peer media and Socket.IO for signaling and messaging.

This repository contains:
- A backend Node.js/Express server with Socket.IO and MongoDB
- A frontend React (Vite) application for the user interface

## Tech Stack
- React.js (Vite)
- Node.js
- Express.js
- Socket.IO
- WebRTC
- MongoDB

## Features
- Join or create a meeting using a Room ID
- Real-time video and audio calling
- Group meetings with multiple participants
- In-call chat messaging
- Screen sharing
- Mute/unmute microphone
- Turn camera on/off
- Basic meeting history for users

## Project Structure
- `backend/` – REST API, authentication, meeting history, Socket.IO signaling server, MongoDB connection
- `frontend/` – React UI (Vite), meeting room experience, authentication flow, and routing

## Getting Started

### Prerequisites
- Node.js (LTS version recommended)
- npm (comes with Node.js)
- A running MongoDB instance and connection string

### 1. Clone and install dependencies

```bash
git clone https://github.com/AkashRanjanSaikia/video_Meet.git
cd video_Meet

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd frontend
npm install
```

### 2. Configure environment variables

In the `backend` folder, create a `.env` file and add at least:

```bash
MONGO_URI=<your-mongodb-connection-string>
PORT=8000
```

Make sure your MongoDB instance is running and the `MONGO_URI` value is correct.

If the frontend expects a specific backend URL, configure it in the `frontend` environment (for example in a `.env` file) so it points to `http://localhost:8000` or wherever your backend is running.

## Running the project locally

### Start the backend server

From the project root:

```bash
cd backend
npm run dev
```

This runs the backend with Nodemon on the port specified in `.env` (or `8000` by default).

### Start the frontend (React + Vite)

In a separate terminal, from the project root:

```bash
cd frontend
npm run dev
```

Vite will print a local development URL, typically:

```bash
http://localhost:5173
```

Open that URL in your browser to use VideoMeet locally.

## Build commands

### Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build of the React application.

## Live Demo
🔗 https://video-meet-sigma.vercel.app/
