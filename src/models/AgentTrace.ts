import mongoose, { Schema, Document } from "mongoose";

export interface IAgentTraceStep {
  iteration: number;
  role: "assistant" | "tool";
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResultSummary?: string;
  assistantContent?: string;
}

export interface IAgentTrace extends Document {
  userId: mongoose.Types.ObjectId;
  steps: IAgentTraceStep[];
  finalRecommendationCount: number;
  createdAt: Date;
}

const AgentTraceStepSchema = new Schema<IAgentTraceStep>(
  {
    iteration: { type: Number, required: true },
    role: { type: String, enum: ["assistant", "tool"], required: true },
    toolName: String,
    toolArgs: Schema.Types.Mixed,
    toolResultSummary: String,
    assistantContent: String,
  },
  { _id: false },
);

const AgentTraceSchema = new Schema<IAgentTrace>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  steps: [AgentTraceStepSchema],
  finalRecommendationCount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAgentTrace>("AgentTrace", AgentTraceSchema);
