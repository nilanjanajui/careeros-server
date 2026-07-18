import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  authProvider: "local" | "google";
  googleId?: string;
  skills: string[];
  experienceLevel: "entry" | "mid" | "senior";
  preferredRoles: string[];
  preferredLocations: string[];
  resumeText?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String }, // not required — Google users won't have one
  authProvider: { type: String, enum: ["local", "google"], required: true },
  googleId: { type: String },
  skills: { type: [String], default: [] },
  experienceLevel: {
    type: String,
    enum: ["entry", "mid", "senior"],
    default: "entry",
  },
  preferredRoles: { type: [String], default: [] },
  preferredLocations: { type: [String], default: [] },
  resumeText: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
