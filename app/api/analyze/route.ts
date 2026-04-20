import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeTranscript } from "@/lib/claude";
import { getMeetingForOwner, saveMeetingAnalysis } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/paywall";

export const runtime = "nodejs";

const schema = z.object({
  meetingId: z.string().uuid()
});

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: "Purchase required before using analysis." }, { status: 401 });
  }

  try {
    const { meetingId } = schema.parse(await request.json());

    const meeting = getMeetingForOwner(meetingId, session.email);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    }

    if (meeting.analysis) {
      return NextResponse.json({ analysis: meeting.analysis });
    }

    const analysis = await analyzeTranscript(meeting.transcript);
    saveMeetingAnalysis(meetingId, analysis);

    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed unexpectedly.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
