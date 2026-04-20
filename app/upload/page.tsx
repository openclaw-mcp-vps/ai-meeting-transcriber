import { redirect } from "next/navigation";
import { FileUploader } from "@/components/FileUploader";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getUsage } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/paywall";

export default async function UploadPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/");
  }

  const usage = getUsage(session.email);
  const usedMinutes = (usage.usedSeconds / 60).toFixed(1);
  const includedMinutes = usage.hasMonthlyPlan ? (usage.includedSeconds / 60).toFixed(0) : "0";
  const overageMinutes = (usage.overageSeconds / 60).toFixed(1);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Meeting Workspace</h1>
        <p className="text-slate-300">
          Upload audio/video or paste a recording URL. You&apos;ll receive a transcript, action items, and sentiment per
          speaker.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle className="mb-1 text-base">Current Usage ({usage.month})</CardTitle>
          <CardDescription>{usedMinutes} minutes processed this month.</CardDescription>
          <p className="mt-3 text-sm text-slate-300">
            {usage.hasMonthlyPlan
              ? `${includedMinutes} included minutes on your monthly plan. ${overageMinutes} minutes above plan are billed at $0.10/min.`
              : "You are on pay-as-you-go billing at $0.10 per minute."}
          </p>
        </Card>

        <Card>
          <CardTitle className="mb-1 text-base">Tip for Faster Turnaround</CardTitle>
          <CardDescription>
            For long calls, export Zoom cloud recordings as MP3 before upload. Smaller files finish faster and reduce failed uploads.
          </CardDescription>
        </Card>
      </div>

      <FileUploader />
    </main>
  );
}
