import type { Metadata } from "next";
import "./globals.css";

const defaultTitle = "AI Meeting Transcriber";
const defaultDescription =
  "Drop a recording URL or upload audio/video to get a transcript, action items assigned to names, and per-speaker sentiment in minutes.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: defaultTitle,
    template: `%s | ${defaultTitle}`,
  },
  description: defaultDescription,
  keywords: [
    "AI meeting transcription",
    "meeting action items",
    "speaker sentiment",
    "founder productivity",
    "meeting notes",
  ],
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: "/",
    siteName: defaultTitle,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-[#0d1117] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
