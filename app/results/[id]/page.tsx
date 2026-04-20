import { notFound, redirect } from "next/navigation";
import { ActionItems } from "@/components/ActionItems";
import { SentimentAnalysis } from "@/components/SentimentAnalysis";
import { TranscriptViewer } from "@/components/TranscriptViewer";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getMeetingForOwner } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/paywall";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/");
  }

  const { id } = await params;
  const meeting = getMeetingForOwner(id, session.email);

  if (!meeting) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Analysis Results</h1>
        <p className="text-slate-300">
          Source: {meeting.sourceName} · Created {new Date(meeting.createdAt).toLocaleString()}
        </p>
      </section>

      {meeting.analysis ? (
        <Card>
          <CardTitle className="mb-2 text-base">Executive Summary</CardTitle>
          <CardDescription className="text-sm text-slate-300">{meeting.analysis.summary}</CardDescription>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <ActionItems items={meeting.analysis?.actionItems ?? []} />
        <SentimentAnalysis sentiments={meeting.analysis?.sentiments ?? []} />
      </div>

      <TranscriptViewer transcript={meeting.transcript} durationSeconds={meeting.durationSeconds} />
    </main>
  );
}
