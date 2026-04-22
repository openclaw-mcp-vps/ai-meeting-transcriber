import crypto from "node:crypto";

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

function parseStripeSignature(signatureHeader: string): {
  timestamp: string;
  signatures: string[];
} {
  const parts = signatureHeader.split(",").map((entry) => entry.trim());
  const timestampPart = parts.find((entry) => entry.startsWith("t="));
  const signatures = parts
    .filter((entry) => entry.startsWith("v1="))
    .map((entry) => entry.slice(3))
    .filter(Boolean);

  if (!timestampPart || signatures.length === 0) {
    throw new Error("Malformed Stripe signature header.");
  }

  return {
    timestamp: timestampPart.slice(2),
    signatures,
  };
}

function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const first = Buffer.from(a, "hex");
    const second = Buffer.from(b, "hex");

    if (first.length !== second.length) {
      return false;
    }

    return crypto.timingSafeEqual(first, second);
  } catch {
    return false;
  }
}

export function verifyStripeWebhook(rawBody: string, signatureHeader: string, secret: string): StripeWebhookEvent {
  const parsedSignature = parseStripeSignature(signatureHeader);
  const payloadToSign = `${parsedSignature.timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadToSign, "utf8")
    .digest("hex");

  const valid = parsedSignature.signatures.some((candidate) =>
    timingSafeEqualHex(candidate, expectedSignature),
  );

  if (!valid) {
    throw new Error("Invalid Stripe webhook signature.");
  }

  return JSON.parse(rawBody) as StripeWebhookEvent;
}

export function extractEmailFromStripeEvent(event: StripeWebhookEvent): string | null {
  const object = event.data?.object ?? {};

  const candidate =
    (typeof object.customer_email === "string" ? object.customer_email : null) ??
    (typeof (object.customer_details as { email?: unknown } | undefined)?.email === "string"
      ? ((object.customer_details as { email?: string }).email ?? null)
      : null);

  return candidate?.trim().toLowerCase() ?? null;
}

export function extractAmountAndCurrency(event: StripeWebhookEvent): {
  amountCents: number | null;
  currency: string | null;
} {
  const object = event.data?.object ?? {};

  const amountCents =
    typeof object.amount_total === "number"
      ? object.amount_total
      : typeof object.amount_paid === "number"
        ? object.amount_paid
        : null;

  const currency = typeof object.currency === "string" ? object.currency.toLowerCase() : null;

  return { amountCents, currency };
}

export function shouldGrantAccessForEvent(eventType: string): boolean {
  return ["checkout.session.completed", "invoice.paid", "invoice.payment_succeeded"].includes(eventType);
}
