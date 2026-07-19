import express = require("express");
import dotenv = require("dotenv");
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import session from "express-session";
import passport from "./config/passport";
import reviewRoutes from "./routes/reviewRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import profileRoutes from "./routes/profileRoutes";

import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  },
);

const PORT = process.env.PORT || 5000;

const REQUIRED_ENV_VARS = [
  "FRONTEND_URL",
  "MONGO_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "SESSION_SECRET",
];

function assertRequiredEnv() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
    console.error("Check .env against .env.example");
    process.exit(1);
  }
}

async function start() {
  assertRequiredEnv();
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});