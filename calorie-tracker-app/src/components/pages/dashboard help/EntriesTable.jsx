import React from "react";

export default function EntriesTable({ entries, onDeleteEntry }) {
  if (!entries.length)
    return (
      <div style={emptyStateStyle}>
        No Entries Yet!
      </div>
    );

  return (
    <div style={containerStyle}>
      <style>
        {`
          @media (max-width: 640px) {
            table {
              font-size: 12px;
            }
            th, td {
              padding: 4px 6px;
            }
            th:nth-child(2) { width: 30px; }
            th:nth-child(3),
            th:nth-child(4),
            th:nth-child(5),
            th:nth-child(6),
            th:nth-child(7) { width: 45px; }
            th:nth-child(8) { display: none; } /* Hide time on mobile */
            td:nth-child(8) { display: none; }
            th:nth-child(9),
            td:nth-child(9) {
              width: 24px;
            }
          }
        `}
      </style>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thStyle}>Food</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>Cal</th>
            <th style={thStyle}>Prot</th>
            <th style={thStyle}>Carb</th>
            <th style={thStyle}>Fiber</th>
            <th style={thStyle}>Fat</th>
            <th style={thStyle}>Time</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isWorkout = entry.type === "workout";
            const timeString = entry.createdAtDate
              ? entry.createdAtDate.toLocaleString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  month: "short",
                  day: "numeric",
                })
              : "—";

            return (
              <tr
                key={entry.id}
                style={{
                  ...rowStyle,
                  background: isWorkout ? "#fdeaf2" : "#fff",
                }}
              >
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
                    style={deleteBtnStyle}
                    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
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

// ========== Styles ==========
const containerStyle = {
  marginTop: 20,
  borderRadius: "12px",
  overflowX: "auto",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  background: "#fff7f5",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: "'Inter', sans-serif",
};

const theadStyle = {
  background: "#fca5a5",
  color: "#fff",
  fontSize: "14px",
  textTransform: "uppercase",
};

const thStyle = {
  padding: "10px",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #f3dede",
  fontSize: "14px",
  color: "#333",
  whiteSpace: "nowrap",
};

const rowStyle = {
  transition: "background 0.2s ease",
};

const deleteBtnStyle = {
  background: "none",
  border: "none",
  color: "red",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "18px",
  transition: "transform 0.2s ease",
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "40px 20px",
  color: "#7c3f3f",
  fontFamily: "'Inter', sans-serif",
  fontSize: "18px",
  background: "#fff7f5",
  borderRadius: "16px",
  boxShadow: "0 6px 12px rgba(0,0,0,0.05)",
  marginTop: 20,
};
