import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createAccessSession,
  hasPaidAccess,
  revokeAccessSession,
  validateAccessSession,
} from "@/lib/db";

export const ACCESS_COOKIE_NAME = process.env.ACCESS_COOKIE_NAME ?? "amt_access";

export async function hasValidAccessCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  const session = await validateAccessSession(token);
  return Boolean(session);
}

export async function requireApiAccess(): Promise<NextResponse | null> {
  const isAuthorized = await hasValidAccessCookie();
  if (isAuthorized) {
    return null;
  }

  return NextResponse.json(
    {
      error:
        "This feature is paywalled. Complete checkout, then unlock access with the same email on the home page.",
    },
    { status: 402 },
  );
}

export async function unlockAccessForEmail(email: string): Promise<string | null> {
  const paid = await hasPaidAccess(email);
  if (!paid) {
    return null;
  }

  return createAccessSession(email);
}

export async function clearAccessForCurrentUser(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) {
    return;
  }

  await revokeAccessSession(token);
}
