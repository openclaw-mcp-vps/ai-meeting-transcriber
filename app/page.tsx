import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, DollarSign, Mic, ShieldCheck } from "lucide-react";
import { PricingCheckout } from "@/components/PricingCheckout";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getSessionFromCookies } from "@/lib/paywall";

const faq = [
  {
    question: "Why not just use Fireflies or Otter?",
    answer:
      "If your team runs only a handful of meetings monthly, fixed per-seat subscriptions waste budget. This tool prices by audio minutes so low-volume founders spend less while still getting transcript quality and action extraction."
  },
  {
    question: "How accurate are action items and sentiment tags?",
    answer:
      "Whisper handles raw speech transcription, then Claude maps tasks to owners and applies per-speaker sentiment with rationale. You still get full transcript context to validate every callout quickly."
  },
  {
    question: "Do I need to install any desktop software?",
    answer:
      "No installation. Upload an .mp3/.mp4 or paste a recording URL and process directly in browser."
  },
  {
    question: "What happens after I purchase?",
    answer:
      "Webhook-confirmed purchases are stored, then your browser gets a signed access cookie when you unlock with your checkout email. The upload and results workspace stays behind that paywall."
  }
];

export default async function HomePage() {
  const session = await getSessionFromCookies();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-200">AI Meeting Transcriber</p>
        <div className="flex items-center gap-2">
          {session ? (
            <Button asChild>
              <Link href="/upload">Open Workspace</Link>
            </Button>
          ) : (
            <Button variant="secondary" asChild>
              <Link href="#pricing">View Pricing</Link>
            </Button>
          )}
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full border border-emerald-600/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300">
            Meeting Tool for Founders and Team Leads
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Drop a recording. Get a transcript, owner-assigned action items, and speaker sentiment.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Save hours after every customer call, standup, and retrospective. Whisper handles transcription.
            Claude structures follow-up tasks by owner and tags sentiment so you spot risk fast.
          </p>
          <div className="flex flex-wrap gap-3">
            {session ? (
              <Button size="lg" asChild>
                <Link href="/upload">
                  Go to Transcriber
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild>
                <a href="#pricing">
                  Start Paid Access
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <a href="#how-it-works">See Workflow</a>
            </Button>
          </div>
        </div>

        <Card className="space-y-5">
          <div className="grid gap-3">
            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <DollarSign className="mt-0.5 size-4 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-slate-100">Only pay for minutes processed</p>
                <p className="text-sm text-slate-400">$0.10/minute pay-as-you-go or $49 for 10 hours/month.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <CalendarClock className="mt-0.5 size-4 text-sky-300" />
              <div>
                <p className="text-sm font-semibold text-slate-100">Built for 5-10 meetings per month</p>
                <p className="text-sm text-slate-400">No per-user tax when your call volume is inconsistent.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <ShieldCheck className="mt-0.5 size-4 text-violet-300" />
              <div>
                <p className="text-sm font-semibold text-slate-100">Paywall-protected workspace</p>
                <p className="text-sm text-slate-400">Upload and results pages are only available after purchase unlock.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section id="problem" className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardTitle className="mb-2 text-base">Subscription Waste</CardTitle>
          <CardDescription>
            Most transcription tools charge per seat even when meetings are occasional. Founders end up paying for idle capacity.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle className="mb-2 text-base">Follow-up Gets Lost</CardTitle>
          <CardDescription>
            Notes live in chat threads and action items lose owners. Teams miss deadlines because no one has structured output.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle className="mb-2 text-base">Signal is Buried</CardTitle>
          <CardDescription>
            Raw transcripts are hard to scan. Without sentiment tags by speaker, escalations hide in long transcripts.
          </CardDescription>
        </Card>
      </section>

      <section id="how-it-works" className="space-y-5">
        <h2 className="text-2xl font-semibold text-white">How It Works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-3">
            <Mic className="size-5 text-emerald-300" />
            <CardTitle className="text-base">1. Upload or Paste URL</CardTitle>
            <CardDescription>Bring .mp3/.mp4 files or a meeting recording URL from Zoom cloud storage.</CardDescription>
          </Card>
          <Card className="space-y-3">
            <CheckCircle2 className="size-5 text-sky-300" />
            <CardTitle className="text-base">2. Whisper Transcribes</CardTitle>
            <CardDescription>Speech is converted into a searchable transcript with minute-level usage tracking.</CardDescription>
          </Card>
          <Card className="space-y-3">
            <ShieldCheck className="size-5 text-violet-300" />
            <CardTitle className="text-base">3. Claude Structures Output</CardTitle>
            <CardDescription>
              Action items are mapped to owners and each participant receives a sentiment label with rationale.
            </CardDescription>
          </Card>
        </div>
      </section>

      <section id="pricing" className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="space-y-4 border-emerald-600/40 bg-emerald-500/5">
            <CardTitle>Pay as You Go</CardTitle>
            <p className="text-3xl font-semibold text-white">$0.10/min</p>
            <CardDescription>
              Best for solo founders running occasional investor calls, customer interviews, and weekly team syncs.
            </CardDescription>
          </Card>
          <Card className="space-y-4">
            <CardTitle>Founder Pro</CardTitle>
            <p className="text-3xl font-semibold text-white">$49/mo</p>
            <CardDescription>
              Includes 10 hours monthly processing. Ideal for remote team leads who want predictable spend.
            </CardDescription>
          </Card>
        </div>
        <PricingCheckout />
      </section>

      <section id="faq" className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">FAQ</h2>
        <div className="grid gap-3">
          {faq.map((item) => (
            <Card key={item.question} className="space-y-2">
              <CardTitle className="text-base">{item.question}</CardTitle>
              <CardDescription className="text-sm leading-6">{item.answer}</CardDescription>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
