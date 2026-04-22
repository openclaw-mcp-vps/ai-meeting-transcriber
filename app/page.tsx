import Link from "next/link";
import { CheckCircle2, Clock3, FileText, Users } from "lucide-react";
import UnlockAccessForm from "@/components/UnlockAccessForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const faqItems = [
  {
    question: "How does billing work?",
    answer:
      "You can pay per use at $0.10/minute, or choose the $49 monthly plan for up to 10 hours. Payments use Stripe hosted checkout.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No installs, no plugins. Upload an .mp3/.mp4 file or paste a recording URL and get structured output in your browser.",
  },
  {
    question: "What does the output include?",
    answer:
      "You get a full transcript, key decisions, action items assigned to names, and sentiment tags by speaker.",
  },
  {
    question: "Can I use Zoom cloud recordings?",
    answer:
      "Yes. Paste a direct Zoom recording link. If your link requires authentication, make sure your server can access it.",
  },
];

const problemPoints = [
  "Manual notes after each meeting quietly cost 30-60 minutes of founder time.",
  "Subscription tools charge per seat even when your team runs only a few meetings each month.",
  "Important owner assignments get lost in long recordings and chat noise.",
];

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#1a2332_0%,#0d1117_45%)]" />

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Meeting Tools for Founders
            </p>

            <h1 className="text-4xl font-bold leading-tight text-slate-100 sm:text-5xl">
              AI Meeting Transcriber
              <span className="block text-emerald-300">
                Drop a recording URL, get transcript + actions + sentiment.
              </span>
            </h1>

            <p className="max-w-2xl text-lg text-slate-300">
              Built for solo founders and remote team leads who only run 5-10 meetings a month. Stop paying
              per-user subscription fees when pay-per-use gives you the same output for a fraction of the
              cost.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? ""}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-400 px-6 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
              >
                Buy Access
              </a>
              <Link
                href="/upload"
                className="inline-flex h-11 items-center justify-center rounded-md border border-slate-700 px-6 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                Open Transcriber
              </Link>
            </div>

            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <Clock3 className="mb-2 h-4 w-4 text-emerald-300" />
                <p>$0.10/min pay-per-use</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <Users className="mb-2 h-4 w-4 text-emerald-300" />
                <p>$49/mo for 10 hrs</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <FileText className="mb-2 h-4 w-4 text-emerald-300" />
                <p>No installation needed</p>
              </div>
            </div>
          </div>

          <Card className="border-slate-700 bg-slate-900/70">
            <CardHeader>
              <CardTitle>Unlock Your Workspace</CardTitle>
              <CardDescription>
                1) Complete checkout with Stripe. 2) Enter the same email here. 3) Start transcribing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <UnlockAccessForm />
              <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
                <p className="font-semibold text-slate-100">What you get after upload</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                    Whisper transcript with timestamps
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                    Claude-generated action items assigned to names
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                    Per-speaker sentiment and recommended follow-ups
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        {problemPoints.map((point) => (
          <Card key={point} className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-base">Problem</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">{point}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Why Founders Switch</CardTitle>
              <CardDescription>
                Fireflies and similar tools are strong products, but subscription pricing is hard to justify
                when your meeting volume is variable.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>
                With AI Meeting Transcriber, you pay for actual meeting minutes. No seat count pressure. No
                team rollout overhead. No desktop app rollout.
              </p>
              <p>
                Your output is immediately shareable: transcript, decisions, owners, and sentiment by speaker.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Simple plans that map to startup meeting cadence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg border border-slate-800 p-4">
                <p className="text-slate-200">Pay as you go</p>
                <p className="text-2xl font-semibold text-emerald-300">$0.10 / minute</p>
                <p className="mt-1 text-slate-400">Ideal for 1-8 meetings each month.</p>
              </div>
              <div className="rounded-lg border border-slate-800 p-4">
                <p className="text-slate-200">Founder plan</p>
                <p className="text-2xl font-semibold text-emerald-300">$49 / month</p>
                <p className="mt-1 text-slate-400">Includes up to 10 hours of recordings per month.</p>
              </div>
              <a
                href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? ""}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-300/30 bg-emerald-400/10 px-4 font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
              >
                Go to Stripe Checkout
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-2xl font-semibold">FAQ</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <Card key={item.question} className="border-slate-800 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-base">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Ready to stop manual meeting notes?</h3>
            <p className="text-sm text-slate-300">Checkout takes under a minute, then you can upload right away.</p>
          </div>
          <a
            href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? ""}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 sm:w-auto"
          >
            Buy and Start Transcribing
          </a>
        </div>
      </section>
    </main>
  );
}
