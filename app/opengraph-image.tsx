import { ImageResponse } from "next/og";

export const alt = "AutomateAI — your AI agent in your pocket";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#f6f1e8",
          color: "#16202a",
          padding: "80px",
          fontFamily: "Georgia, ui-serif, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 18,
            background: "#1d4ed8",
          }}
        />
        <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>AutomateAI</div>
        <div style={{ fontSize: 72, lineHeight: 1.1, fontWeight: 700 }}>Your AI agent,</div>
        <div style={{ fontSize: 72, lineHeight: 1.1, fontWeight: 700 }}>in your pocket.</div>
        <div
          style={{
            marginTop: 40,
            fontSize: 28,
            fontFamily: "system-ui, sans-serif",
            opacity: 0.75,
          }}
        >
          Drive a headless coding agent from your iPhone.
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 22,
            fontFamily: "system-ui, sans-serif",
            opacity: 0.55,
          }}
        >
          aiautomatehelp.com
        </div>
      </div>
    ),
    { ...size },
  );
}
