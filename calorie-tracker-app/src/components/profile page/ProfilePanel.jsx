// 💖✨ Mobile-optimized ProfilePanel with fixed desktop layout
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
  const [isMobile, setIsMobile] = useState(false);
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

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <div style={panelStyle(isMobile)}>
        <button style={closeButtonStyle(isMobile)} onClick={onClose}>
          ✕
        </button>
        <p>User not loaded.</p>
      </div>
    );
  }

  return (
    <div style={panelStyle(isMobile)}>
      <div style={headerStyle(isMobile)}>
        <h2 style={headingStyle(isMobile)}>Your Progress</h2>
        <button style={closeButtonStyle(isMobile)} onClick={onClose}>
          ✕
        </button>
      </div>

      <div style={contentStyle(isMobile)}>
        <div style={inputGroupStyle}>
          <label style={labelStyle(isMobile)}>
            Select Date:
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={inputStyle(isMobile)}
            />
          </label>
        </div>

        <div style={{...scrollableContainerStyle, maxHeight: isMobile ? '150px' : '220px'}}>
          <EntriesTable entries={entries.filter(e => e.type !== "water")} compact={isMobile} />
        </div>

        <h3 style={subHeadingStyle(isMobile)}>Update Profile</h3>

        <div style={inputGroupStyle}>
          <label style={labelStyle(isMobile)}>
            Current Weight (lbs):
            <input
              type="number"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              style={inputStyle(isMobile)}
            />
          </label>
        </div>

        <button
          onClick={() => setShowGoalEditor((prev) => !prev)}
          style={toggleButtonStyle(isMobile)}
        >
          {showGoalEditor ? "Cancel Goal Update" : "🎯 Change Goal"}
        </button>

        {showGoalEditor && (
          <>
            <div style={inputGroupStyle}>
              <label style={labelStyle(isMobile)}>
                Your Goal:
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  style={inputStyle(isMobile)}
                >
                  <option value="lose_weight">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain_muscle">Gain Muscle</option>
                  <option value="gain_weight">Gain Weight</option>
                </select>
              </label>
            </div>

            {(goal === "lose_weight" || goal === "gain_weight") && (
              <div style={inputGroupStyle}>
                <label style={labelStyle(isMobile)}>
                  Desired Weight (lbs):
                  <input
                    type="number"
                    value={desiredWeight}
                    onChange={(e) => setDesiredWeight(e.target.value)}
                    style={inputStyle(isMobile)}
                  />
                </label>
              </div>
            )}
          </>
        )}

        {/* Save button positioned differently for mobile vs desktop */}
        <div style={saveButtonContainerStyle(isMobile)}>
          <button onClick={handleSaveChanges} style={saveButtonStyle(isMobile)}>
            Save Changes
          </button>
        </div>
      </div>

      {showToast && (
        <div style={toastStyle(isMobile)}>
          {status}
        </div>
      )}
    </div>
  );
}

// 🎀 Responsive styles with fixed desktop save button
const panelStyle = (isMobile) => ({
  position: "fixed",
  top: isMobile ? "auto" : 0,
  bottom: 0,
  left: 0,
  right: 0,
  height: isMobile ? "60vh" : "100vh",
  background: "#fff0f6",
  boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
  padding: isMobile ? "12px 16px" : "24px",
  borderTopLeftRadius: "24px",
  borderTopRightRadius: "24px",
  fontFamily: "'Segoe UI', sans-serif",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  ...(isMobile ? {} : {
    top: 0,
    right: 0,
    left: "auto",
    width: "420px",
    borderBottomLeftRadius: "20px",
  }),
});

const headerStyle = (isMobile) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: "12px",
  borderBottom: "1px solid #f4c2c2",
});

const contentStyle = (isMobile) => ({
  flex: 1,
  overflowY: "auto",
  paddingTop: "10px",
  paddingBottom: isMobile ? "0" : "20px",
});

const headingStyle = (isMobile) => ({
  color: "#aa4a7c",
  fontSize: isMobile ? "1.2rem" : "1.5rem",
  margin: 0,
});

const subHeadingStyle = (isMobile) => ({
  color: "#aa4a7c",
  fontSize: isMobile ? "1.1rem" : "1.3rem",
  margin: "12px 0 8px",
});

const closeButtonStyle = (isMobile) => ({
  background: "transparent",
  border: "none",
  fontSize: isMobile ? "1.4rem" : "1.5rem",
  color: "#aa4a7c",
  cursor: "pointer",
  width: "36px",
  height: "36px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const inputGroupStyle = {
  marginBottom: "10px",
};

const labelStyle = (isMobile) => ({
  display: "block",
  marginBottom: "6px",
  fontWeight: "600",
  color: "#6a3e3e",
  fontSize: isMobile ? "0.85rem" : "1rem",
});

const inputStyle = (isMobile) => ({
  width: "100%",
  padding: isMobile ? "8px 10px" : "12px",
  borderRadius: "10px",
  border: "1px solid #d4a3a3",
  background: "#fff",
  fontSize: isMobile ? "0.9rem" : "1rem",
  boxSizing: "border-box",
});

const toggleButtonStyle = (isMobile) => ({
  margin: "10px 0",
  padding: isMobile ? "10px" : "12px",
  background: "#f3c4d2",
  border: "none",
  borderRadius: "10px",
  color: "#6a3e3e",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: isMobile ? "0.9rem" : "1rem",
  width: "100%",
});

// FIXED: Save button container for proper positioning
const saveButtonContainerStyle = (isMobile) => ({
  position: isMobile ? "fixed" : "relative",
  bottom: isMobile ? "10px" : "auto",
  left: isMobile ? "16px" : "auto",
  right: isMobile ? "16px" : "auto",
  marginTop: "20px",
  width: isMobile ? "calc(100% - 32px)" : "100%",
});

const saveButtonStyle = (isMobile) => ({
  padding: isMobile ? "12px" : "14px",
  background: "#d17878",
  color: "#fff",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: isMobile ? "1rem" : "1.1rem",
  boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
  width: "100%",
});

const toastStyle = (isMobile) => ({
  position: "fixed",
  bottom: isMobile ? "80px" : "20px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "#ff8fa3",
  color: "white",
  padding: "10px 20px",
  borderRadius: "50px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  zIndex: 9999,
  whiteSpace: "nowrap",
  fontSize: isMobile ? "0.9rem" : "1rem",
});

const scrollableContainerStyle = {
  overflowY: "auto",
  border: "1px solid #f4c2c2",
  borderRadius: "12px",
  padding: "6px",
  margin: "8px 0",
};