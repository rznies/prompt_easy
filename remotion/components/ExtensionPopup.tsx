import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const ExtensionPopup: React.FC<{
  messyText: string;
  isImproving: boolean;
  structuredText: string;
  isCopied: boolean;
  frameStartSpawn: number;
  frameStartMorph: number;
  frameStartCopy: number;
  frameStartClose?: number;
}> = ({
  messyText,
  isImproving,
  structuredText,
  isCopied,
  frameStartSpawn,
  frameStartMorph,
  frameStartCopy,
  frameStartClose = 9999,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const spawnProgress = spring({
    frame: frame - frameStartSpawn,
    fps,
    config: { damping: 14 },
  });

  const closeProgress = spring({
    frame: frame - frameStartClose,
    fps,
    config: { damping: 14 },
  });

  const morphProgress = spring({
    frame: frame - frameStartMorph,
    fps,
    config: { damping: 14 },
  });

  const fadeMessyProgress = spring({
    frame: frame - 105,
    fps,
    config: { damping: 14 },
  });

  const copySpawnProgress = spring({
    frame: frame - frameStartCopy,
    fps,
    config: { damping: 14 },
  });
  
  const improveClickProgress = spring({
    frame: frame - 135,
    fps,
    config: { damping: 14 },
  });

  // Pulsing dots for "Improving..."
  const dotCount = Math.max(0, Math.floor((frame - 135) / 10)) % 4;
  const dots = ".".repeat(dotCount);

  // Typewriter effect for structured text
  const charsPerFrame = 1.33; 
  const typeWriterChars = Math.max(0, Math.floor((frame - frameStartMorph - 15) * charsPerFrame));
  const displayedStructuredText = structuredText.substring(0, typeWriterChars);

  const scaleValue = interpolate(spawnProgress, [0, 1], [0.8, 1]) * interpolate(closeProgress, [0, 1], [1, 0.8]);
  const opacityValue = interpolate(spawnProgress, [0, 1], [0, 1]) * interpolate(closeProgress, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        right: 20,
        width: 400,
        backgroundColor: "rgba(30, 30, 30, 0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.1)",
        padding: 20,
        color: "white",
        fontFamily: "sans-serif",
        boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
        transform: `scale(${scaleValue})`,
        opacity: opacityValue,
        transformOrigin: "top right",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 16, height: 16, backgroundColor: "#7C3AED", borderRadius: 4 }} />
          Prompt Easy
        </div>
      </div>

      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.3)",
          borderRadius: 8,
          padding: 16,
          minHeight: 140,
          border: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Messy Text (fades in initially, then slides up & out) */}
        <div
          style={{
            position: "absolute",
            opacity: interpolate(fadeMessyProgress, [0, 1], [0, 1]) * interpolate(morphProgress, [0, 1], [1, 0]),
            transform: `translateY(${interpolate(morphProgress, [0, 1], [0, -20])}px)`,
            fontSize: 18,
            color: "#ccc",
            lineHeight: 1.4,
          }}
        >
          {messyText}
        </div>

        {/* Structured Text (types in) */}
        <div
          style={{
            opacity: morphProgress > 0.5 ? 1 : 0,
            fontSize: 18,
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
          }}
        >
          {displayedStructuredText.split('\n').map((line, i) => {
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
              const label = line.substring(0, colonIndex + 1);
              const value = line.substring(colonIndex + 1);
              return (
                <div key={i}>
                  <span style={{ opacity: 0.5 }}>{label}</span>
                  <span style={{ opacity: 1 }}>{value}</span>
                </div>
              );
            }
            return <div key={i}>{line}</div>;
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 12 }}>
        {frame >= frameStartCopy ? (
          <div style={{ position: "relative" }}>
            {/* Tooltip */}
            <div
              style={{
                position: "absolute",
                top: -40,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#222",
                color: "white",
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: 12,
                opacity: isCopied ? spring({ frame: frame - 260, fps, config: { damping: 14 } }) : 0,
                whiteSpace: "nowrap",
                pointerEvents: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              Copied!
              <div style={{
                position: "absolute",
                bottom: -4,
                left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: 8,
                height: 8,
                backgroundColor: "#222",
              }} />
            </div>
            <div
              style={{
                backgroundColor: isCopied ? "#7C3AED" : "#333",
                padding: "10px 20px",
                borderRadius: 8,
                fontWeight: "bold",
                transform: `scale(${interpolate(copySpawnProgress, [0, 1], [0.8, 1])})`,
                opacity: interpolate(copySpawnProgress, [0, 1], [0, 1]),
                transition: "background-color 0.2s",
              }}
            >
              Copy
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: isImproving ? "#555" : "#7C3AED",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: "bold",
              transition: "background-color 0.2s",
              transform: `scale(${isImproving ? interpolate(improveClickProgress, [0, 1], [1.02, 0.98]) : 1})`,
            }}
          >
            <span style={{ display: "inline-block", width: isImproving ? 100 : "auto" }}>
              {isImproving ? `Improving${dots}` : "Improve"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
