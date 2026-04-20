import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutUrl } from "@/lib/lemonsqueezy";

const schema = z
  .object({
    email: z.string().email().optional()
  })
  .optional();

export async function POST(request: NextRequest) {
  try {
    const parsed = schema.parse(await request.json().catch(() => ({})));
    const checkoutUrl = await createCheckoutUrl(parsed?.email);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start checkout.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
