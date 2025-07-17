import React, { useState } from "react";
import FoodInput from "./FoodInput";
import WorkoutInput from "./WorkoutInput";

export default function FloatingFoodPanel({ onAddEntry }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // "food", "workout", or null

  const pink = "#fca5a5";
  const cream = "#fff8f2";

  const openModal = () => {
    setMode(null);     // Always reset to selector screen
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setMode(null);
  };

  return (
    <>
      {/* Floating + Button */}
      <button
        onClick={openModal}
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          background: pink,
          color: "#fff",
          borderRadius: "50%",
          width: 60,
          height: 60,
          fontSize: 30,
          border: "none",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          cursor: "pointer",
          zIndex: 1000,
        }}
        title="Add entry"
      >
        +
      </button>

      {/* Modal Backdrop */}
      {open && (
        <div style={backdropStyle}>
          <div style={modalStyle}>
            {/* Close button */}
            <button onClick={closeModal} style={closeBtnStyle}>✕</button>

            {/* Mode Selection */}
            {mode === null && (
              <div style={innerBoxStyle}>
                <h2 style={{ color: "#7c3f3f", marginBottom: 16 }}>Add new entry</h2>
                <button onClick={() => setMode("food")} style={choiceButton}>🍽 Food</button>
                <button onClick={() => setMode("workout")} style={choiceButton}>🏋️ Workout</button>
              </div>
            )}

            {/* Food Entry */}
            {mode === "food" && (
              <div style={innerBoxStyle}>
                <FoodInput onAddEntry={onAddEntry} onClose={closeModal} />
              </div>
            )}

            {/* Workout Entry */}
            {mode === "workout" && (
              <div style={innerBoxStyle}>
                <WorkoutInput onAddEntry={onAddEntry} onClose={closeModal} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// 🎨 Modal Styles
const backdropStyle = {
  position: "fixed",
  inset: 0,
  display: "flex",               // ✅ Use flex instead of grid
  justifyContent: "center",     // ✅ Center horizontally
  alignItems: "center",         // ✅ Center vertically
  background: "rgba(0, 0, 0, 0.3)",
  backdropFilter: "blur(3px)",
  zIndex: 9999,
};


const modalStyle = {
  background: "#fff8f2",
  padding: "32px",
  borderRadius: "20px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  width: "100%",
  maxWidth: "500px",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const innerBoxStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",     // ✅ centers children horizontally
  justifyContent: "center", // ✅ optional if you want vertical centering inside box
  width: "100%",
  maxWidth: "400px",         // ✅ keeps content from stretching too wide
  margin: "0 auto",          // ✅ centers the box inside modal
};


const closeBtnStyle = {
  position: "absolute",
  top: 12,
  right: 12,
  background: "none",
  border: "none",
  fontSize: 22,
  fontWeight: "bold",
  color: "#fca5a5",
  cursor: "pointer",
};

const choiceButton = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "12px",
  background: "#fff",
  border: "2px solid #fca5a5",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
};

