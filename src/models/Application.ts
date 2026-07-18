import mongoose, { Schema, Document } from "mongoose";

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  jobTitle: string;
  company: string;
  companyLogoUrl?: string;
  notes?: string; // full description, e.g. pasted job posting
  shortNote?: string; // quick personal note
  dateApplied?: Date;
  status: ApplicationStatus;
  externalJobId?: string; // links back to the source Adzuna listing, if saved from search
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  jobTitle: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  companyLogoUrl: { type: String },
  notes: { type: String },
  shortNote: { type: String },
  dateApplied: { type: Date },
  status: {
    type: String,
    enum: ["saved", "applied", "interview", "offer", "rejected"],
    default: "saved",
  },
  externalJobId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

ApplicationSchema.index(
  { userId: 1, externalJobId: 1 },
  { unique: true, sparse: true },
);

export default mongoose.model<IApplication>("Application", ApplicationSchema);
