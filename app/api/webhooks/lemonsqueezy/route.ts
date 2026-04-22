import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { recordStripePurchase } from "@/lib/db";
import {
  extractAmountAndCurrency,
  extractEmailFromStripeEvent,
  shouldGrantAccessForEvent,
  verifyStripeWebhook,
} from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }

  try {
    const event = verifyStripeWebhook(rawBody, signature, secret);

    if (shouldGrantAccessForEvent(event.type)) {
      const email = extractEmailFromStripeEvent(event);
      if (email) {
        const { amountCents, currency } = extractAmountAndCurrency(event);
        await recordStripePurchase({
          email,
          eventId: event.id || crypto.randomUUID(),
          amountCents,
          currency,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook payload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
