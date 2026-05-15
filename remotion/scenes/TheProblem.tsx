import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const TheProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Typing the messy prompt (faster)
  const messyPrompt = "write me something about marketing idk make it good";
  const typeProgress = Math.floor(
    interpolate(frame, [10, 50], [0, messyPrompt.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  const currentPrompt = messyPrompt.slice(0, typeProgress);

  // Output fade in
  const outputOpacity = interpolate(frame, [70, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Overlay text fade in (delayed)
  const overlayOpacity = interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const overlayScale = spring({
    frame: frame - 110,
    fps,
    config: { damping: 14 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0B", flexDirection: "column" }}>
      {/* Procedural noise overlay */}
      <AbsoluteFill style={{ opacity: 0.03, pointerEvents: "none", zIndex: 10 }}>
        <svg width="100%" height="100%">
          <filter id="noiseProblem">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseProblem)" />
        </svg>
      </AbsoluteFill>

      {/* Top Half: Input */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "60px", borderBottom: "2px solid #1f1f1f" }}>
        <div style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#212121",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
          <div style={{ fontSize: "24px", color: "#888", marginBottom: "20px", fontWeight: 600 }}>Message ChatGPT...</div>
          <div style={{ fontSize: "40px", color: "#ececec", fontFamily: "system-ui, sans-serif", lineHeight: 1.4 }}>
            {currentPrompt}
            <span style={{ opacity: frame % 15 < 7 ? 1 : 0 }}>|</span>
          </div>
        </div>
      </div>

      {/* Bottom Half: Bad Output */}
      <div style={{ flex: 1, padding: "80px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#10a37f", marginRight: "20px" }} />
          <div style={{ fontSize: "28px", color: "white", fontWeight: 600 }}>ChatGPT</div>
        </div>
        
        {frame >= 70 ? (
          <div style={{ fontSize: "32px", color: "#ccc", fontFamily: "system-ui, sans-serif", lineHeight: 1.6, opacity: outputOpacity }}>
            <div style={{ marginBottom: "20px" }}>Sure, here is something about marketing:</div>
            <div>Marketing is the process of getting people interested in your company's product or service. This happens through market research, analysis, and understanding your ideal customer's interests. Marketing pertains to all aspects of a business, including product development, distribution methods, sales, and advertising...</div>
          </div>
        ) : frame > 50 ? (
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#555", animation: "pulse 1s infinite" }} />
            <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#555", animation: "pulse 1s infinite 0.2s" }} />
            <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#555", animation: "pulse 1s infinite 0.4s" }} />
          </div>
        ) : null}
      </div>

      {/* Dimming Overlay */}
      <AbsoluteFill style={{ 
        backgroundColor: "rgba(0,0,0,0.6)", 
        opacity: overlayOpacity, 
        justifyContent: "center", 
        alignItems: "center",
        zIndex: 20
      }}>
        <div style={{
          transform: `scale(${Math.max(0.8, overlayScale)})`,
          backgroundColor: "rgba(20,20,20,0.8)",
          backdropFilter: "blur(24px)",
          padding: "40px 60px",
          borderRadius: "32px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.8)"
        }}>
          <h2 style={{
            margin: 0,
            color: "white",
            fontSize: "64px",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            textAlign: "center",
            textShadow: "0 4px 20px rgba(0,0,0,0.5)"
          }}>
            Vague prompts <br />
            <span style={{ color: "#ef4444" }}>= vague answers</span>
          </h2>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
