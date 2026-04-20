import { NextRequest, NextResponse } from "next/server";
import { recordOrder } from "@/lib/db";
import { parseWebhookOrder, verifyWebhookSignature } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as unknown;
    const order = parseWebhookOrder(payload);

    if (order) {
      recordOrder(order);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Malformed webhook payload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
