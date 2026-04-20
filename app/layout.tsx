import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import "@/app/globals.css";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-meeting-transcriber.app"),
  title: {
    default: "AI Meeting Transcriber | Transcript, Action Items, Sentiment",
    template: "%s | AI Meeting Transcriber"
  },
  description:
    "Upload an .mp3/.mp4 or paste a Zoom recording URL. Whisper creates a transcript, Claude extracts owner-assigned action items, and speaker sentiment is tagged in minutes.",
  openGraph: {
    title: "AI Meeting Transcriber",
    description:
      "Skip $18/user subscriptions. Pay only for minutes processed and get transcript, action items, and speaker sentiment from every meeting.",
    url: "https://ai-meeting-transcriber.app",
    siteName: "AI Meeting Transcriber",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AI Meeting Transcriber dashboard preview"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Meeting Transcriber",
    description:
      "Drop a recording URL, get clean transcript + owner-assigned tasks + sentiment by speaker.",
    images: ["/opengraph-image"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} bg-[#0d1117] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
