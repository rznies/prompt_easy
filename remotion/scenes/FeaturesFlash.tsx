import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

const FeatureCard: React.FC<{
  title: string;
  subtitle?: string;
  icon: string;
  delay: number;
  frame: number;
  fps: number;
  offsetY: number;
}> = ({ title, subtitle, icon, delay, frame, fps, offsetY }) => {
  const enterProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, mass: 1.2, stiffness: 80 },
  });

  const translateY = interpolate(enterProgress, [0, 1], [200, offsetY]);
  const opacity = interpolate(enterProgress, [0, 0.5, 1], [0, 1, 1]);
  const scale = interpolate(enterProgress, [0, 1], [0.9, 1]);

  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`,
      opacity,
      width: "800px",
      backgroundColor: "rgba(20, 20, 20, 0.7)",
      backdropFilter: "blur(40px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "32px",
      padding: "40px",
      display: "flex",
      alignItems: "center",
      boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
    }}>
      <div style={{
        fontSize: "64px",
        marginRight: "30px",
        background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
        WebkitBackgroundClip: "text",
        color: "transparent",
        filter: "drop-shadow(0px 4px 10px rgba(124, 58, 237, 0.4))"
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: "white", fontSize: "48px", fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ color: "#a1a1aa", fontSize: "32px", marginTop: "10px", fontFamily: "system-ui, sans-serif" }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export const FeaturesFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Subtle radial gradient background */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "1500px",
        height: "1500px",
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(0,0,0,0) 70%)",
      }} />

      <FeatureCard
        frame={frame}
        fps={fps}
        delay={20}
        offsetY={-250}
        icon="✨"
        title="Improve mode"
        subtitle="One click to perfect prompts"
      />
      <FeatureCard
        frame={frame}
        fps={fps}
        delay={44}
        offsetY={0}
        icon="🤖"
        title="Works on ChatGPT, Claude, Gemini"
        subtitle="Works everywhere"
      />
      <FeatureCard
        frame={frame}
        fps={fps}
        delay={68}
        offsetY={250}
        icon="🔑"
        title="BYOK — unlimited, private"
        subtitle="Use your own Gemini key"
      />
    </AbsoluteFill>
  );
};
