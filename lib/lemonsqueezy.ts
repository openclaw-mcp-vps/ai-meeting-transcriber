import crypto from "node:crypto";
import { createCheckout, lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export function verifyWebhookSignature(body: string, signature: string | null) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return false;
  }

  const digest = crypto.createHmac("sha256", secret).update(body).digest("hex");

  return (
    digest.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  );
}

export async function createCheckoutUrl(email?: string) {
  const storeId = Number(process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID);
  const productId = Number(process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID);
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

  if (apiKey && Number.isFinite(storeId) && Number.isFinite(productId)) {
    lemonSqueezySetup({ apiKey });

    const payload = {
      checkoutOptions: {
        embed: true,
        media: false,
        logo: true
      },
      checkoutData: email ? { email } : undefined
    };

    const response = (await createCheckout(storeId, productId, payload)) as {
      data?: { data?: { attributes?: { url?: string } } };
      error?: { message?: string };
    };

    if (response.error) {
      throw new Error(response.error.message ?? "Unable to create Lemon Squeezy checkout.");
    }

    const url = response.data?.data?.attributes?.url;
    if (url) {
      return url;
    }
  }

  const productIdentifier = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
  if (!productIdentifier) {
    throw new Error("Missing NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID.");
  }

  if (productIdentifier.startsWith("http://") || productIdentifier.startsWith("https://")) {
    return productIdentifier;
  }

  return `https://app.lemonsqueezy.com/checkout/buy/${productIdentifier}`;
}

export function parseWebhookOrder(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const root = payload as {
    meta?: { event_name?: string };
    data?: { id?: string; attributes?: Record<string, unknown> };
  };

  const orderId = root.data?.id;
  const attributes = root.data?.attributes ?? {};
  const email = String(attributes.user_email ?? "").trim().toLowerCase();
  const status = String(attributes.status ?? root.meta?.event_name ?? "unknown");
  const planHint = String((attributes.first_order_item as { product_name?: string } | undefined)?.product_name ?? "");

  if (!orderId || !email) {
    return null;
  }

  return {
    orderId,
    email,
    status,
    planHint
  };
}
