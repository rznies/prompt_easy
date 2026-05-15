import React from "react";

export const ChromeFrame: React.FC<{
  children: React.ReactNode;
  iconActive: boolean;
  onIconHover?: boolean;
}> = ({ children, iconActive, onIconHover }) => {
  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: "#1e1e1e",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* Chrome Toolbar */}
      <div
        style={{
          height: 48,
          backgroundColor: "#2b2b2b",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          borderBottom: "1px solid #333",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f56" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#27c93f" }} />
        </div>
        <div
          style={{
            flex: 1,
            height: 28,
            backgroundColor: "#1e1e1e",
            borderRadius: 6,
            marginLeft: 16,
            color: "#aaa",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            paddingLeft: 12,
            fontFamily: "sans-serif"
          }}
        >
          chatgpt.com
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Extension Icon */}
          <div
            id="prompt-easy-icon"
            style={{
              width: 28,
              height: 28,
              backgroundColor: iconActive ? "#7C3AED" : "#555",
              borderRadius: 6,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: onIconHover ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.1s ease, background-color 0.2s ease",
            }}
          >
            <span style={{ color: "white", fontWeight: "bold", fontSize: 14, fontFamily: "sans-serif" }}>P</span>
          </div>
        </div>
      </div>
      {/* Content Area */}
      <div style={{ flex: 1, position: "relative", backgroundColor: "#0A0A0B" }}>
        {/* Subtle noise pattern can be added here if needed */}
        {children}
      </div>
    </div>
  );
};
