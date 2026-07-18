import { Router } from "express";
import { listJobs, getJob } from "../controllers/jobsController";

const router = Router();

router.get("/", listJobs);
router.get("/:id", getJob);

export default router;
