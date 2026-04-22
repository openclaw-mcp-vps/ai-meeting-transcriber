"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ApiErrorPayload {
  error?: string;
}

export default function FileUploader() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Upload a recording to begin.");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);

    if (!selectedFile && recordingUrl.trim().length === 0) {
      setErrorMessage("Attach an .mp3/.mp4 file or provide a recording URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      if (recordingUrl.trim().length > 0) {
        formData.append("recordingUrl", recordingUrl.trim());
      }

      setStatusMessage("Transcribing with Whisper...");
      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcribePayload = (await transcribeResponse.json()) as
        | { jobId: string }
        | ApiErrorPayload;

      if (!transcribeResponse.ok || !("jobId" in transcribePayload)) {
        throw new Error(
          (transcribePayload as ApiErrorPayload).error ??
            "Transcription failed. Confirm your recording is reachable and under 25MB.",
        );
      }

      const jobId = transcribePayload.jobId;

      setStatusMessage("Extracting action items and speaker sentiment with Claude...");
      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      const analyzePayload = (await analyzeResponse.json()) as ApiErrorPayload;
      if (!analyzeResponse.ok) {
        throw new Error(analyzePayload.error ?? "Analysis failed.");
      }

      setStatusMessage("Done. Opening your meeting report...");
      router.push(`/results/${jobId}`);
    } catch (submitError) {
      setErrorMessage(submitError instanceof Error ? submitError.message : "Unexpected error.");
      setStatusMessage("Upload a recording to begin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-700 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-xl">New Meeting</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="meeting-file" className="text-sm font-medium text-slate-300">
              Upload audio/video
            </label>
            <Input
              id="meeting-file"
              type="file"
              accept=".mp3,.mp4,.m4a,.wav,.webm"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setSelectedFile(nextFile);
              }}
            />
            <p className="text-xs text-slate-500">
              Whisper supports files up to 25MB. Split long meetings into parts if needed.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="recording-url" className="text-sm font-medium text-slate-300">
              Or paste recording URL
            </label>
            <Input
              id="recording-url"
              type="url"
              placeholder="https://zoom.us/rec/download/..."
              value={recordingUrl}
              onChange={(event) => setRecordingUrl(event.target.value)}
            />
            <p className="text-xs text-slate-500">
              Use direct download links (Zoom cloud recording links work when public or authenticated).
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Meeting
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                Transcribe + Analyze
              </>
            )}
          </Button>

          <p className="text-sm text-slate-300">{statusMessage}</p>
          {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
