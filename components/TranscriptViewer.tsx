import type { TranscriptData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatTimestamp(seconds: number): string {
  const normalized = Math.max(0, Math.round(seconds));
  const min = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const sec = (normalized % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

export default function TranscriptViewer({ transcription }: { transcription: TranscriptData }) {
  return (
    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle>Transcript</CardTitle>
        <CardDescription>
          Language: {transcription.language.toUpperCase()} • Duration:{" "}
          {transcription.durationSeconds ? `${Math.ceil(transcription.durationSeconds / 60)} min` : "n/a"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap leading-7 text-slate-200">{transcription.text}</p>

        {transcription.segments.length > 0 ? (
          <div className="space-y-2 border-t border-slate-800 pt-4">
            {transcription.segments.map((segment, index) => (
              <div key={`${segment.start}-${index}`} className="rounded-lg border border-slate-800 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
                  <span>{segment.speaker}</span>
                  <span>
                    {formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}
                  </span>
                </div>
                <p className="text-sm text-slate-200">{segment.text}</p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
