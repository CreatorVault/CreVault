import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
    videoId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
    likes: number;
    createdAt: Date;
}

const CommentSchema = new Schema(
    {
        videoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        likes: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IComment>("Comment", CommentSchema);
