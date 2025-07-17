import React from "react";

export default function EntriesTable({ entries, onDeleteEntry }) {
  if (!entries.length) return (
    <div style={{
      textAlign: "center",
      padding: "40px 20px",
      color: "#7c3f3f",
      fontFamily: "'Inter', sans-serif",
      fontSize: "18px",
      background: "#fff7f5",
      borderRadius: "16px",
      boxShadow: "0 6px 12px rgba(0,0,0,0.05)",
      marginTop: 20
    }}>
       No Entries Yet!<br />

    </div>
  );
  

  return (
    <div style={{
      marginTop: 20,
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
      background: "#fff7f5",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', sans-serif" }}>
        <thead style={{
          background: "#fca5a5",
          color: "#fff",
          fontSize: "14px",
          textTransform: "uppercase",
        }}>
          <tr>
            {["Food", "Qty", "Cal", "Protein", "Carbs", "Fiber", "Fat", "Time", ""].map(col => (
              <th key={col} style={thStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
        {entries.map(entry => {
  const isWorkout = entry.type === "workout";
  const timeString = entry.createdAtDate
    ? entry.createdAtDate.toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric"
      })
    : "—";

  return (
    <tr key={entry.id} style={{
      ...rowStyle,
      background: entry.type === "workout" ? "#fdeaf2" : "#fff",
    }}>
    
      <td style={tdStyle}>{isWorkout ? entry.workoutName : entry.foodName}</td>
      <td style={tdStyle}>{isWorkout ? "—" : entry.quantity}</td>
      <td style={tdStyle}>{Math.round(isWorkout ? entry.caloriesBurned : entry.nutrients?.calories || 0)}</td>
      <td style={tdStyle}>{isWorkout ? "—" : Math.round(entry.nutrients?.protein || 0)}</td>
      <td style={tdStyle}>{isWorkout ? "—" : Math.round(entry.nutrients?.carbs || 0)}</td>
      <td style={tdStyle}>{isWorkout ? "—" : Math.round(entry.nutrients?.fiber || 0)}</td>
      <td style={tdStyle}>{isWorkout ? "—" : Math.round(entry.nutrients?.fat || 0)}</td>
      <td style={tdStyle}>{timeString}</td>
      <td style={tdStyle}>
        <button
          onClick={() => onDeleteEntry(entry.id)}
          style={{
            background: "none",
            border: "none",
            color: "red",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "18px",
            transition: "transform 0.2s ease",
          }}
          onMouseOver={e => e.currentTarget.style.transform = "scale(1.2)"}
          onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
          title="Delete entry"
        >
          ×
        </button>
      </td>
    </tr>
  );
})}

        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "10px",
  textAlign: "left",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #f3dede",
  fontSize: "14px",
  color: "#333",
};

const rowStyle = {
  transition: "background 0.2s ease",
};
