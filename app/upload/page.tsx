import { redirect } from "next/navigation";
import FileUploader from "@/components/FileUploader";
import { hasValidAccessCookie } from "@/lib/auth";

export const metadata = {
  title: "Upload Meeting",
  description: "Upload a recording or paste a meeting URL to generate transcript and action items.",
};

export default async function UploadPage() {
  const hasAccess = await hasValidAccessCookie();
  if (!hasAccess) {
    redirect("/?locked=1");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Upload Recording</h1>
        <p className="text-slate-300">
          Add an .mp3/.mp4 file or paste a Zoom recording URL. We transcribe with Whisper, then extract action
          items and speaker sentiment with Claude.
        </p>
      </header>

      <FileUploader />
    </main>
  );
}
