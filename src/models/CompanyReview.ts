import mongoose, { Schema, Document } from "mongoose";

export interface ICompanyReview extends Document {
  company: string; // display name, as submitted
  companyKey: string; // normalized (lowercase, trimmed) — used for lookups/grouping
  userId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  reviewText: string;
  createdAt: Date;
}

export function normalizeCompanyKey(company: string): string {
  return company.trim().toLowerCase();
}

const CompanyReviewSchema = new Schema<ICompanyReview>({
  company: { type: String, required: true },
  companyKey: { type: String, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
});

// One review per user per company — prevents a single user from stuffing
// the average. Not in the original spec but a reasonable default; relax
// this (e.g. allow edits instead) if you want users to update their review.
CompanyReviewSchema.index({ companyKey: 1, userId: 1 }, { unique: true });

export default mongoose.model<ICompanyReview>(
  "CompanyReview",
  CompanyReviewSchema,
);
