import type { SpeakerSentiment } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function toneFromSentiment(
  sentiment: SpeakerSentiment["sentiment"],
): "positive" | "neutral" | "negative" | "mixed" {
  if (sentiment === "positive") {
    return "positive";
  }

  if (sentiment === "negative") {
    return "negative";
  }

  if (sentiment === "mixed") {
    return "mixed";
  }

  return "neutral";
}

export default function SentimentAnalysis({
  sentiments,
  followUps,
}: {
  sentiments: SpeakerSentiment[];
  followUps: string[];
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle>Participant Sentiment</CardTitle>
        <CardDescription>Per-speaker tone based on language, urgency, and agreement signals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sentiments.length > 0 ? (
          <div className="space-y-3">
            {sentiments.map((entry, index) => (
              <article key={`${entry.speaker}-${index}`} className="rounded-lg border border-slate-800 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-100">{entry.speaker}</h4>
                  <Badge tone={toneFromSentiment(entry.sentiment)}>{entry.sentiment}</Badge>
                  <Badge tone="neutral">Confidence {(entry.confidence * 100).toFixed(0)}%</Badge>
                </div>
                <p className="text-sm text-slate-300">{entry.evidence}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No sentiment signals were found in this transcript.</p>
        )}

        <div>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Recommended Follow-ups</h4>
          {followUps.length > 0 ? (
            <ul className="space-y-2">
              {followUps.map((followUp, index) => (
                <li key={`${followUp}-${index}`} className="rounded-md border border-slate-800 px-3 py-2 text-sm">
                  {followUp}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No follow-up recommendations were generated.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
