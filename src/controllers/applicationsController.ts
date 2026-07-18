import { Request, Response } from "express";
import Application, { ApplicationStatus } from "../models/Application";

interface AuthedRequest extends Request {
  userId?: string;
}

const VALID_STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
];

export async function listApplications(req: AuthedRequest, res: Response) {
  const applications = await Application.find({ userId: req.userId }).sort({
    createdAt: -1,
  });
  res.json(applications);
}

export async function createApplication(req: AuthedRequest, res: Response) {
  const {
    jobTitle,
    company,
    companyLogoUrl,
    notes,
    shortNote,
    dateApplied,
    status,
    externalJobId,
  } = req.body;

  if (typeof jobTitle !== "string" || !jobTitle.trim()) {
    return res.status(400).json({ error: "jobTitle is required" });
  }
  if (typeof company !== "string" || !company.trim()) {
    return res.status(400).json({ error: "company is required" });
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }

try {
    const application = await Application.create({
      userId: req.userId,
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      companyLogoUrl,
      notes,
      shortNote,
      dateApplied: dateApplied ? new Date(dateApplied) : undefined,
      status: status ?? "saved",
      externalJobId,
    });

    res.status(201).json(application);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return res.status(409).json({ error: "You've already saved this job" });
    }
    res.status(500).json({ error: "Failed to create application" });
  }
}

export async function updateApplication(req: AuthedRequest, res: Response) {
  const { id } = req.params;
  const { status, ...rest } = req.body;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }

  // Scoping the filter to userId (not just _id) is what prevents user A from
  // editing user B's application by guessing/enumerating an id.
  const application = await Application.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { ...rest, ...(status !== undefined ? { status } : {}) },
    { new: true },
  );

  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }
  res.json(application);
}

export async function deleteApplication(req: AuthedRequest, res: Response) {
  const { id } = req.params;
  const result = await Application.deleteOne({ _id: id, userId: req.userId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Application not found" });
  }
  res.status(204).send();
}
