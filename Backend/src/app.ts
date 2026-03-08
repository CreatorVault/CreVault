import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import videoRoutes from "./routes/video.routes";
import userRoutes from "./routes/user.routes";
import commentRoutes from "./routes/comment.routes";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || true, // Set FRONTEND_URL=https://your-frontend.vercel.app in Vercel env vars
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);

app.get("/", (_req, res) => {
  res.send("API is running");
});

export default app;
