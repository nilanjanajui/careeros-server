import { Router } from "express";
import { listReviewsForCompany, createReview } from "../controllers/reviewsController";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", listReviewsForCompany);
router.post("/", requireAuth, createReview);

export default router;