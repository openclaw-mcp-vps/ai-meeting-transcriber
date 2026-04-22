import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ACCESS_COOKIE_NAME,
  clearAccessForCurrentUser,
  hasValidAccessCookie,
  unlockAccessForEmail,
} from "@/lib/auth";

const unlockSchema = z.object({
  email: z.string().email(),
});

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const authorized = await hasValidAccessCookie();
  return NextResponse.json({ authorized });
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const parsed = unlockSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a valid checkout email." }, { status: 400 });
  }

  const token = await unlockAccessForEmail(parsed.data.email);
  if (!token) {
    return NextResponse.json(
      {
        error:
          "No completed purchase was found for that email yet. If you just paid, wait 10-20 seconds for webhook sync and try again.",
      },
      { status: 404 },
    );
  }

  const response = NextResponse.json({
    message: "Access unlocked. You can now process meetings.",
  });

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function DELETE(): Promise<NextResponse> {
  await clearAccessForCurrentUser();

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}
