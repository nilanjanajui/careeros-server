import mongoose from "mongoose";
import dotenv from "dotenv";
import AgentTrace from "./src/models/AgentTrace";
dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);
  const latestTrace = await AgentTrace.findOne().sort({ createdAt: -1 }).lean();
  console.log(JSON.stringify(latestTrace, null, 2));
  process.exit(0);
}
main();
