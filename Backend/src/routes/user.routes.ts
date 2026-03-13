import { Router } from "express";
import { getUserProfile, getUserVideos, updateProfilePhoto } from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";
import { handleProfilePhotoUpload } from "../middleware/upload.middleware";

const router = Router();

router.get("/:id", getUserProfile);
router.get("/:id/videos", getUserVideos);

// Protected routes
router.patch("/profile-photo", protect, handleProfilePhotoUpload, updateProfilePhoto);

export default router;
