import { Request, Response } from "express";
import mongoose from "mongoose";
import Video from "../models/Video.model";
import View from "../models/View.model";
import Reaction from "../models/Reaction.model";
import Subscription from "../models/Subscription.model";
import User from "../models/User.model";

import cloudinary from "../config/cloudinary";

/** Recount views from the View collection for given video IDs and sync to Video docs.
 *  Takes the MAX of the existing counter and the View-document count so that
 *  older anonymous views (counted before View docs were created) are never lost. */
async function recountViews(videos: any[]) {
  const videoIds = videos.map((v) => v._id);
  const viewCounts = await View.aggregate([
    { $match: { video: { $in: videoIds } } },
    { $group: { _id: "$video", count: { $sum: 1 } } },
  ]);
  const viewMap: Record<string, number> = {};
  for (const vc of viewCounts) {
    viewMap[vc._id.toString()] = vc.count;
  }
  for (const video of videos) {
    const key = video._id.toString();
    const docCount = viewMap[key] || 0;
    // Use whichever is higher: the stored counter or the document count
    const bestViews = Math.max(video.views || 0, docCount);
    if (video.views !== bestViews) {
      video.views = bestViews;
      await video.save();
    }
  }
}

const getIO = (req: Request) => {
  const io = req.app.get("io");
  if (!io) {
    return {
      to: () => ({ emit: () => { } }),
      emit: () => { },
    };
  }
  return io;
};

export const getUploadSignature = async (req: Request, res: Response) => {
  try {
    const folder = (req.query.folder as string) || 'videos';
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      folder: folder,
    }, process.env.CLOUDINARY_API_SECRET as string);

    res.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error("Signature error:", error);
    res.status(500).json({ message: "Failed to generate signature" });
  }
};

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const { title, description, videoUrl: bodyVideoUrl, thumbnailUrl: bodyThumbnailUrl, duration: bodyDuration } = req.body;

    // Check for video URL from middleware (if used) or body (direct upload)
    const videoUrl = (req as any).videoUrl || bodyVideoUrl;

    if (!videoUrl) {
      return res.status(400).json({ message: "No video uploaded or URL provided" });
    }

    const thumbnailUrl = (req as any).thumbnailUrl || bodyThumbnailUrl || undefined;
    // duration in seconds (number), sent from the frontend after video metadata is read
    const duration = bodyDuration ? Number(bodyDuration) : 0;

    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      user: (req as any).user.id,
    });

    res.status(201).json({ message: "Video uploaded successfully", video });
  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Video upload failed" });
  }
};

export const getAllVideos = async (_req: Request, res: Response) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 }).populate("user", "name email subscribers");

    // Recount likes/dislikes from Reaction collection for all videos
    const videoIds = videos.map((v) => v._id);
    const reactions = await Reaction.aggregate([
      { $match: { video: { $in: videoIds } } },
      { $group: { _id: { video: "$video", type: "$type" }, count: { $sum: 1 } } },
    ]);

    // Build a map: videoId -> { like: N, dislike: N }
    const countMap: Record<string, { like: number; dislike: number }> = {};
    for (const r of reactions) {
      const key = r._id.video.toString();
      if (!countMap[key]) countMap[key] = { like: 0, dislike: 0 };
      countMap[key][r._id.type as 'like' | 'dislike'] = r.count;
    }

    // Sync and return updated videos
    const updatedVideos = await Promise.all(
      videos.map(async (video) => {
        const key = video._id.toString();
        const counts = countMap[key] || { like: 0, dislike: 0 };
        if (video.likes !== counts.like || video.dislikes !== counts.dislike) {
          video.likes = counts.like;
          video.dislikes = counts.dislike;
          await video.save();
        }
        return video;
      })
    );

    // Recount views from View collection
    await recountViews(updatedVideos);

    res.json(updatedVideos);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id).populate("user", "name email subscribers");
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Always recount likes/dislikes from Reaction collection for accuracy
    const likesCount = await Reaction.countDocuments({ video: video._id, type: "like" });
    const dislikesCount = await Reaction.countDocuments({ video: video._id, type: "dislike" });
    if (video.likes !== likesCount || video.dislikes !== dislikesCount) {
      video.likes = likesCount;
      video.dislikes = dislikesCount;
      await video.save();
    }

    // Recount views from View collection
    await recountViews([video]);

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const incrementViews = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id; // Optional: present if logged in
  const videoId = req.params.id;

  try {
    let video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    let shouldIncrement = false;

    if (userId) {
      // Authenticated user – allow one view per 24 hours per video
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentView = await View.findOne({
        user: userId,
        video: videoId,
        createdAt: { $gte: twentyFourHoursAgo },
      });
      if (!recentView) {
        await View.create({ user: userId, video: videoId });
        shouldIncrement = true;
      }
    } else {
      // Anonymous view – also store in View collection (with user: null)
      await View.create({ user: null, video: videoId });
      shouldIncrement = true;
    }

    if (shouldIncrement) {
      // Recount from View collection, but never go below existing counter
      const docCount = await View.countDocuments({ video: videoId });
      video.views = Math.max(video.views || 0, docCount);
      await video.save();
      getIO(req).to(`video_${videoId}`).emit("view_updated", { views: video.views });
    }

    res.json(await video.populate("user", "name email subscribers"));
  } catch (error) {
    console.error("Increment views error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateReaction = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const videoId = req.params.id;
  const { type } = req.body; // 'like' or 'dislike'

  try {
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const existingReaction = await Reaction.findOne({ user: userId, video: videoId });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Toggle off – remove the reaction
        await existingReaction.deleteOne();
      } else {
        // Switch reaction
        existingReaction.type = type;
        await existingReaction.save();
      }
    } else {
      // New reaction
      await Reaction.create({ user: userId, video: videoId, type });
    }

    // Re-count from the Reaction collection to keep counts accurate
    const likesCount = await Reaction.countDocuments({ video: videoId, type: "like" });
    const dislikesCount = await Reaction.countDocuments({ video: videoId, type: "dislike" });
    video.likes = likesCount;
    video.dislikes = dislikesCount;
    await video.save();

    // Also return the current user's reaction so the frontend can stay in sync
    const currentReaction = await Reaction.findOne({ user: userId, video: videoId });

    getIO(req).to(`video_${videoId}`).emit("reaction_updated", { likes: video.likes, dislikes: video.dislikes });

    const populated = await video.populate("user", "name email subscribers");
    res.json({ ...populated.toJSON(), userReaction: currentReaction ? currentReaction.type : null });
  } catch (error) {
    console.error("Update reaction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSubscribers = async (req: Request, res: Response) => {
  const subscriberId = (req as any).user.id;
  const videoId = req.params.id;

  try {
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const channelId = video.user;
    if (subscriberId === channelId.toString()) {
      return res.status(400).json({ message: "Cannot subscribe to yourself" });
    }

    const existingSub = await Subscription.findOne({ subscriber: subscriberId, channel: channelId });
    const channelUser = await User.findById(channelId);
    if (!channelUser) return res.status(404).json({ message: "Channel not found" });

    let isSubscribed = false;
    if (existingSub) {
      // Unsubscribe
      await existingSub.deleteOne();
      // user.subscribers is not in the User model by default in some setups, check schema
      // Assuming User model has 'subscribers' count field
      if (channelUser.subscribers > 0) channelUser.subscribers -= 1;
    } else {
      // Subscribe
      await Subscription.create({ subscriber: subscriberId, channel: channelId });
      channelUser.subscribers = (channelUser.subscribers || 0) + 1;
      isSubscribed = true;
    }

    await channelUser.save();

    // Emit to all clients viewing this user's videos? Or just the current video room?
    // Better to have a room for the channel/user, but video room works for immediate feedback
    getIO(req).to(`video_${videoId}`).emit("subscriber_updated", { subscribers: channelUser.subscribers });

    res.json({ subscribers: channelUser.subscribers, isSubscribed });
  } catch (error) {
    console.error("Update subscribers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const videoId = req.params.id;

  try {
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this video" });
    }

    await video.deleteOne();
    await View.deleteMany({ video: videoId });
    await Reaction.deleteMany({ video: videoId });
    // await Comment.deleteMany({ video: videoId }); // If comments exist

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const videos = await Video.find({ user: userId }).sort({ createdAt: -1 });

    // Recount likes/dislikes from Reaction collection for accuracy
    const videoIds = videos.map((v) => v._id);
    const reactions = await Reaction.aggregate([
      { $match: { video: { $in: videoIds } } },
      { $group: { _id: { video: "$video", type: "$type" }, count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, { like: number; dislike: number }> = {};
    for (const r of reactions) {
      const key = r._id.video.toString();
      if (!countMap[key]) countMap[key] = { like: 0, dislike: 0 };
      countMap[key][r._id.type as 'like' | 'dislike'] = r.count;
    }
    for (const video of videos) {
      const key = video._id.toString();
      const counts = countMap[key] || { like: 0, dislike: 0 };
      if (video.likes !== counts.like || video.dislikes !== counts.dislike) {
        video.likes = counts.like;
        video.dislikes = counts.dislike;
        await video.save();
      }
    }

    // Recount views from View collection
    await recountViews(videos);

    const totalVideos = videos.length;
    const totalViews = videos.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalLikes = videos.reduce((acc, curr) => acc + (curr.likes || 0), 0);

    res.json({
      totalVideos,
      totalViews,
      totalLikes,
      videos,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const videoId = req.params.id;

  try {
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const channelId = video.user;

    // Always recount from Subscription collection for accuracy
    const [existingSub, patronCount] = await Promise.all([
      Subscription.findOne({ subscriber: userId, channel: channelId }),
      Subscription.countDocuments({ channel: channelId }),
    ]);

    // Sync the User.subscribers field so it stays consistent
    const channelUser = await User.findById(channelId);
    if (channelUser && channelUser.subscribers !== patronCount) {
      channelUser.subscribers = patronCount;
      await channelUser.save();
    }

    res.json({
      subscribers: patronCount,
      isSubscribed: !!existingSub,
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/** Get the current user's reaction (like/dislike/null) for a specific video. */
export const getUserReaction = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const videoId = req.params.id;

  try {
    const reaction = await Reaction.findOne({ user: userId, video: videoId });
    res.json({ reaction: reaction ? reaction.type : null });
  } catch (error) {
    console.error("Get user reaction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/** Get all videos liked by the current user (sorted newest-liked-first). */
export const getLikedVideos = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    // Find all like reactions by this user, sorted newest first
    const likedReactions = await Reaction.find({ user: userId, type: "like" }).sort({ createdAt: -1 });

    if (likedReactions.length === 0) {
      return res.json([]);
    }

    const videoIds = likedReactions.map((r) => r.video);

    // Fetch the actual videos and preserve order
    const videos = await Video.find({ _id: { $in: videoIds } }).populate("user", "name email subscribers");

    // Sort videos to match the order of likedReactions (newest liked first)
    const videoMap = new Map(videos.map((v) => [v._id.toString(), v]));
    const orderedVideos = videoIds
      .map((id) => videoMap.get(id.toString()))
      .filter(Boolean);

    res.json(orderedVideos);
  } catch (error) {
    console.error("Get liked videos error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
