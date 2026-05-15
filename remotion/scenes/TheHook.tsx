import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const TheHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const text1 = "Your prompts suck.";
  const text2 = "Let's fix that.";

  // Text 1 typing (0-20)
  const text1Progress = Math.floor(
    interpolate(frame, [0, 20], [0, text1.length], { extrapolateRight: "clamp" })
  );
  
  // Text 1 deleting (35-45)
  const deleteProgress = Math.floor(
    interpolate(frame, [35, 45], [0, text1.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );

  // Text 2 typing (50-65)
  const text2Progress = Math.floor(
    interpolate(frame, [50, 65], [0, text2.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );

  let currentText = "";
  if (frame < 35) {
    currentText = text1.slice(0, text1Progress);
  } else if (frame < 50) {
    currentText = text1.slice(0, text1.length - deleteProgress);
  } else if (frame < 70) {
    currentText = text2.slice(0, text2Progress);
  }

  // Text container opacity
  const textOpacity = interpolate(frame, [65, 70], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Logo entrance
  const logoScale = spring({
    frame: frame - 65,
    fps,
    config: { damping: 14, mass: 0.8 },
  });
  const logoOpacity = interpolate(frame, [65, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", justifyContent: "center", alignItems: "center" }}>
      {/* Procedural noise overlay for 1% film grain */}
      <AbsoluteFill style={{ opacity: 0.03, pointerEvents: "none" }}>
        <svg width="100%" height="100%">
          <filter id="noiseHook">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseHook)" />
        </svg>
      </AbsoluteFill>

      {frame < 70 && (
        <div style={{
          color: "white",
          fontSize: "80px",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
          opacity: textOpacity,
          display: "flex",
          alignItems: "center"
        }}>
          {currentText}
          <div style={{
            width: "8px",
            height: "90px",
            backgroundColor: "white",
            marginLeft: "8px",
            opacity: frame % 15 < 7 ? 1 : 0
          }} />
        </div>
      )}

      {frame >= 65 && (
        <div style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
            marginBottom: "32px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 20px 40px rgba(124, 58, 237, 0.3)"
          }}>
            <span style={{ fontSize: "60px" }}>✨</span>
          </div>
          <h1 style={{
            color: "white",
            fontSize: "72px",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.02em"
          }}>
            Prompt Easy
          </h1>
        </div>
      )}
    </AbsoluteFill>
  );
};
