import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAccess } from "@/lib/auth";
import { analyzeTranscriptWithClaude } from "@/lib/claude";
import { getJobById, markJobFailed, updateJobAnalysis } from "@/lib/db";

const requestSchema = z.object({
  jobId: z.string().min(1),
});

export const runtime = "nodejs";

function humanizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected analysis error.";
}

export async function POST(request: Request): Promise<NextResponse> {
  const blockedResponse = await requireApiAccess();
  if (blockedResponse) {
    return blockedResponse;
  }

  const payload = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Request body must include a valid jobId." }, { status: 400 });
  }

  const job = await getJobById(parsed.data.jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  if (!job.transcription) {
    return NextResponse.json(
      { error: "Job has no transcript yet. Run /api/transcribe first." },
      { status: 400 },
    );
  }

  if (job.analysis) {
    return NextResponse.json({
      jobId: job.id,
      analysis: job.analysis,
      cached: true,
    });
  }

  try {
    const analysis = await analyzeTranscriptWithClaude(job.transcription);
    await updateJobAnalysis(job.id, analysis);

    return NextResponse.json({
      jobId: job.id,
      analysis,
    });
  } catch (error) {
    const message = humanizeError(error);
    await markJobFailed(job.id, message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
