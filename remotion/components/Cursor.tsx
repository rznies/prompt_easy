import React from "react";

export const Cursor: React.FC<{ x: number; y: number; clicked?: boolean }> = ({ x, y, clicked }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 32,
        height: 32,
        zIndex: 9999,
        transform: clicked ? "scale(0.9)" : "scale(1)",
        transition: "transform 0.1s ease-out",
        pointerEvents: "none"
      }}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 6L21 21L15 22L11 28L6 6Z"
          fill="black"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
