import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { generate, listHistory } from "../controllers/contentGeneratorController";

const router = Router();

router.use(requireAuth);

router.post("/", generate);
router.get("/history", listHistory);

export default router;