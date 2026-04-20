import { NextRequest, NextResponse } from "next/server";
import { createMeeting, recordUsage } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/paywall";
import { recordingUrlToFile, transcribeMeeting } from "@/lib/whisper";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set(["audio/mpeg", "audio/mp3", "video/mp4"]);

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: "Purchase required before using transcription." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const fileInput = formData.get("file");
    const recordingUrlInput = formData.get("recordingUrl");

    let file: File | null = null;
    let sourceType: "file" | "url" = "file";
    let sourceName = "Uploaded recording";

    if (fileInput instanceof File && fileInput.size > 0) {
      file = fileInput;
      sourceType = "file";
      sourceName = file.name;

      if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: "Only .mp3 and .mp4 files are currently supported." },
          { status: 400 }
        );
      }
    } else if (typeof recordingUrlInput === "string" && recordingUrlInput.trim().length > 0) {
      sourceType = "url";
      sourceName = recordingUrlInput.trim();
      file = await recordingUrlToFile(recordingUrlInput.trim());
    }

    if (!file) {
      return NextResponse.json(
        { error: "Provide an .mp3/.mp4 upload or a recording URL." },
        { status: 400 }
      );
    }

    const { transcript, durationSeconds, language } = await transcribeMeeting(file);

    const meeting = createMeeting({
      ownerEmail: session.email,
      sourceType,
      sourceName,
      durationSeconds,
      transcript
    });

    recordUsage(session.email, durationSeconds);

    return NextResponse.json({
      meetingId: meeting.id,
      durationSeconds,
      language,
      transcriptPreview: transcript.slice(0, 300)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed unexpectedly.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
