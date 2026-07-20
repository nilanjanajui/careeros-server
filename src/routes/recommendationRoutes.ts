import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { generateRecommendations, logInteraction } from "../controllers/recommendationsController";

const router = Router();

router.use(requireAuth);

router.post("/", generateRecommendations);
router.post("/interaction", logInteraction);

export default router;