import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User";
import Application from "../models/Application";
import CompanyReview from "../models/CompanyReview";

dotenv.config();

const DEMO_EMAIL = "demo@careeros.app";

const DEMO_RESUME = `Frontend-leaning full stack developer with 4 years of experience building React/Node applications. Led the migration of a legacy jQuery dashboard to a React + TypeScript stack at my last role, cutting page load time by roughly a third. Comfortable across the stack — REST APIs in Node/Express, MongoDB schema design, and CI/CD with GitHub Actions. Most recently shipped a real-time notifications feature end to end, from WebSocket server to frontend UI. Looking for a role where I can keep working close to the product, ideally on a small team.`;

const DEMO_APPLICATIONS: {
  jobTitle: string;
  company: string;
  status: "saved" | "applied" | "interview" | "offer" | "rejected";
  shortNote?: string;
  daysAgo: number;
}[] = [
  {
    jobTitle: "Senior Frontend Engineer",
    company: "Vercel",
    status: "interview",
    shortNote: "Referred by a former coworker",
    daysAgo: 3,
  },
  {
    jobTitle: "Full Stack Developer",
    company: "Linear",
    status: "applied",
    daysAgo: 6,
  },
  {
    jobTitle: "Frontend Engineer, Growth",
    company: "Notion",
    status: "offer",
    shortNote: "Waiting to hear back on comp",
    daysAgo: 14,
  },
  {
    jobTitle: "React Developer",
    company: "Stripe",
    status: "rejected",
    daysAgo: 20,
  },
  {
    jobTitle: "Software Engineer",
    company: "Figma",
    status: "saved",
    daysAgo: 1,
  },
  {
    jobTitle: "Product Engineer",
    company: "Retool",
    status: "applied",
    daysAgo: 9,
  },
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

  user.skills = ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB"];
  user.experienceLevel = "mid";
  user.preferredRoles = ["Frontend Developer", "Full Stack Developer"];
  user.preferredLocations = ["Remote", "Berlin"];
  user.resumeText = DEMO_RESUME;
  await user.save();

  const existingApplicationCount = await Application.countDocuments({
    userId: user._id,
  });
  if (existingApplicationCount === 0) {
    await Application.insertMany(
      DEMO_APPLICATIONS.map((app) => ({
        userId: user._id,
        jobTitle: app.jobTitle,
        company: app.company,
        status: app.status,
        shortNote: app.shortNote,
        dateApplied:
          app.status === "saved"
            ? undefined
            : new Date(Date.now() - app.daysAgo * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - app.daysAgo * 24 * 60 * 60 * 1000),
      })),
    );
    console.log(`Seeded ${DEMO_APPLICATIONS.length} demo applications.`);
  } else {
    console.log("Demo user already has applications — leaving them as-is.");
  }

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
