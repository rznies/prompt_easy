import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animations
  const textOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textTranslateY = interpolate(frame, [10, 30], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  
  const buttonScale = spring({
    frame: frame - 35,
    fps,
    config: { damping: 14, mass: 1.2, stiffness: 100 },
  });

  const badgeOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeTranslateY = interpolate(frame, [50, 70], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ 
      backgroundColor: "#000000", 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center" 
    }}>
      {/* Background Glow */}
      <div style={{
        position: "absolute",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "1200px",
        height: "1200px",
        background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(0,0,0,0) 60%)",
      }} />

      {/* Main Text */}
      <div style={{
        opacity: textOpacity,
        transform: `translateY(${textTranslateY}px)`,
        textAlign: "center",
        zIndex: 10,
        marginBottom: "80px"
      }}>
        <h1 style={{
          color: "white",
          fontSize: "80px",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 800,
          margin: "0 0 20px 0",
          letterSpacing: "-0.02em"
        }}>
          Prompt Easy
        </h1>
        <p style={{
          color: "#a1a1aa",
          fontSize: "40px",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          fontWeight: 500
        }}>
          Free. Unlimited with your Gemini key.
        </p>
      </div>

      {/* Try It Now Button */}
      <div style={{
        transform: `scale(${Math.max(0, buttonScale)})`,
        backgroundColor: "white",
        color: "black",
        padding: "30px 60px",
        borderRadius: "40px",
        fontSize: "40px",
        fontFamily: "system-ui, sans-serif",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        zIndex: 10,
        boxShadow: "0 20px 40px rgba(255,255,255,0.1)",
        marginBottom: "100px"
      }}>
        Try it now <span style={{ marginLeft: "15px" }}>→</span>
      </div>

      {/* Badges / Footer */}
      <div style={{
        opacity: badgeOpacity,
        transform: `translateY(${badgeTranslateY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 10
      }}>
        <div style={{
          color: "white",
          fontSize: "32px",
          fontFamily: "system-ui, sans-serif",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span style={{ color: "#0A66C2" }}>in</span> linkedin.com/in/yourprofile
        </div>
        <div style={{
          border: "2px solid #333",
          padding: "15px 30px",
          borderRadius: "20px",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          fontSize: "24px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "15px",
          backgroundColor: "rgba(0,0,0,0.5)"
        }}>
          <span style={{ fontSize: "32px" }}>🧩</span> Available on Chrome Web Store
        </div>
      </div>
    </AbsoluteFill>
  );
};
