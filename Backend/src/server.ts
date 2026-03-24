import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

import http from "http";
import { Server } from "socket.io";
// ... imports

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Store io instance in app to access it in controllers
  app.set("io", io);

  io.on("connection", (socket: any) => {
    socket.on("join_video", (videoId: string) => {
      socket.join(`video_${videoId}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
