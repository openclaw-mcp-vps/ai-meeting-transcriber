import OpenAI from "openai";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function guessExtension(contentType: string) {
  if (contentType.includes("mp4")) return "mp4";
  if (contentType.includes("mpeg") || contentType.includes("mp3")) return "mp3";
  if (contentType.includes("wav")) return "wav";
  if (contentType.includes("webm")) return "webm";
  return "mp3";
}

function estimateDurationFromTranscript(transcript: string) {
  const words = transcript.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 150;
  return Math.max(30, Math.ceil((words / wordsPerMinute) * 60));
}

export async function recordingUrlToFile(recordingUrl: string) {
  const url = new URL(recordingUrl);
  if (!["https:", "http:"].includes(url.protocol)) {
    throw new Error("Only HTTP(S) recording URLs are supported.");
  }

  const response = await fetch(recordingUrl);
  if (!response.ok) {
    throw new Error(`Unable to download recording: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") ?? "audio/mpeg";
  const bytes = await response.arrayBuffer();

  if (bytes.byteLength > MAX_FILE_BYTES) {
    throw new Error("Recording is too large for direct transcription. Keep uploads under 25MB.");
  }

  const extension = guessExtension(contentType);
  return new File([bytes], `recording.${extension}`, { type: contentType });
}

export async function transcribeMeeting(file: File) {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("File exceeds 25MB. Split the recording and upload in smaller chunks.");
  }

  const openai = getOpenAIClient();
  const response = (await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "verbose_json"
  })) as {
    text: string;
    duration?: number;
    language?: string;
  };

  const transcript = response.text?.trim();
  if (!transcript) {
    throw new Error("Transcription returned empty text.");
  }

  return {
    transcript,
    durationSeconds: Math.ceil(response.duration ?? estimateDurationFromTranscript(transcript)),
    language: response.language ?? "unknown"
  };
}
