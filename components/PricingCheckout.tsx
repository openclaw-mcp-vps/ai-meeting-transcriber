"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    LemonSqueezy?: {
      Url?: {
        Open: (url: string) => void;
      };
    };
  }
}

export function PricingCheckout() {
  const router = useRouter();
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [unlockEmail, setUnlockEmail] = useState("");
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://app.lemonsqueezy.com/js/lemon.js"]'
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://app.lemonsqueezy.com/js/lemon.js";
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const startCheckout = async () => {
    setIsCreatingCheckout(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/paywall/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: checkoutEmail.trim() || undefined })
      });

      const payload = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Unable to initialize checkout.");
      }

      if (window.LemonSqueezy?.Url?.Open) {
        window.LemonSqueezy.Url.Open(payload.url);
      } else {
        window.location.href = payload.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const unlockAccess = async () => {
    if (!unlockEmail.trim()) {
      setError("Enter the email used at checkout to unlock access.");
      return;
    }

    setIsUnlocking(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/paywall/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: unlockEmail.trim() })
      });

      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to unlock access.");
      }

      setMessage(payload.message ?? "Access unlocked. Redirecting...");
      router.push("/upload");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed.");
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/50 p-5">
      <div>
        <p className="text-sm font-semibold text-slate-200">Start paid access</p>
        <p className="text-xs text-slate-400">
          Complete checkout, then use the same email below to unlock your workspace.
        </p>
      </div>

      <Input
        type="email"
        placeholder="you@company.com (optional for checkout prefill)"
        value={checkoutEmail}
        onChange={(event) => setCheckoutEmail(event.target.value)}
      />

      <Button className="w-full" onClick={startCheckout} disabled={isCreatingCheckout}>
        {isCreatingCheckout ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        {isCreatingCheckout ? "Opening Checkout..." : "Buy Access with Lemon Squeezy"}
      </Button>

      <div className="h-px bg-slate-800" />

      <Input
        type="email"
        placeholder="Email used for payment"
        value={unlockEmail}
        onChange={(event) => setUnlockEmail(event.target.value)}
      />

      <Button className="w-full" variant="secondary" onClick={unlockAccess} disabled={isUnlocking}>
        {isUnlocking ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        {isUnlocking ? "Unlocking..." : "Unlock Tool"}
      </Button>

      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
