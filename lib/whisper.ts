import path from "node:path";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import type { TranscriptData, TranscriptSegment } from "@/lib/types";

const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024;

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return openaiClient;
}

function filenameFromUrl(inputUrl: string): string {
  try {
    const parsed = new URL(inputUrl);
    const candidate = path.basename(parsed.pathname);
    if (candidate && candidate !== "/") {
      return decodeURIComponent(candidate);
    }
  } catch {
    return "recording.mp4";
  }

  return "recording.mp4";
}

function inferSpeakerLabels(segments: TranscriptSegment[]): TranscriptSegment[] {
  if (segments.length === 0) {
    return [];
  }

  let speakerIndex = 1;
  let previousEnd = 0;

  return segments.map((segment) => {
    const pause = segment.start - previousEnd;
    if (pause > 1.5 && speakerIndex < 6) {
      speakerIndex += 1;
    }

    previousEnd = segment.end;

    return {
      ...segment,
      speaker: `Speaker ${speakerIndex}`,
    };
  });
}

export async function fetchRemoteRecording(recordingUrl: string): Promise<{
  buffer: Buffer;
  filename: string;
  mimeType: string;
}> {
  const response = await fetch(recordingUrl);
  if (!response.ok) {
    throw new Error(`Could not fetch recording URL (${response.status}).`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.byteLength > MAX_AUDIO_SIZE_BYTES) {
    throw new Error("Recording exceeds Whisper's 25MB file size limit.");
  }

  return {
    buffer,
    filename: filenameFromUrl(recordingUrl),
    mimeType: response.headers.get("content-type") ?? "audio/mpeg",
  };
}

export async function transcribeMeetingAudio(input: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}): Promise<TranscriptData> {
  if (input.buffer.byteLength > MAX_AUDIO_SIZE_BYTES) {
    throw new Error("Audio file is too large. Whisper accepts files up to 25MB.");
  }

  const client = getOpenAIClient();

  const audioFile = await toFile(input.buffer, input.filename, {
    type: input.mimeType,
  });

  const result = (await client.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    response_format: "verbose_json",
    temperature: 0,
  })) as {
    text?: string;
    language?: string;
    duration?: number;
    segments?: Array<{ start?: number; end?: number; text?: string }>;
  };

  const segments: TranscriptSegment[] = Array.isArray(result.segments)
    ? result.segments.map((segment) => ({
        start: typeof segment.start === "number" ? segment.start : 0,
        end: typeof segment.end === "number" ? segment.end : 0,
        text: typeof segment.text === "string" ? segment.text.trim() : "",
        speaker: "Speaker 1",
      }))
    : [];

  const labeledSegments = inferSpeakerLabels(segments).filter((segment) => segment.text.length > 0);
  const speakers = Array.from(new Set(labeledSegments.map((segment) => segment.speaker)));

  return {
    text: typeof result.text === "string" ? result.text.trim() : "",
    language: typeof result.language === "string" ? result.language : "unknown",
    durationSeconds: typeof result.duration === "number" ? Math.round(result.duration) : null,
    segments: labeledSegments,
    speakers: speakers.length > 0 ? speakers : ["Speaker 1"],
  };
}
