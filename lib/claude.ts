import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AnalysisData, TranscriptData } from "@/lib/types";

const actionItemSchema = z.object({
  assignee: z.string().min(1),
  task: z.string().min(1),
  dueDate: z.string().nullable(),
  priority: z.enum(["high", "medium", "low"]),
});

const sentimentSchema = z.object({
  speaker: z.string().min(1),
  sentiment: z.enum(["positive", "neutral", "negative", "mixed"]),
  evidence: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

const analysisSchema = z.object({
  summary: z.string().min(1),
  keyDecisions: z.array(z.string().min(1)).default([]),
  actionItems: z.array(actionItemSchema).default([]),
  sentiments: z.array(sentimentSchema).default([]),
  followUps: z.array(z.string().min(1)).default([]),
});

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  return anthropicClient;
}

function extractJson(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  throw new Error("Claude response did not contain JSON.");
}

function fallbackSentiment(speakers: string[]): AnalysisData["sentiments"] {
  return speakers.map((speaker) => ({
    speaker,
    sentiment: "neutral",
    evidence: "Not enough confidence to assign a directional sentiment from transcript structure.",
    confidence: 0.4,
  }));
}

export async function analyzeTranscriptWithClaude(transcript: TranscriptData): Promise<AnalysisData> {
  if (!transcript.text) {
    throw new Error("Transcript is empty. Nothing to analyze.");
  }

  const client = getAnthropicClient();
  const model = process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-latest";

  const systemPrompt =
    "You are an expert meeting analyst. Return only strict JSON with actionable output suitable for software ingestion.";

  const userPrompt = `Analyze this meeting transcript and return JSON with this schema:
{
  "summary": "string",
  "keyDecisions": ["string"],
  "actionItems": [
    {
      "assignee": "string",
      "task": "string",
      "dueDate": "ISO date string or null",
      "priority": "high | medium | low"
    }
  ],
  "sentiments": [
    {
      "speaker": "string",
      "sentiment": "positive | neutral | negative | mixed",
      "evidence": "short quote or rationale",
      "confidence": 0.0-1.0
    }
  ],
  "followUps": ["string"]
}

Requirements:
- Assign action items to specific names when present. If no owner is mentioned, use "Unassigned".
- Sentiment must be per speaker and grounded in transcript evidence.
- Do not include markdown fences.
- Keep followUps practical and concise.

Transcript:
${transcript.text}
`;

  const response = await client.messages.create({
    model,
    max_tokens: 1800,
    temperature: 0,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const combinedText = response.content
    .map((block) => {
      if (block.type === "text" && "text" in block && typeof block.text === "string") {
        return block.text;
      }

      return "";
    })
    .filter((value) => value.length > 0)
    .join("\n")
    .trim();

  const jsonPayload = extractJson(combinedText);
  const parsed = analysisSchema.parse(JSON.parse(jsonPayload));

  return {
    summary: parsed.summary,
    keyDecisions: parsed.keyDecisions,
    actionItems: parsed.actionItems,
    sentiments:
      parsed.sentiments.length > 0
        ? parsed.sentiments
        : fallbackSentiment(transcript.speakers.length > 0 ? transcript.speakers : ["Speaker 1"]),
    followUps: parsed.followUps,
  };
}
