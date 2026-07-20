import mongoose, { Schema, Document } from "mongoose";

export interface IRecommendationInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  externalJobId: string;
  jobTitle: string;
  company: string;
  action: "saved" | "dismissed";
  createdAt: Date;
}

const RecommendationInteractionSchema = new Schema<IRecommendationInteraction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  externalJobId: { type: String, required: true },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  action: { type: String, enum: ["saved", "dismissed"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IRecommendationInteraction>(
  "RecommendationInteraction",
  RecommendationInteractionSchema,
);
