import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);

  const email = "demo@careeros.app";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Demo user already exists, skipping.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("DemoPass123", 10);
  await User.create({
    name: "Demo User",
    email,
    passwordHash,
    authProvider: "local",
    skills: ["JavaScript", "React", "Node.js"],
    experienceLevel: "mid",
    preferredRoles: ["Frontend Developer", "Full Stack Developer"],
    preferredLocations: ["Remote", "Berlin"],
  });

  console.log("Demo user created:", email);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
