import { Request, Response } from "express";
import { searchJobs, getJobById } from "../services/adzunaService";
import { JobSearchParams } from "../types/job";

const SORT_VALUES = new Set(["date", "salary", "relevance"]);

export async function listJobs(req: Request, res: Response) {
  const { what, where, category, salaryMin, sortBy, page, resultsPerPage } =
    req.query;

  const sortByValue =
    typeof sortBy === "string" && SORT_VALUES.has(sortBy)
      ? (sortBy as JobSearchParams["sortBy"])
      : undefined;

  const params: JobSearchParams = {
    what: typeof what === "string" ? what : undefined,
    where: typeof where === "string" ? where : undefined,
    category: typeof category === "string" ? category : undefined,
    salaryMin: salaryMin ? Number(salaryMin) : undefined,
    sortBy: sortByValue,
    page: page ? Number(page) : undefined,
    resultsPerPage: resultsPerPage ? Number(resultsPerPage) : undefined,
  };

  try {
    const result = await searchJobs(params);
    res.json(result);
  } catch (err) {
    res
      .status(502)
      .json({ error: "Failed to fetch jobs", detail: (err as Error).message });
  }
}

export async function getJob(req: Request, res: Response) {
  const id = req.params.id;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid job id" });
  }
  const job = await getJobById(id);
  if (!job) {
    return res.status(404).json({
      error: "Job listing not found or expired",
      detail:
        "This listing wasn't in a recent search result. It may no longer be available.",
    });
  }
  res.json(job);
}
