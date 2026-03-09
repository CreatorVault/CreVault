import mongoose, { Schema, Document } from "mongoose";

export interface IView extends Document {
    user?: mongoose.Types.ObjectId | null;
    video: mongoose.Types.ObjectId;
    createdAt: Date;
}

const ViewSchema: Schema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
    },
    { timestamps: true }
);

// Compound index for fast lookups (not unique — allows multiple views over time)
ViewSchema.index({ user: 1, video: 1, createdAt: -1 });

export default mongoose.model<IView>("View", ViewSchema);
