const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface GroqResponse {
  choices: {
    message: ChatMessage;
    finish_reason: string;
  }[];
}

function requireApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Missing required env var: GROQ_API_KEY");
  return key;
}

export async function chatCompletion(
  messages: ChatMessage[],
  tools?: ToolDefinition[],
  temperature = 0.3,
): Promise<ChatMessage> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requireApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(tools ? { tools, tool_choice: "auto" } : {}),
      temperature,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Groq request failed: ${res.status} ${res.statusText} ${body}`,
    );
  }

  const data = (await res.json()) as GroqResponse;
  const choice = data.choices[0];
  if (!choice) throw new Error("Groq returned no choices");
  return choice.message;
}
