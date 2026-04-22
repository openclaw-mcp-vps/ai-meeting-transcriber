import { NextResponse } from "next/server";
import { z } from "zod";
import { markJobFailed, createJob, updateJobTranscription } from "@/lib/db";
import { requireApiAccess } from "@/lib/auth";
import { fetchRemoteRecording, transcribeMeetingAudio } from "@/lib/whisper";

export const runtime = "nodejs";

function humanizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected transcription error.";
}

const recordingUrlSchema = z.string().url();

export async function POST(request: Request): Promise<NextResponse> {
  const blockedResponse = await requireApiAccess();
  if (blockedResponse) {
    return blockedResponse;
  }

  const formData = await request.formData();
  const maybeFile = formData.get("file");
  const maybeUrl = formData.get("recordingUrl");

  const hasFile = maybeFile instanceof File && maybeFile.size > 0;
  const recordingUrl = typeof maybeUrl === "string" ? maybeUrl.trim() : "";

  if (!hasFile && recordingUrl.length === 0) {
    return NextResponse.json(
      { error: "Provide either a file upload or a recording URL." },
      { status: 400 },
    );
  }

  if (recordingUrl.length > 0) {
    const urlCheck = recordingUrlSchema.safeParse(recordingUrl);
    if (!urlCheck.success) {
      return NextResponse.json({ error: "Recording URL is not a valid URL." }, { status: 400 });
    }
  }

  const sourceType = hasFile ? "file" : "url";
  const sourceName = hasFile ? (maybeFile as File).name : recordingUrl;

  const job = await createJob({ sourceType, sourceName });

  try {
    let buffer: Buffer;
    let filename: string;
    let mimeType: string;

    if (hasFile) {
      const file = maybeFile as File;
      buffer = Buffer.from(await file.arrayBuffer());
      filename = file.name || "recording.mp3";
      mimeType = file.type || "audio/mpeg";
    } else {
      const remote = await fetchRemoteRecording(recordingUrl);
      buffer = remote.buffer;
      filename = remote.filename;
      mimeType = remote.mimeType;
    }

    const transcription = await transcribeMeetingAudio({
      buffer,
      filename,
      mimeType,
    });

    await updateJobTranscription(job.id, transcription);

    return NextResponse.json({
      jobId: job.id,
      transcription,
    });
  } catch (error) {
    const message = humanizeError(error);
    await markJobFailed(job.id, message);

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}
