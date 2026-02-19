import { Router } from "express";
import {
    uploadVideo,
    getUploadSignature,
    getAllVideos,
    getVideoById,
    incrementViews,
    updateReaction,
    updateSubscribers,
    getSubscriptionStatus,
    getUserReaction,
    deleteVideo,
    getDashboardStats,
    getLikedVideos,
} from "../controllers/video.controller";
import { protect, optionalProtect } from "../middleware/auth.middleware";
import { handleVideoUpload } from "../middleware/upload.middleware";

const router = Router();

router.get("/dashboard", protect, getDashboardStats);
router.get("/liked", protect, getLikedVideos);
router.get("/signature", protect, getUploadSignature);
router.post("/upload", protect, handleVideoUpload, uploadVideo); // Legacy upload (might fail on Vercel for large files)
router.post("/create", protect, uploadVideo); // Create video from metadata (direct upload)
router.get("/", getAllVideos);
router.get("/:id", getVideoById);
router.post("/:id/view", optionalProtect, incrementViews); // Works for both anonymous and authenticated users
router.post("/:id/react", protect, updateReaction);
router.get("/:id/reaction", protect, getUserReaction); // Get current user's reaction
router.post("/:id/subscribe", protect, updateSubscribers);
router.get("/:id/subscription-status", protect, getSubscriptionStatus);
router.delete("/:id", protect, deleteVideo); // Delete route

export default router;

