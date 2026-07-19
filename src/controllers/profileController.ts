import { Request, Response } from "express";
import User from "../models/User";

interface AuthedRequest extends Request {
  userId?: string;
}

const VALID_EXPERIENCE_LEVELS = ["entry", "mid", "senior"];

function sanitize(user: any) {
  const { passwordHash, ...safe } = user.toObject();
  return safe;
}

export async function getProfile(req: AuthedRequest, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(sanitize(user));
}

export async function updateProfile(req: AuthedRequest, res: Response) {
  const {
    name,
    skills,
    experienceLevel,
    preferredRoles,
    preferredLocations,
    resumeText,
  } = req.body;

  const update: Record<string, unknown> = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name must be a non-empty string" });
    }
    update.name = name.trim();
  }

  if (skills !== undefined) {
    if (!Array.isArray(skills) || !skills.every((s) => typeof s === "string")) {
      return res
        .status(400)
        .json({ error: "skills must be an array of strings" });
    }
    update.skills = skills.map((s: string) => s.trim()).filter(Boolean);
  }

  if (experienceLevel !== undefined) {
    if (!VALID_EXPERIENCE_LEVELS.includes(experienceLevel)) {
      return res
        .status(400)
        .json({
          error: `experienceLevel must be one of ${VALID_EXPERIENCE_LEVELS.join(", ")}`,
        });
    }
    update.experienceLevel = experienceLevel;
  }

  if (preferredRoles !== undefined) {
    if (
      !Array.isArray(preferredRoles) ||
      !preferredRoles.every((s) => typeof s === "string")
    ) {
      return res
        .status(400)
        .json({ error: "preferredRoles must be an array of strings" });
    }
    update.preferredRoles = preferredRoles
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  if (preferredLocations !== undefined) {
    if (
      !Array.isArray(preferredLocations) ||
      !preferredLocations.every((s) => typeof s === "string")
    ) {
      return res
        .status(400)
        .json({ error: "preferredLocations must be an array of strings" });
    }
    update.preferredLocations = preferredLocations
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  if (resumeText !== undefined) {
    if (typeof resumeText !== "string") {
      return res.status(400).json({ error: "resumeText must be a string" });
    }
    update.resumeText = resumeText;
  }

  const user = await User.findByIdAndUpdate(req.userId, update, { new: true });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(sanitize(user));
}
