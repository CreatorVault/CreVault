// Delete ALL comments from the database to start fresh
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db";
import Comment from "../models/Comment.model";

async function deleteAll() {
    await connectDB();

    const result = await Comment.deleteMany({});
    console.log(`Deleted ${result.deletedCount} comments. Database is clean.`);

    process.exit(0);
}

deleteAll().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
