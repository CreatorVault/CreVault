// Test: login, post a comment, verify username
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db";
import User from "../models/User.model";
import Comment from "../models/Comment.model";
import mongoose from "mongoose";

async function test() {
    await connectDB();

    // Find ANY user in the database
    const users = await User.find({}).select("_id name email");
    console.log("\n=== USERS IN DATABASE ===");
    if (users.length === 0) {
        console.log("NO USERS FOUND!");
        process.exit(1);
    }
    users.forEach((u) => console.log(`  _id: ${u._id} (type: ${typeof u._id}), name: "${u.name}", email: "${u.email}"`));

    // Pick the first user
    const testUser = users[0];
    console.log(`\nUsing user: ${testUser.name} (${testUser._id})`);

    // Find any video ID to test with
    const Video = mongoose.model("Video", new mongoose.Schema({ title: String }));
    let videoId: string;
    try {
        const video = await Video.findOne({});
        videoId = video?._id?.toString() || new mongoose.Types.ObjectId().toString();
    } catch {
        videoId = new mongoose.Types.ObjectId().toString();
    }

    // Create a comment directly using the same logic as the controller
    const comment = await Comment.create({
        videoId: videoId,
        userId: testUser._id,
        content: "Test comment from script",
    });
    console.log("\nComment created:", comment._id);
    console.log("Comment userId:", comment.userId, "(type:", typeof comment.userId, ")");

    // Now try to populate (same as getComments)
    const fetched = await Comment.findById(comment._id).populate("userId", "name");
    const populatedUser = fetched?.userId as any;
    console.log("\nPopulated userId:", JSON.stringify(populatedUser));
    console.log("Is populated (has name)?", populatedUser?.name ? "YES" : "NO");
    console.log("Name:", populatedUser?.name || "NOT FOUND");

    // Also try User.findById (same as addComment)
    const directUser = await User.findById(testUser._id).select("name");
    console.log("\nDirect User.findById:", JSON.stringify(directUser));
    console.log("Name:", directUser?.name || "NOT FOUND");

    // Cleanup
    await Comment.findByIdAndDelete(comment._id);
    console.log("\nTest comment cleaned up.");

    process.exit(0);
}

test().catch((err) => {
    console.error("Test error:", err);
    process.exit(1);
});
