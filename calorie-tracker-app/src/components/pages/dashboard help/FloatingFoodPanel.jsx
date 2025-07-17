import React, { useState } from "react";
import FoodInput from "./FoodInput";

export default function FloatingFoodPanel({ onAddEntry }) {
  const [open, setOpen] = useState(false);

  const pink = "#fca5a5";
  const cream = "#fff8f2";

  return (
    <>
      {/* Floating Add Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
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
        >
          +
        </button>
      )}

      {/* Fullscreen Modal */}
      {open && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(3px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}>
          <div style={{
            background: cream,
            padding: 30,
            borderRadius: "20px",
            width: "90%",
            maxWidth: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            position: "relative",
          }}>
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "none",
                border: "none",
                fontSize: 24,
                fontWeight: "bold",
                color: pink,
                cursor: "pointer"
              }}
              title="Close"
            >
              ✕
            </button>

            <FoodInput onAddEntry={onAddEntry} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
