import { ImageResponse } from "next/og";

// Home-screen icon: the same mark as app/icon.svg (two poles on a globe).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b3a5b" }}>
        <div style={{ position: "relative", width: 110, height: 110, display: "flex", borderRadius: 55, border: "8px solid rgba(255,255,255,0.35)" }}>
          <div style={{ position: "absolute", left: 38, top: -22, width: 26, height: 26, borderRadius: 13, background: "#7fd3f7" }} />
          <div style={{ position: "absolute", left: 38, bottom: -22, width: 26, height: 26, borderRadius: 13, background: "#7fd3f7" }} />
          <div style={{ position: "absolute", left: 41, top: 41, width: 20, height: 20, borderRadius: 10, background: "#ffffff" }} />
        </div>
      </div>
    ),
    size
  );
}
