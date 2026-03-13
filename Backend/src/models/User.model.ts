import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  subscribers: number;
  profilePhotoUrl?: string;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subscribers: { type: Number, default: 0 },
    profilePhotoUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
