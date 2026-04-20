import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SpeakerSentiment } from "@/lib/types";

interface SentimentAnalysisProps {
  sentiments: SpeakerSentiment[];
}

const sentimentColors: Record<string, string> = {
  positive: "text-emerald-300",
  neutral: "text-slate-300",
  negative: "text-rose-300",
  mixed: "text-amber-300"
};

export function SentimentAnalysis({ sentiments }: SentimentAnalysisProps) {
  return (
    <Card className="space-y-4">
      <div>
        <CardTitle>Participant Sentiment</CardTitle>
        <CardDescription>Per-speaker sentiment tags with rationale and confidence estimates.</CardDescription>
      </div>

      {sentiments.length === 0 ? (
        <p className="text-sm text-slate-400">No per-speaker sentiment could be inferred from this transcript.</p>
      ) : (
        <div className="space-y-3">
          {sentiments.map((entry, index) => (
            <div key={`${entry.speaker}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-100">{entry.speaker}</p>
                <p className={`text-xs font-semibold uppercase tracking-wide ${sentimentColors[entry.sentiment]}`}>
                  {entry.sentiment}
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-300">{entry.rationale}</p>
              <p className="mt-2 text-xs text-slate-500">Confidence: {Math.round(entry.confidence * 100)}%</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
