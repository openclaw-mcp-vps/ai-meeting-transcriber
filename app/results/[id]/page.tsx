import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ActionItems from "@/components/ActionItems";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import TranscriptViewer from "@/components/TranscriptViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasValidAccessCookie } from "@/lib/auth";
import { getJobById } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hasAccess = await hasValidAccessCookie();
  if (!hasAccess) {
    redirect("/?locked=1");
  }

  const job = await getJobById(id);
  if (!job) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meeting Results</h1>
          <p className="text-sm text-slate-400">
            Source: {job.sourceName} • Status: {job.status}
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-700 px-4 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
        >
          Process Another Meeting
        </Link>
      </header>

      {job.error ? (
        <Card className="border-rose-700/40 bg-rose-900/10">
          <CardHeader>
            <CardTitle>Processing Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-rose-200">{job.error}</p>
          </CardContent>
        </Card>
      ) : null}

      {job.transcription ? <TranscriptViewer transcription={job.transcription} /> : null}

      {job.analysis ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <ActionItems
            summary={job.analysis.summary}
            keyDecisions={job.analysis.keyDecisions}
            actionItems={job.analysis.actionItems}
          />
          <SentimentAnalysis sentiments={job.analysis.sentiments} followUps={job.analysis.followUps} />
        </div>
      ) : (
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle>Analysis Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              The transcript exists but analysis is not available yet. Re-run from the upload page.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
