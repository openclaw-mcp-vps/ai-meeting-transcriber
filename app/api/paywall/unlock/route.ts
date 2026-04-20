import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasPaidAccess, recordOrder } from "@/lib/db";
import { setSessionCookie } from "@/lib/paywall";

const schema = z.object({
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  try {
    const { email } = schema.parse(await request.json());
    const normalizedEmail = email.trim().toLowerCase();

    const allowDevUnlock =
      process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_UNLOCK === "true";

    if (!hasPaidAccess(normalizedEmail) && !allowDevUnlock) {
      return NextResponse.json(
        {
          error:
            "No paid order found for this email yet. Complete checkout first, then retry in ~30 seconds for webhook sync."
        },
        { status: 402 }
      );
    }

    if (allowDevUnlock && !hasPaidAccess(normalizedEmail)) {
      recordOrder({
        orderId: `dev-${normalizedEmail}`,
        email: normalizedEmail,
        status: "active",
        planHint: "monthly"
      });
    }

    const response = NextResponse.json({
      message: "Access unlocked. You can now process meeting recordings."
    });

    setSessionCookie(response, normalizedEmail);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to unlock workspace.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
