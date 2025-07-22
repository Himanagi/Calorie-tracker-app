import React, { useState, useEffect } from "react";

const frames = [
  "/bao-frames/jumping1.png",
  "/bao-frames/jumping2.png",
  "/bao-frames/jumping3.png",
];

export default function WalkingBao() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 300); // change frame every 300ms, tweak as you want
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "24px",
        zIndex: 9999,
        animation: "jump 1.2s infinite",
        display: "flex",
        alignItems: "center",
      }}
    >
      <img
        src={frames[frameIndex]}
        alt="Jumping Bao"
        width={100}
        height={100}
        style={{ userSelect: "none" }}
      />
      <style>{`
        @keyframes jump {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
