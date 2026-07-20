import mongoose, { Schema, Document } from "mongoose";

export type ContentType = "cover_letter" | "resume_bullets";
export type ContentLength = "short" | "medium" | "long";

export interface IAIGeneration extends Document {
  userId: mongoose.Types.ObjectId;
  jobId?: string;
  jobTitle: string;
  company: string;
  type: ContentType;
  length: ContentLength;
  prompt: string;
  output: string;
  createdAt: Date;
}

const AIGenerationSchema = new Schema<IAIGeneration>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  jobId: { type: String },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  type: {
    type: String,
    enum: ["cover_letter", "resume_bullets"],
    required: true,
  },
  length: { type: String, enum: ["short", "medium", "long"], required: true },
  prompt: { type: String, required: true },
  output: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAIGeneration>(
  "AIGeneration",
  AIGenerationSchema,
);
