import { Request, Response } from "express";
import CompanyReview, { normalizeCompanyKey } from "../models/CompanyReview";

interface AuthedRequest extends Request {
  userId?: string;
}

export async function listReviewsForCompany(req: Request, res: Response) {
  const company = req.query.company;
  if (typeof company !== "string" || !company.trim()) {
    return res.status(400).json({ error: "company query param is required" });
  }
  const companyKey = normalizeCompanyKey(company);

  const reviews = await CompanyReview.find({ companyKey })
    .sort({ createdAt: -1 })
    .populate("userId", "name")
    .lean();

  const averageRating =
    reviews.length === 0
      ? null
      : Number(
          (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1),
        );

  res.json({ reviews, averageRating, count: reviews.length });
}

export async function createReview(req: AuthedRequest, res: Response) {
  const { company, rating, reviewText } = req.body;

  if (typeof company !== "string" || !company.trim()) {
    return res.status(400).json({ error: "company is required" });
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ error: "rating must be a number between 1 and 5" });
  }
  if (typeof reviewText !== "string" || !reviewText.trim()) {
    return res.status(400).json({ error: "reviewText is required" });
  }

  try {
    const review = await CompanyReview.create({
      company: company.trim(),
      companyKey: normalizeCompanyKey(company),
      userId: req.userId,
      rating,
      reviewText: reviewText.trim(),
    });
    res.status(201).json(review);
  } catch (err) {
    // Mongo duplicate-key error from the unique (companyKey, userId) index
    if ((err as { code?: number }).code === 11000) {
      return res
        .status(409)
        .json({ error: "You've already reviewed this company" });
    }
    res.status(500).json({ error: "Failed to create review" });
  }
}
