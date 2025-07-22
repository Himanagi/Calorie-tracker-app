import React, { useState, useEffect, useRef } from "react";
import { addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";

import { db } from "../../../firebase"; // fix path if needed


const WATER_GOALS = { male: 104, female: 74 };
const TOTAL_CUPS = 8;

function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
}

// Calculate milliseconds until next midnight
function msUntilNextMidnight() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0); // next midnight
  return tomorrow.getTime() - now.getTime();
}

export default function WaterTracker({ gender = "male", currentUser }) {

  const [ozDrank, setOzDrank] = useState(0);
  const [inputOpen, setInputOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const goal = WATER_GOALS[gender];
  const ozPerCup = goal / TOTAL_CUPS;

  // Ref to store the timer id so we can clear if needed
  const resetTimerId = useRef(null);

  

  // Load from localStorage on mount, reset if date is old
  async function fetchTodayWater() {
    if (!currentUser?.uid) return;
  
    const todayStr = new Date().toLocaleDateString("en-CA");
    const entriesRef = collection(db, `users/${currentUser.uid}/entries`);
    const q = query(entriesRef, where("type", "==", "water"));
  
    try {
      const snapshot = await getDocs(q);
      const totalToday = snapshot.docs
        .map(doc => doc.data())
        .filter(entry => {
          const createdAt = entry.createdAt?.toDate?.() ||
            (entry.createdAt?.seconds ? new Date(entry.createdAt.seconds * 1000) : null);
          return createdAt?.toLocaleDateString("en-CA") === todayStr;
        })
        .reduce((sum, entry) => sum + (entry.amount || 0), 0);
  
      setOzDrank(totalToday);
    } catch (err) {
      console.error("Failed to fetch water entries:", err.message);
    }
  }
  useEffect(() => {
    fetchTodayWater();
  }, [currentUser]);
  

  // Save ozDrank and today's date whenever ozDrank changes
  useEffect(() => {
    const today = getTodayString();
    localStorage.setItem("waterDate", today);
    localStorage.setItem("waterOz", ozDrank.toString());
  }, [ozDrank]);

  const filledCups = Math.floor(ozDrank / ozPerCup);
  const partialFillPercent = ((ozDrank % ozPerCup) / ozPerCup) * 100;

  const pink = "#fca5a5";
  const brown = "#7c3f3f";
  const cream = "#fff8f2";

  function addOz(amount) {
    const newAmount = Math.min(ozDrank + amount, goal);
    saveWaterEntry(amount); // triggers Firestore write
    setTimeout(fetchTodayWater, 500); // wait briefly then refresh from backend
  }
  
  async function saveWaterEntry(amount) {
    if (!currentUser?.uid) return;
    try {
      await addDoc(collection(db, `users/${currentUser.uid}/entries`), {
        type: "water",
        amount: amount,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to save water entry:", err.message);
    }
  }
  

  function handleSubmit(e) {
    e.preventDefault();
    const val = parseFloat(inputValue);
    if (!isNaN(val) && val > 0) {
      addOz(val);
      setInputValue("");
      setInputOpen(false);
    } else {
      alert("Please enter a valid positive number");
    }
  }

  return (
    <div style={{ maxWidth: 360, padding: 20, borderRadius: 20, background: cream, boxShadow: "0 6px 20px rgba(124, 63, 63, 0.2)", fontFamily: "'Inter', sans-serif", color: brown }}>
      <h3 style={{ marginBottom: 16, fontWeight: "700", textAlign: "center" }}>Water Intake</h3>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
        {[...Array(TOTAL_CUPS)].map((_, i) => {
          const isFilled = i < filledCups;
          const isPartial = i === filledCups && partialFillPercent > 0;
          return (
            <div
              key={i}
              style={{
                width: 30,
                height: 60,
                border: `2px solid ${brown}`,
                borderRadius: 8,
                background: isFilled ? pink : isPartial ? `linear-gradient(to top, ${pink} ${partialFillPercent}%, transparent 0%)` : "transparent",
                transition: "background 0.3s ease",
                cursor: "default"
              }}
              title={`${Math.min(ozPerCup, ozDrank - i * ozPerCup).toFixed(1)} oz`}
            />
          );
        })}
      </div>
      <div style={{ textAlign: "center", fontWeight: "600", marginBottom: 16 }}>
        {ozDrank} oz / {goal} oz
      </div>
      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => setInputOpen(true)}
          style={{
            background: pink,
            border: "none",
            borderRadius: 12,
            padding: "10px 18px",
            fontWeight: "700",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(252, 165, 165, 0.6)",
            transition: "background 0.2s ease"
          }}
          onMouseOver={e => (e.currentTarget.style.background = "#f87f7f")}
          onMouseOut={e => (e.currentTarget.style.background = pink)}
        >
          Add Water
        </button>
      </div>
      {inputOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              background: cream,
              padding: 24,
              borderRadius: 16,
              boxShadow: "0 8px 30px rgba(124, 63, 63, 0.4)",
              width: 280,
              textAlign: "center"
            }}
          >
            <label htmlFor="ozInput" style={{ display: "block", marginBottom: 12, fontWeight: "700", color: brown }}>
              How many ounces did you drink?
            </label>
            <input
              id="ozInput"
              type="number"
              step="1"
              min="0"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              style={{
                display: "block",
                margin: "0 auto 20px",
                width: "60%",
                padding: "8px 12px",
                fontSize: 16,
                borderRadius: 8,
                border: `1.5px solid ${brown}`,
                fontFamily: "'Inter', sans-serif",
                outline: "none"
              }}
              autoFocus
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={() => setInputOpen(false)}
                style={{
                  background: "#ddd",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontWeight: "600",
                  color: brown,
                  flex: "1 1 auto",
                  marginRight: 8
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: pink,
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontWeight: "700",
                  color: "white",
                  flex: "1 1 auto"
                }}
                onMouseOver={e => (e.currentTarget.style.background = "#f87f7f")}
                onMouseOut={e => (e.currentTarget.style.background = pink)}
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
