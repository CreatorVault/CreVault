import { Router } from "express";
import {
    getComments,
    addComment,
    deleteComment,
} from "../controllers/comment.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/:videoId", getComments);
router.post("/:videoId", protect, addComment);
router.delete("/:commentId", protect, deleteComment);

export default router;
