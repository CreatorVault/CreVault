import { Request, Response } from "express";
import Comment from "../models/Comment.model";

/**
 * GET /api/comments/:videoId
 * Fetch all comments for a video, sorted newest first.
 */
export const getComments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { videoId } = req.params;

        const comments = await Comment.find({ videoId })
            .populate("userId", "name")
            .sort({ createdAt: -1 });

        const mapped = comments.map((c) => {
            const populatedUser = c.userId as any;
            const isPopulated = populatedUser && typeof populatedUser === "object" && populatedUser.name;

            return {
                id: c._id,
                videoId: c.videoId,
                userId: isPopulated ? populatedUser._id.toString() : String(c.userId),
                username: isPopulated ? populatedUser.name : "Unknown",
                avatar: "",
                content: c.content,
                createdAt: c.createdAt.toISOString(),
                likes: c.likes,
            };
        });

        res.json(mapped);
    } catch (error) {
        console.error("Get comments error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * POST /api/comments/:videoId
 * Add a comment to a video (requires auth).
 * Emits "comment_added" via Socket.IO to the video room.
 */
export const addComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { videoId } = req.params;
        const { content } = req.body;
        const userId = (req as any).user?.id;

        if (!content || !content.trim()) {
            res.status(400).json({ message: "Comment content is required" });
            return;
        }

        if (!userId) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        // Create the comment
        const created = await Comment.create({
            videoId,
            userId,
            content: content.trim(),
        });

        // Re-fetch with populate to get user name
        const comment = await Comment.findById(created._id).populate("userId", "name");
        const populatedUser = comment?.userId as any;
        const isPopulated = populatedUser && typeof populatedUser === "object" && populatedUser.name;

        const mapped = {
            id: created._id,
            videoId: created.videoId,
            userId: isPopulated ? populatedUser._id.toString() : String(userId),
            username: isPopulated ? populatedUser.name : "Unknown",
            avatar: "",
            content: created.content,
            createdAt: created.createdAt.toISOString(),
            likes: created.likes,
        };

        // Broadcast to all viewers of this video via Socket.IO
        const io = req.app.get("io");
        if (io) {
            io.to(`video_${videoId}`).emit("comment_added", mapped);
        }

        res.status(201).json(mapped);
    } catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * DELETE /api/comments/:commentId
 * Delete own comment (requires auth).
 */
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { commentId } = req.params;
        const userId = (req as any).user?.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }

        if (comment.userId.toString() !== userId) {
            res.status(403).json({ message: "Not authorized to delete this comment" });
            return;
        }

        const videoId = comment.videoId;
        await Comment.findByIdAndDelete(commentId);

        // Broadcast deletion to all viewers
        const io = req.app.get("io");
        if (io) {
            io.to(`video_${videoId}`).emit("comment_deleted", {
                commentId,
                videoId,
            });
        }

        res.json({ message: "Comment deleted" });
    } catch (error) {
        console.error("Delete comment error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
