import Anthropic from "@anthropic-ai/sdk";
import { AnalysisResult } from "@/lib/types";

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing.");
  }

  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function extractJsonObject(raw: string) {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1);
  }

  return raw;
}

function normalizeAnalysis(input: Partial<AnalysisResult>): AnalysisResult {
  return {
    summary: input.summary?.trim() || "No summary returned.",
    actionItems: (input.actionItems ?? [])
      .filter((item) => item.owner && item.task)
      .map((item) => ({
        owner: item.owner,
        task: item.task,
        dueDate: item.dueDate ?? null,
        priority: item.priority === "high" || item.priority === "low" ? item.priority : "medium"
      })),
    sentiments: (input.sentiments ?? [])
      .filter((sentiment) => sentiment.speaker && sentiment.sentiment)
      .map((sentiment) => ({
        speaker: sentiment.speaker,
        sentiment:
          sentiment.sentiment === "positive" ||
          sentiment.sentiment === "negative" ||
          sentiment.sentiment === "mixed"
            ? sentiment.sentiment
            : "neutral",
        rationale: sentiment.rationale || "No rationale provided.",
        confidence:
          typeof sentiment.confidence === "number"
            ? Math.max(0, Math.min(1, sentiment.confidence))
            : 0.5
      }))
  };
}

export async function analyzeTranscript(transcript: string): Promise<AnalysisResult> {
  const anthropic = getAnthropicClient();
  const prompt = `You are a meeting analyst.
Return strict JSON with this exact shape:
{
  "summary": "string",
  "actionItems": [
    {"owner": "string", "task": "string", "dueDate": "YYYY-MM-DD or null", "priority": "high|medium|low"}
  ],
  "sentiments": [
    {"speaker": "string", "sentiment": "positive|neutral|negative|mixed", "rationale": "string", "confidence": 0.0}
  ]
}
Rules:
- Extract only concrete action items that are assigned to a named person. If no owner is named, use "Unassigned".
- Keep tasks concise and operational.
- Sentiment must be per speaker and based on evidence in transcript.
- Return JSON only, no prose.
Transcript:\n${transcript}`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 1600,
    temperature: 0,
    messages: [{ role: "user", content: prompt }]
  });

  const text = response.content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Claude returned an empty response.");
  }

  const jsonText = extractJsonObject(text);
  const parsed = JSON.parse(jsonText) as Partial<AnalysisResult>;
  return normalizeAnalysis(parsed);
}
