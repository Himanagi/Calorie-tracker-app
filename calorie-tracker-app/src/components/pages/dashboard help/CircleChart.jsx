import React from "react";

export default function CircleChart({ label, value, max, size = 100 }) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const pink = "#fca5a5";
  const lightPink = "#fff0f0";

  return (
    <div
      style={{
        padding: 6,
        borderRadius: "50%",
        background: "radial-gradient(circle at center, #fff7f5 0%, #fce4ec 100%)",
        boxShadow: `inset 0 0 8px ${pink}55`,
        transition: "box-shadow 0.3s ease",
      }}
    >
      <svg width={size} height={size} style={{ display: "block", margin: "auto" }}>
        {/* Background ring */}
        <circle
          stroke={lightPink}
          fill="none"
          strokeWidth="10"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Progress ring */}
        <circle
          stroke={pink}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transition: "stroke-dashoffset 0.6s ease",
            filter: "drop-shadow(0 0 6px rgba(252, 165, 165, 0.4))",
          }}
        />

        {/* Center Value */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={size / 5}
          fill="#7c3f3f"
          fontFamily="'Inter', sans-serif"
          style={{ fontWeight: 700 }}
        >
          {Math.max(0, Math.round(value))}
        </text>

        {/* Label */}
        <text
          x="50%"
          y={size / 1.3}
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={size / 8}
          fill="#7c3f3f"
          fontFamily="'Inter', sans-serif"
          style={{ fontWeight: 500 }}
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
