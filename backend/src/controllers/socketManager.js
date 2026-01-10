import { Server } from "socket.io";
import Meeting from "../models/meetings.model.js";

let messages = {};
let timeOnline = {};
let usernames = {}; 

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST'],
            allowedHeaders: ['*'],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join-call", (path, username) => {
            // Use native Socket.io rooms
            socket.join(path);
            socket.roomPath = path; // Store path on socket for easy cleanup

            usernames[socket.id] = username || `User_${socket.id.substring(0, 6)}`;
            timeOnline[socket.id] = new Date();

            // Get all clients in this room to share usernames
            const clientsInRoom = io.sockets.adapter.rooms.get(path);
            const usersInRoom = Array.from(clientsInRoom || []);
            
            const existingUsernames = {};
            usersInRoom.forEach(id => {
                existingUsernames[id] = usernames[id];
            });

            // 1. Send existing users to the newcomer
            socket.emit("existing-usernames", existingUsernames);

            // 2. Notify everyone in room about the new user
            io.to(path).emit("user-joined", socket.id, usersInRoom, usernames[socket.id]);

            // 3. Send chat history
            if (messages[path]) {
                messages[path].forEach(msg => {
                    socket.emit("chat-message", msg.data, msg.sender, msg['socket-id-sender']);
                });
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit('signal', socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const path = socket.roomPath;
            if (path) {
                if (!messages[path]) messages[path] = [];
                
                const messageData = { 'sender': sender, 'data': data, 'socket-id-sender': socket.id };
                messages[path].push(messageData);
                
                io.to(path).emit("chat-message", data, sender, socket.id);
            }
        });

        // Combined disconnect logic
        const handleDisconnect = async () => {
            const path = socket.roomPath;
            if (!path) return;

            console.log("User disconnected:", socket.id);
            
            // Notify others
            io.to(path).emit('user-left', socket.id);

            // Leave the room
            socket.leave(path);

            // Check if room is now empty
            const remainingClients = io.sockets.adapter.rooms.get(path);
            if (!remainingClients || remainingClients.size === 0) {
                console.log(`Room ${path} is empty. Cleaning up...`);
                
                // 1. Update DB
                try {
                    const urlParts = path.split('/');
                    const meetingCode = urlParts[urlParts.length - 1];
                    
                    await Meeting.findOneAndUpdate(
                        { meetingCode: meetingCode, status: "ongoing" },
                        { status: "ended" }
                    );
                } catch (e) {
                    console.error("DB Error:", e);
                }
                
                // 2. Clear history if desired (optional)
                delete messages[path];
            }

            delete usernames[socket.id];
            delete timeOnline[socket.id];
        };

        // Handle explicit end-call event (when user clicks end call button)
        socket.on("end-call", handleDisconnect);

        // Handle native disconnect event (tab close, refresh, network issues)
        socket.on("disconnect", handleDisconnect);
    });

    return io;
};