import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI Meeting Transcriber";
export const size = {
  width: 1200,
  height: 630
};

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          color: "#e2e8f0",
          background:
            "radial-gradient(circle at 20% 10%, rgba(16,185,129,0.25), transparent 35%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.2), transparent 30%), #0d1117"
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#34d399"
          }}
        >
          AI Meeting Transcriber
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 68, lineHeight: 1.05, fontWeight: 700, maxWidth: 900 }}>
            Transcript + Action Items + Sentiment in Minutes
          </div>
          <div style={{ fontSize: 32, color: "#94a3b8" }}>
            Pay-per-use meeting intelligence for founders and remote leads.
          </div>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
