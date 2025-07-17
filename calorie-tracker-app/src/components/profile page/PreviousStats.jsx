// src/components/PreviousStats.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function PreviousStats({ user }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [stats, setStats] = useState(null);

  const fetchStats = async (date) => {
    const q = query(
      collection(db, "users", user.uid, "entries"),
      where("date", "==", date)
    );
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map((doc) => doc.data());

    const totals = entries.reduce(
      (acc, entry) => {
        acc.calories += entry.nutrients?.calories || 0;
        acc.protein += entry.nutrients?.protein || 0;
        acc.carbs += entry.nutrients?.carbs || 0;
        acc.fats += entry.nutrients?.fat || 0;
        acc.fiber += entry.nutrients?.fiber || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );

    setStats(totals);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    fetchStats(e.target.value);
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h2>View Past Day’s Stats</h2>
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        max={new Date().toISOString().split("T")[0]}
      />
      {stats && (
        <div style={{ marginTop: 10 }}>
          <p>Calories: {stats.calories}</p>
          <p>Protein: {stats.protein}g</p>
          <p>Carbs: {stats.carbs}g</p>
          <p>Fats: {stats.fats}g</p>
          <p>Fiber: {stats.fiber}g</p>
        </div>
      )}
    </div>
  );
}
