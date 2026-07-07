import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

// userId -> socketId
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  console.log("getReceiverSocketId() =>", userId);
  console.log("Current Socket Map =>", userSocketMap);

  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("=================================");
  console.log(" USER CONNECTED");
  console.log("Socket ID:", socket.id);

  const userId = socket.handshake.query.userId;
  console.log("Handshake Query:", socket.handshake.query);

  console.log("User ID:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.table(userSocketMap);
  }

  console.log("Current Socket Map:");
  console.log(userSocketMap);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("=================================");
    console.log(" USER DISCONNECTED");
    console.log("User ID:", userId);

    delete userSocketMap[userId];

    console.log("Current Socket Map:");
    console.log(userSocketMap);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };