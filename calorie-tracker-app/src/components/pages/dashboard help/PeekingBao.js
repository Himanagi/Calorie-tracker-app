import React, { useState, useEffect } from "react";

const frames = [
  "/bao-frames/peaking1.png",
  "/bao-frames/peaking2.png",
  "/bao-frames/peaking3.png",
];

export default function PeekingBao() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 400); // adjust as needed for smooth loop
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: "-16px",       // peek slightly above the box
        left: "-12px",      // peeking from left edge
        zIndex: 1,          // behind other elements
        pointerEvents: "none", // allow user to interact with box normally
      }}
    >
      <img
        src={frames[frameIndex]}
        alt="Peeking Bao"
        width={60}
        height={60}
        style={{
          userSelect: "none",
          display: "block",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}
