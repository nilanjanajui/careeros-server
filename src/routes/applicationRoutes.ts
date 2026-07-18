import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  listApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../controllers/applicationsController";

const router = Router();

router.use(requireAuth);

router.get("/", listApplications);
router.post("/", createApplication);
router.patch("/:id", updateApplication);
router.delete("/:id", deleteApplication);

export default router;
