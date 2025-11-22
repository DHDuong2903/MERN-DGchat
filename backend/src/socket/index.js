import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import { getUserConversationForSocketIO } from "../controllers/conversationController.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const onlineUser = new Map(); // {userId: socketId}

io.on("connection", async (socket) => {
  const user = socket.user;
  console.log(`${user.displayName} online voi socket ${socket.id}`);

  onlineUser.set(user._id, socket.id);

  io.emit("online-users", Array.from(onlineUser.keys()));

  const conversationIds = await getUserConversationForSocketIO(user._id);

  conversationIds.forEach((id) => {
    socket.join(id);
  });
  socket.on("disconnect", () => {
    onlineUser.delete(user._id);
    io.emit("online-users", Array.from(onlineUser.keys()));
    console.log(`socket disconnected: ${socket.id}`);
  });
});

export { io, app, server };
