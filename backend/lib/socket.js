import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chatmee.onrender.com",
    ],
    credentials: true,
  },
});

// userId -> socketId
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("=================================");
  console.log("USER CONNECTED");
  console.log("Socket ID:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  console.table(userSocketMap);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", async () => {
    console.log("=================================");
    console.log("USER DISCONNECTED:", userId);
    console.log("Socket:", socket.id);

    if (userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
    }

    console.table(userSocketMap);

    try {
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          lastSeen: new Date(),
        });
      }
    } catch (err) {
      console.log("Last Seen Update Error:", err.message);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };