import { Card, CardDescription, CardTitle } from "@/components/ui/card";

interface TranscriptViewerProps {
  transcript: string;
  durationSeconds: number;
}

export function TranscriptViewer({ transcript, durationSeconds }: TranscriptViewerProps) {
  const minutes = (durationSeconds / 60).toFixed(1);

  return (
    <Card className="space-y-4">
      <div>
        <CardTitle>Transcript</CardTitle>
        <CardDescription>{minutes} minutes processed by Whisper</CardDescription>
      </div>
      <div className="max-h-[440px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4">
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{transcript}</p>
      </div>
    </Card>
  );
}
