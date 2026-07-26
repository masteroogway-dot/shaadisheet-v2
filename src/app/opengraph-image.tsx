import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #722F37 0%, #8B3A42 50%, #A0454E 100%)",
          fontFamily: "Inter, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            top: "-100px",
            right: "-100px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            bottom: "-80px",
            left: "-80px",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "60px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: "72px",
              marginBottom: "24px",
            }}
          >
            🪷
          </div>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "800",
              color: "white",
              margin: "0 0 16px 0",
              letterSpacing: "-2px",
            }}
          >
            ShaadiSheet
          </h1>
          <p
            style={{
              fontSize: "28px",
              color: "rgba(255,255,255,0.85)",
              margin: "0 0 40px 0",
              maxWidth: "700px",
              lineHeight: "1.3",
            }}
          >
            Plan Your Indian Wedding Without the Chaos
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              fontSize: "18px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <span>Budget Tracking</span>
            <span>•</span>
            <span>Vendor Management</span>
            <span>•</span>
            <span>AI Assistant</span>
          </div>
          <p
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.5)",
              marginTop: "32px",
            }}
          >
            www.shaadisheet.com
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
