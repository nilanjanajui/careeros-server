import { Request, Response } from "express";
import User from "../models/User";
import AIGeneration, {
  ContentType,
  ContentLength,
} from "../models/AIGeneration";
import { generateContent } from "../services/contentGeneratorService";

interface AuthedRequest extends Request {
  userId?: string;
}

const VALID_TYPES: ContentType[] = ["cover_letter", "resume_bullets"];
const VALID_LENGTHS: ContentLength[] = ["short", "medium", "long"];

export async function generate(req: AuthedRequest, res: Response) {
  const { jobId, jobTitle, company, jobDescription, type, length, regenerate } =
    req.body;

  if (typeof jobTitle !== "string" || !jobTitle.trim()) {
    return res.status(400).json({ error: "jobTitle is required" });
  }
  if (typeof company !== "string" || !company.trim()) {
    return res.status(400).json({ error: "company is required" });
  }
  if (!VALID_TYPES.includes(type)) {
    return res
      .status(400)
      .json({ error: `type must be one of ${VALID_TYPES.join(", ")}` });
  }
  if (!VALID_LENGTHS.includes(length)) {
    return res
      .status(400)
      .json({ error: `length must be one of ${VALID_LENGTHS.join(", ")}` });
  }

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  try {
    const { prompt, output } = await generateContent(
      user,
      { title: jobTitle, company, description: jobDescription ?? "" },
      type,
      length,
      Boolean(regenerate),
    );

    const record = await AIGeneration.create({
      userId: req.userId,
      jobId,
      jobTitle,
      company,
      type,
      length,
      prompt,
      output,
    });

    res.status(201).json(record);
  } catch (err) {
    res
      .status(502)
      .json({
        error: "Content generation failed",
        detail: (err as Error).message,
      });
  }
}

export async function listHistory(req: AuthedRequest, res: Response) {
  const history = await AIGeneration.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(history);
}
