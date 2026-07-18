import express = require("express");
import dotenv = require("dotenv");
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import session from "express-session";
import passport from "./config/passport";
import reviewRoutes from "./routes/reviewRoutes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: process.env.SESSION_SECRET!, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
+app.use("/api/reviews", reviewRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});