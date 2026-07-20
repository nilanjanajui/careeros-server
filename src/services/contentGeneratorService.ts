import { chatCompletion } from "./groqService";
import { IUser } from "../models/User";
import { ContentType, ContentLength } from "../models/AIGeneration";

export interface JobSnapshot {
  title: string;
  company: string;
  description: string;
}

const LENGTH_GUIDANCE: Record<ContentLength, string> = {
  short:
    "Keep it to 3-4 sentences (cover letter) or 3 bullets (resume bullets). Be concise.",
  medium:
    "Keep it to 2 short paragraphs (cover letter) or 5 bullets (resume bullets).",
  long: "Write 3-4 paragraphs (cover letter) or 8 bullets (resume bullets), covering more specific detail.",
};

function buildCoverLetterPrompt(
  user: IUser,
  job: JobSnapshot,
  length: ContentLength,
): string {
  return `Write a cover letter for this candidate applying to this job. ${LENGTH_GUIDANCE[length]}
Do not use placeholder brackets like [Company Name] — use the real values given. Do not invent facts about the candidate beyond what's given below. Write in first person, professional but not stiff.

Candidate:
- Name: ${user.name}
- Experience level: ${user.experienceLevel}
- Skills: ${user.skills.join(", ") || "not specified"}
${user.resumeText ? `- Resume: ${user.resumeText.slice(0, 2000)}` : ""}

Job:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description.slice(0, 2000)}

Output only the cover letter text, no subject line, no "Dear Hiring Manager" boilerplate beyond a normal greeting.`;
}

function buildResumeBulletsPrompt(
  user: IUser,
  job: JobSnapshot,
  length: ContentLength,
): string {
  return `Generate resume bullet points tailored to this job, based on the candidate's actual background. ${LENGTH_GUIDANCE[length]}
Do not invent specific employers, metrics, or achievements not implied by the resume text given — if the resume text is sparse, write more general but still truthful bullets rather than fabricating specifics.

Candidate:
- Experience level: ${user.experienceLevel}
- Skills: ${user.skills.join(", ") || "not specified"}
${user.resumeText ? `- Resume: ${user.resumeText.slice(0, 2000)}` : "- No resume text on file — write skills-forward bullets from the skills list only."}

Target job:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description.slice(0, 2000)}

Output only the bullet points, one per line, starting with an action verb.`;
}

export async function generateContent(
  user: IUser,
  job: JobSnapshot,
  type: ContentType,
  length: ContentLength,
  regenerate: boolean,
): Promise<{ prompt: string; output: string }> {
  const prompt =
    type === "cover_letter"
      ? buildCoverLetterPrompt(user, job, length)
      : buildResumeBulletsPrompt(user, job, length);

  const message = await chatCompletion(
    [{ role: "user", content: prompt }],
    undefined,
    regenerate ? 0.8 : 0.4,
  );

  if (!message.content) {
    throw new Error("Model returned empty content");
  }

  return { prompt, output: message.content };
}
