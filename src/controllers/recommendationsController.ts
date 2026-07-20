import { Request, Response } from "express";
import User from "../models/User";
import RecommendationInteraction from "../models/RecommendationInteraction";
import { runRecommendationAgent } from "../services/recommendationService";

interface AuthedRequest extends Request {
  userId?: string;
}

export async function generateRecommendations(
  req: AuthedRequest,
  res: Response,
) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  try {
    const result = await runRecommendationAgent(user);
    res.json(result);
  } catch (err) {
    res.status(502).json({
      error: "Recommendation engine failed",
      detail: (err as Error).message,
    });
  }
}

export async function logInteraction(req: AuthedRequest, res: Response) {
  const { externalJobId, jobTitle, company, action } = req.body;

  if (typeof externalJobId !== "string" || !externalJobId) {
    return res.status(400).json({ error: "externalJobId is required" });
  }
  if (action !== "saved" && action !== "dismissed") {
    return res
      .status(400)
      .json({ error: "action must be 'saved' or 'dismissed'" });
  }
  if (typeof jobTitle !== "string" || typeof company !== "string") {
    return res.status(400).json({ error: "jobTitle and company are required" });
  }

  const interaction = await RecommendationInteraction.create({
    userId: req.userId,
    externalJobId,
    jobTitle,
    company,
    action,
  });

  res.status(201).json(interaction);
}
