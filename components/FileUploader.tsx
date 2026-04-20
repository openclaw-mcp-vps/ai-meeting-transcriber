"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function FileUploader() {
  const router = useRouter();
  const [mode, setMode] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const runPipeline = async () => {
    setError("");

    if (mode === "file" && !file) {
      setError("Select an .mp3 or .mp4 file to continue.");
      return;
    }

    if (mode === "url" && !recordingUrl.trim()) {
      setError("Paste a Zoom or direct recording URL to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      setStatus("Uploading recording and generating transcript...");
      const formData = new FormData();

      if (mode === "file" && file) {
        formData.append("file", file);
      }

      if (mode === "url") {
        formData.append("recordingUrl", recordingUrl.trim());
      }

      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData
      });

      const transcribePayload = (await transcribeResponse.json()) as {
        error?: string;
        meetingId?: string;
      };

      if (!transcribeResponse.ok || !transcribePayload.meetingId) {
        throw new Error(transcribePayload.error ?? "Unable to transcribe meeting.");
      }

      setStatus("Extracting action items and speaker sentiment...");
      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ meetingId: transcribePayload.meetingId })
      });

      const analyzePayload = (await analyzeResponse.json()) as { error?: string };
      if (!analyzeResponse.ok) {
        throw new Error(analyzePayload.error ?? "Unable to analyze transcript.");
      }

      router.push(`/results/${transcribePayload.meetingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error while processing meeting.");
    } finally {
      setIsSubmitting(false);
      setStatus("");
    }
  };

  return (
    <Card className="space-y-4 p-5 sm:p-6">
      <div>
        <CardTitle>Upload Meeting Recording</CardTitle>
        <CardDescription>
          Works with `.mp3` and `.mp4` files up to 25MB, or paste a recording URL from Zoom cloud.
        </CardDescription>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant={mode === "file" ? "default" : "secondary"} onClick={() => setMode("file")}>
          <Upload className="mr-2 size-4" />
          File Upload
        </Button>
        <Button variant={mode === "url" ? "default" : "secondary"} onClick={() => setMode("url")}>
          <Link2 className="mr-2 size-4" />
          Recording URL
        </Button>
      </div>

      {mode === "file" ? (
        <Input
          type="file"
          accept="audio/mpeg,video/mp4,audio/mp3"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            setFile(nextFile);
          }}
        />
      ) : (
        <Input
          placeholder="https://zoom.us/rec/share/..."
          value={recordingUrl}
          onChange={(event) => setRecordingUrl(event.target.value)}
        />
      )}

      {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <Button className="w-full" size="lg" disabled={isSubmitting} onClick={runPipeline}>
        {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        {isSubmitting ? "Processing Meeting..." : "Transcribe and Analyze"}
      </Button>
    </Card>
  );
}
