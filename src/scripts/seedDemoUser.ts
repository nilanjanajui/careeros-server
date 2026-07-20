import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User";
import Application from "../models/Application";
import CompanyReview from "../models/CompanyReview";

dotenv.config();

const DEMO_EMAIL = "demo@careeros.app";

const DEMO_RESUME = `Results-driven Full Stack and MERN Developer with 4 years of experience building scalable web applications. Proficient in React, Node.js, Express, and MongoDB. Led the migration of a legacy dashboard to a modern MERN stack at my last role, cutting page load time by 40% and improving overall system architecture. Comfortable across the stack — designing REST APIs, managing database schemas, and building responsive UI with React and Tailwind CSS. Looking for a full-stack, MERN, or frontend role on a fast-paced product team.`;

const DEMO_APPLICATIONS: {
  jobTitle: string;
  company: string;
  status: "saved" | "applied" | "interview" | "offer" | "rejected";
  shortNote?: string;
  daysAgo: number;
}[] = [
  { jobTitle: "Senior Frontend Engineer", company: "Vercel", status: "interview", shortNote: "Referred by a former coworker", daysAgo: 3 },
  { jobTitle: "Full Stack Developer", company: "Linear", status: "applied", daysAgo: 6 },
  { jobTitle: "Frontend Engineer, Growth", company: "Notion", status: "offer", shortNote: "Waiting to hear back on comp", daysAgo: 14 },
  { jobTitle: "React Developer", company: "Stripe", status: "rejected", daysAgo: 20 },
  { jobTitle: "Software Engineer", company: "Figma", status: "saved", daysAgo: 1 },
  { jobTitle: "Product Engineer", company: "Retool", status: "applied", daysAgo: 9 },
  { jobTitle: "MERN Stack Developer", company: "MongoDB", status: "interview", daysAgo: 2 },
  { jobTitle: "Full Stack Engineer", company: "Supabase", status: "applied", daysAgo: 5 },
  { jobTitle: "Frontend Developer", company: "Raycast", status: "rejected", daysAgo: 25 },
  { jobTitle: "Web Developer", company: "Shopify", status: "saved", daysAgo: 0 },
  { jobTitle: "React Native Engineer", company: "Discord", status: "applied", daysAgo: 11 },
  { jobTitle: "Node.js Developer", company: "Netflix", status: "rejected", daysAgo: 30 },
  { jobTitle: "Senior MERN Engineer", company: "Atlassian", status: "interview", daysAgo: 7 },
  { jobTitle: "Full Stack Developer", company: "GitHub", status: "applied", daysAgo: 15 },
  { jobTitle: "UI Engineer", company: "Apple", status: "saved", daysAgo: 2 },
  { jobTitle: "Frontend Developer", company: "Spotify", status: "offer", shortNote: "Great team!", daysAgo: 18 },
  { jobTitle: "Software Engineer II", company: "Microsoft", status: "rejected", daysAgo: 40 },
  { jobTitle: "MERN Stack Dev", company: "Airbnb", status: "applied", daysAgo: 4 },
  { jobTitle: "Full Stack (React/Node)", company: "Slack", status: "interview", daysAgo: 8 },
  { jobTitle: "Web Engineer", company: "Canva", status: "applied", daysAgo: 12 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);

  let user = await User.findOne({ email: DEMO_EMAIL });

  if (!user) {
    const passwordHash = await bcrypt.hash("DemoPass123", 10);
    user = await User.create({
      name: "Demo User",
      email: DEMO_EMAIL,
      passwordHash,
      authProvider: "local",
    });
    console.log("Demo user created:", DEMO_EMAIL);
  } else {
    console.log("Demo user already exists — updating profile fields.");
  }

  user.skills = ["JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "Tailwind CSS"];
  user.experienceLevel = "mid";
  user.preferredRoles = ["Full Stack Developer", "MERN Stack Developer", "Frontend Developer"];
  user.preferredLocations = ["Remote", "Berlin"];
  user.resumeText = DEMO_RESUME;
  await user.save();

  await Application.deleteMany({ userId: user._id });
  await Application.insertMany(
    DEMO_APPLICATIONS.map((app) => ({
      userId: user._id,
      jobTitle: app.jobTitle,
      company: app.company,
      status: app.status,
      shortNote: app.shortNote,
      externalJobId: `demo_${Math.random().toString(36).substr(2, 9)}`,
      dateApplied:
        app.status === "saved"
          ? undefined
          : new Date(Date.now() - app.daysAgo * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - app.daysAgo * 24 * 60 * 60 * 1000),
    })),
  );
  console.log(`Seeded ${DEMO_APPLICATIONS.length} demo applications (replaced old ones).`);

  const existingReview = await CompanyReview.findOne({ userId: user._id });
  if (!existingReview) {
    await CompanyReview.create({
      company: "Vercel",
      companyKey: "vercel",
      userId: user._id,
      rating: 4,
      reviewText:
        "Interview process was fast and the team was transparent about timeline. Take-home task was reasonable, not a multi-day burden.",
    });
    console.log("Seeded 1 demo company review.");
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
