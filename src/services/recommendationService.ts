import { chatCompletion, ChatMessage, ToolDefinition } from "./groqService";
import { searchJobs, getJobById } from "./adzunaService";
import { Job } from "../types/job";
import AgentTrace, { IAgentTraceStep } from "../models/AgentTrace";
import RecommendationInteraction from "../models/RecommendationInteraction";
import { IUser } from "../models/User";

const MAX_ITERATIONS = 3;

const SEARCH_JOBS_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "search_jobs",
    description:
      "Search live job listings from Adzuna. Call this to find candidate jobs matching the user's profile.",
    parameters: {
      type: "object",
      properties: {
        what: {
          type: "string",
          description: "Job title or keyword to search for",
        },
        where: {
          type: "string",
          description: "Location, e.g. a city or 'remote'",
        },
        country: {
          type: "string",
          description: "2-letter country code (e.g. 'us', 'gb', 'de'). Default to 'us' if unknown.",
        },
        category: { type: "string", description: "Optional job category" },
      },
      required: ["what"],
    },
  },
};

export interface RecommendationResult {
  jobId: string;
  fitScore: number;
  reasoning: string;
}

export interface RecommendationRun {
  recommendations: (RecommendationResult & { job: Job })[];
  traceId: string;
}

function buildSystemPrompt(
  user: IUser,
  recentInteractions: { jobTitle: string; company: string; action: string }[],
): string {
  const interactionNotes =
    recentInteractions.length > 0
      ? `\nRecent user feedback on past recommendations (weigh this — don't repeat patterns the user has dismissed):\n${recentInteractions
          .map((i) => `- ${i.action}: "${i.jobTitle}" at ${i.company}`)
          .join("\n")}`
      : "";

  return `You are a job-matching agent for CareerOS. Find the best-fitting jobs for this user by calling the search_jobs tool (you may call it up to ${MAX_ITERATIONS} times to refine your search based on what you find).

User profile:
- Experience level: ${user.experienceLevel}
- Skills: ${user.skills.join(", ") || "not specified"}
- Preferred roles: ${user.preferredRoles.join(", ") || "not specified"}
- Preferred locations: ${user.preferredLocations.join(", ") || "not specified"}
${user.resumeText ? `- Resume summary: ${user.resumeText.slice(0, 1500)}` : ""}
${interactionNotes}

CRITICAL: When calling search_jobs, if the user specifies a location outside the US (like 'Berlin' or 'London'), you MUST provide the correct 2-letter 'country' code parameter (e.g. 'de' for Germany, 'gb' for UK, 'ca' for Canada, 'au' for Australia, etc.). Valid codes include: us, gb, at, au, br, ca, de, fr, in, it, nl, nz, pl, ru, sg, za. If you search for Berlin without setting country='de', you will get 0 results.

Once you have enough candidate jobs, STOP calling tools and respond with ONLY a JSON object (no markdown fences, no other text) in this exact shape:
{"recommendations": [{"jobId": "<the id field from a search result>", "fitScore": <0-100 integer>, "reasoning": "<one sentence, specific to this job and this user>"}]}

Return at most 8 recommendations, ranked best first. Only include jobId values that actually appeared in your search_jobs results.`;
}

function parseFinalJson(content: string): {
  recommendations: RecommendationResult[];
} {
  const cleaned = content
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed.recommendations)) {
    throw new Error("Model response missing recommendations array");
  }
  return parsed;
}

export async function runRecommendationAgent(
  user: IUser,
): Promise<RecommendationRun> {
  const recentInteractions = await RecommendationInteraction.find({
    userId: user._id,
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(user, recentInteractions) },
    { role: "user", content: "Find my best job matches." },
  ];

  const steps: IAgentTraceStep[] = [];
  let finalResult: { recommendations: RecommendationResult[] } | null = null;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const message = await chatCompletion(messages, [SEARCH_JOBS_TOOL]);

    if (message.tool_calls && message.tool_calls.length > 0) {
      messages.push(message);

      for (const toolCall of message.tool_calls) {
        let args: { what?: string; where?: string; category?: string; country?: string } = {};
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch {
          // model sent malformed arguments — proceed with an empty search rather than crashing the whole run
        }

        const result = await searchJobs({
          what: args.what,
          where: args.where,
          country: args.country,
          category: args.category,
          resultsPerPage: 10,
        });

        steps.push({
          iteration,
          role: "tool",
          toolName: "search_jobs",
          toolArgs: args,
          toolResultSummary: `${result.jobs.length} jobs found`,
        });

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(
            result.jobs.map((j) => ({
              id: j.id,
              title: j.title,
              company: j.company,
              location: j.location,
              category: j.category,
            })),
          ),
        });
      }
      continue;
    }

    steps.push({
      iteration,
      role: "assistant",
      assistantContent: message.content ?? "",
    });
    try {
      finalResult = parseFinalJson(message.content ?? "");
      break;
    } catch {
      messages.push(message);
      messages.push({
        role: "user",
        content:
          "That wasn't valid JSON. Respond with ONLY the JSON object described earlier, nothing else.",
      });
    }
  }

  if (!finalResult) {
    const trace = await AgentTrace.create({
      userId: user._id,
      steps,
      finalRecommendationCount: 0,
    });
    throw Object.assign(
      new Error("Recommendation agent did not converge on a result"),
      { traceId: trace._id },
    );
  }

  const resolved = await Promise.all(
    finalResult.recommendations.map(async (rec) => {
      const job = await getJobById(rec.jobId);
      return job ? { ...rec, job } : null;
    }),
  );
  const recommendations = resolved.filter(
    (r): r is RecommendationResult & { job: Job } => r !== null,
  );

  const trace = await AgentTrace.create({
    userId: user._id,
    steps,
    finalRecommendationCount: recommendations.length,
  });

  return { recommendations, traceId: String(trace._id) };
}
