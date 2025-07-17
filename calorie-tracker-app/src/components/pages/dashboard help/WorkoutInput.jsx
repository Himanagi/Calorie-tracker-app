import React, { useState } from "react";
import { Timestamp } from "firebase/firestore";

export default function WorkoutInput({ onAddEntry, onClose }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [error, setError] = useState("");

  const pink = "#fca5a5";

  const handleAdd = async () => {
    if (!name.trim() || !calories || Number(calories) <= 0) {
      setError("Please enter valid workout details.");
      return;
    }

    const now = new Date();
    const entry = {
      type: "workout",
      workoutName: name.trim(),
      caloriesBurned: Number(calories),
      createdAt: Timestamp.fromDate(now),
    };

    try {
      await onAddEntry(entry);
      setName("");
      setCalories("");
      setError("");
      if (onClose) onClose();
    } catch (err) {
      setError("Failed to add workout.");
    }
  };

    return (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff8f2",
              padding: 20,
              borderRadius: 16,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              width: "100%",
              maxWidth: 400,
              fontFamily: "'Inter', sans-serif",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <label style={{ fontWeight: "600", color: pink, width: "100%" }}>
              Workout Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Running"
                style={{
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 8,
                  border: `1.5px solid ${pink}`,
                  fontSize: 16,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </label>
      
            <label style={{ fontWeight: "600", color: pink, width: "100%" }}>
              Calories Burned
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="e.g. 250"
                style={{
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 8,
                  border: `1.5px solid ${pink}`,
                  fontSize: 16,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </label>
      
            {error && (
              <div
                style={{
                  color: "red",
                  fontWeight: "600",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}
      
            <button
              onClick={handleAdd}
              style={{
                marginTop: 10,
                padding: "14px 0",
                width: "100%",
                maxWidth: 300,
                borderRadius: 12,
                fontSize: 18,
                fontWeight: "bold",
                backgroundColor: pink,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(252, 165, 165, 0.6)",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f87171")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = pink)}
            >
              Add Workout
            </button>
          </div>
        </div>
      );
      
}
