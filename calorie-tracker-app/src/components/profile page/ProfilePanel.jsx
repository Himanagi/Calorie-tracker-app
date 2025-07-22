// 💖✨ UI/UX-enhanced ProfilePanel — logic unchanged
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import EntriesTable from "../pages/dashboard help/EntriesTable";

export default function ProfilePanel({ user, onClose }) {
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [entries, setEntries] = useState([]);
  const [weightLbs, setWeightLbs] = useState("");
  const [goal, setGoal] = useState("");
  const [desiredWeight, setDesiredWeight] = useState("");
  const [status, setStatus] = useState("");
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    async function fetchEntriesAndProfile() {
      if (!user?.uid) return;

      const entriesRef = collection(db, "users", user.uid, "entries");
      const snapshot = await getDocs(entriesRef);

      const filtered = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const createdAtDate =
            data.createdAt?.toDate?.() ||
            (data.createdAt?.seconds
              ? new Date(data.createdAt.seconds * 1000)
              : null);

          const localDateString = createdAtDate?.toLocaleDateString("en-CA");
          return {
            id: doc.id,
            ...data,
            createdAtDate,
            localDateString,
          };
        })
        .filter((entry) => entry.localDateString === selectedDate);

      setEntries(filtered);

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setWeightLbs(data.weightLbs || "");
        setGoal(data.goal || "");
        setDesiredWeight(data.desiredWeightLbs || "");
      }
    }

    fetchEntriesAndProfile();
  }, [user?.uid, selectedDate]);

  const handleSaveChanges = async () => {
    try {
      const ref = doc(db, "users", user.uid);

      const updatePayload = {
        weightLbs: Number(weightLbs),
        updatedAt: new Date(),
      };

      if (showGoalEditor) {
        updatePayload.goal = goal;
        updatePayload.desiredWeightLbs =
          goal === "lose_weight" || goal === "gain_weight"
            ? Number(desiredWeight)
            : null;
      }

      await updateDoc(ref, updatePayload);
      setStatus("Changes saved!");
    } catch (err) {
      setStatus("Error saving changes");
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!user?.uid) {
    return (
      <div style={panelStyle}>
        <button style={closeButtonStyle} onClick={onClose}>
          ✕
        </button>
        <p>User not loaded.</p>
      </div>
    );
  }

  return (
    <div style={{ ...panelStyle, overflowY: "auto" }}>
      <button style={closeButtonStyle} onClick={onClose}>
        ✕
      </button>

      <h2 style={headingStyle}>Your Progress</h2>
      <label style={labelStyle}>
        Select Date:
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={inputStyle}
        />
      </label>

      <EntriesTable entries={entries.filter(e => e.type !== "water")} onDeleteEntry={() => {}} />

      <hr style={dividerStyle} />

      <h3 style={headingStyle}>Update Your Profile</h3>

      <label style={labelStyle}>
        Current Weight (lbs):
        <input
          type="number"
          value={weightLbs}
          onChange={(e) => setWeightLbs(e.target.value)}
          style={inputStyle}
        />
      </label>

      <hr style={dividerStyle} />

      <button
        onClick={() => setShowGoalEditor((prev) => !prev)}
        style={toggleButtonStyle}
      >
        {showGoalEditor ? "Cancel Goal Update" : "🎯 Change Goal"}
      </button>

      {showGoalEditor && (
        <>
          <label style={labelStyle}>
            Your Goal:
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              style={inputStyle}
            >
              <option value="lose_weight">Lose Weight</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain_muscle">Gain Muscle</option>
              <option value="gain_weight">Gain Weight</option>
            </select>
          </label>

          {(goal === "lose_weight" || goal === "gain_weight") && (
            <label style={labelStyle}>
              Desired Weight (lbs):
              <input
                type="number"
                value={desiredWeight}
                onChange={(e) => setDesiredWeight(e.target.value)}
                style={inputStyle}
              />
            </label>
          )}
        </>
      )}

      <button onClick={handleSaveChanges} style={saveButtonStyle}>
        Save Changes
      </button>

      {showToast && (
        <div style={toastStyle}>
          {status}
        </div>
      )}
    </div>
  );
}

// 🎀 Cute, cozy UI styles
const panelStyle = {
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  width: "420px",
  background: "#fff0f6",
  boxShadow: "0 0 12px rgba(0,0,0,0.15)",
  padding: "24px",
  borderTopLeftRadius: "20px",
  borderBottomLeftRadius: "20px",
  fontFamily: "'Segoe UI', sans-serif",
  zIndex: 1000,
};

const headingStyle = {
  color: "#aa4a7c",
  marginBottom: "16px",
};

const closeButtonStyle = {
  float: "right",
  fontSize: "22px",
  border: "none",
  background: "transparent",
  color: "#aa4a7c",
  cursor: "pointer",
};

const labelStyle = {
  display: "block",
  marginBottom: 10,
  fontWeight: "600",
  color: "#6a3e3e",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "6px",
  borderRadius: "8px",
  border: "1px solid #d4a3a3",
  background: "#fff",
};

const toggleButtonStyle = {
  marginBottom: 12,
  padding: "8px 14px",
  background: "#f3c4d2",
  border: "none",
  borderRadius: "8px",
  color: "#6a3e3e",
  fontWeight: "bold",
  cursor: "pointer",
};

const saveButtonStyle = {
  marginTop: 16,
  padding: "10px 16px",
  background: "#d17878",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  width: "100%",
  boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
};

const toastStyle = {
  position: "fixed",
  bottom: 20,
  right: 20,
  background: "#ff8fa3",
  color: "white",
  padding: "12px 20px",
  borderRadius: "10px",
  boxShadow: "0 0 8px rgba(0,0,0,0.2)",
  zIndex: 9999,
};

const dividerStyle = {
  margin: "24px 0",
  border: "none",
  height: "1px",
  background: "#f4c2c2",
};
