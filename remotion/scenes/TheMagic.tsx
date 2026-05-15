import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ChromeFrame } from "../components/ChromeFrame";
import { Cursor } from "../components/Cursor";
import { ExtensionPopup } from "../components/ExtensionPopup";

export const TheMagic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timing
  // 8.0-9.5s (Shot 1): 0-45 frames. Establish.
  // 9.5-10.5s (Shot 2): 45-75 frames. Cursor moves to icon.
  // 10.5-11.5s (Shot 3): 75-105 frames. Glass popup spawns.
  // 11.5-12.5s (Shot 4): 105-135 frames. Messy prompt appears.
  // 12.5-13.2s (Shot 5): 135-156 frames. Cursor clicks Improve.
  // 13.2-16.5s (Shot 6): 156-255 frames. Morph & typewriter.
  // 16.5-17.2s (Shot 7): 255-276 frames. Copy button clicked.
  // 17.2-18.0s (Shot 8): 276-300 frames. Popup fades, hard cut to ChatGPT text area.

  const scale = 1.5; 
  const desktopW = 1920;
  const desktopH = 1080;
  
  // Panning coordinates
  const focusTextareaX = -desktopW * (scale - 1) / 2 + 100;
  const focusTextareaY = -desktopH * (scale - 1) / 2 - 200;
  
  const focusIconX = desktopW * (scale - 1) / 2 - 150;
  const focusIconY = desktopH * (scale - 1) / 2 + 150;
  
  const camPanProgress = spring({ frame: frame - 45, fps, config: { damping: 16 } });
  const camReturnProgress = spring({ frame: frame - 276, fps, config: { damping: 16 } });

  let translateX = interpolate(camPanProgress, [0, 1], [focusTextareaX, focusIconX]);
  let translateY = interpolate(camPanProgress, [0, 1], [focusTextareaY, focusIconY]);
  
  if (frame >= 276) {
    translateX = interpolate(camReturnProgress, [0, 1], [focusIconX, focusTextareaX]);
    translateY = interpolate(camReturnProgress, [0, 1], [focusIconY, focusTextareaY]);
  }

  // Cursor Animation
  const startX = 800;
  const startY = 800;
  const endX = 1850;
  const endY = 40;
  const copyBtnX = 1750;
  const copyBtnY = 320;
  
  const cursorMoveProgress = spring({ frame: frame - 45, fps, config: { damping: 14 } });
  const cursorClickImproveProgress = spring({ frame: frame - 115, fps, config: { damping: 14 } });
  const cursorMoveToCopyProgress = spring({ frame: frame - 240, fps, config: { damping: 14 } });

  let cursorX = interpolate(cursorMoveProgress, [0, 1], [startX, endX]);
  let cursorY = interpolate(cursorMoveProgress, [0, 1], [startY, endY]);

  if (frame >= 115 && frame < 240) {
    cursorX = interpolate(cursorClickImproveProgress, [0, 1], [endX, endX - 50]);
    cursorY = interpolate(cursorClickImproveProgress, [0, 1], [endY, endY + 200]);
  }
  
  if (frame >= 240) {
    cursorX = interpolate(cursorMoveToCopyProgress, [0, 1], [endX - 50, copyBtnX]);
    cursorY = interpolate(cursorMoveToCopyProgress, [0, 1], [endY + 200, copyBtnY]);
  }

  const cursorClicked = (frame > 135 && frame < 145) || (frame > 260 && frame < 270);
  const iconHover = frame >= 65 && frame < 80;
  const iconActive = frame >= 75;

  const messyText = "write me something about marketing idk make it good";
  const structuredText = `Role: Senior growth marketer\nTask: Write 3 LinkedIn hooks\nFormat: One sentence each\nConstraints: <15 words, no buzzwords`;

  const isShot8 = frame >= 276;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0B", justifyContent: "center", alignItems: "center" }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, filter: "url(#noise)", pointerEvents: "none" }} />
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
          width: desktopW,
          height: desktopH,
          position: "absolute",
          left: "50%",
          top: "50%",
          marginLeft: -desktopW / 2,
          marginTop: -desktopH / 2,
        }}
      >
        <ChromeFrame iconActive={iconActive} onIconHover={iconHover}>
          <div
            style={{
              position: "absolute",
              bottom: 100,
              left: "50%",
              transform: "translateX(-50%)",
              width: 800,
              backgroundColor: "#2f2f2f",
              borderRadius: 16,
              padding: 20,
              color: "white",
              fontFamily: "sans-serif",
              fontSize: 18,
              minHeight: 60,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {isShot8 ? (
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.4 }}>
                {structuredText.split('\n').map((line, i) => {
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
            ) : (
              <div style={{ color: "#ccc" }}>{messyText}</div>
            )}
            <div style={{ position: "absolute", right: 16, bottom: 16, width: 32, height: 32, backgroundColor: "#fff", borderRadius: 8, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ width: 12, height: 12, backgroundColor: "black", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
            </div>
          </div>

          {frame >= 75 && (
            <ExtensionPopup
              messyText={frame >= 105 ? messyText : ""}
              isImproving={frame >= 135}
              structuredText={structuredText}
              isCopied={frame >= 260}
              frameStartSpawn={75}
              frameStartMorph={156}
              frameStartCopy={255}
              frameStartClose={276}
            />
          )}

          {!isShot8 && <Cursor x={cursorX} y={cursorY} clicked={cursorClicked} />}
          
          {isShot8 && (
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
              <h1 style={{ fontSize: 120, color: "white", fontFamily: "sans-serif", fontWeight: "bold", textShadow: "0 10px 30px rgba(0,0,0,0.8)", opacity: interpolate(spring({ frame: frame - 276, fps, config: { damping: 14 } }), [0, 1], [0, 1]) }}>
                1 click.
              </h1>
            </AbsoluteFill>
          )}
        </ChromeFrame>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
