import React, { useState, useEffect } from "react";
import {
  doc, getDoc, collection, onSnapshot, addDoc, deleteDoc
} from "firebase/firestore";
import { db } from "../../firebase"; 


import EntriesTable from "./dashboard help/EntriesTable";
import CircleChart from "./dashboard help/CircleChart";
import FloatingFoodPanel from "./dashboard help/FloatingFoodPanel";

import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ProfilePanel from "../profile page/ProfilePanel";

function calculateProfileMetrics(profile) {
  const heightCm = (profile.heightFeet || 0) * 30.48 + (profile.heightInches || 0) * 2.54;
  const weightLbs = profile.desiredWeightLbs || profile.weightLbs;
  const weightKg = weightLbs * 0.453592;
  const age = 30;

  const bmr = profile.gender === "male"
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const multipliers = {
    not_active: 1.2, slightly_active: 1.375, active: 1.55, very_active: 1.725
  };
  const activityFactor = multipliers[profile.activity] || 1.2;
  let calories = bmr * activityFactor;

  if (profile.goal === "lose_weight") calories -= 500;
  if (profile.goal === "gain_weight" || profile.goal === "gain_muscle") calories += 500;
  calories = Math.round(calories);

  let protein = 1.6 * weightKg;
  if (profile.goal === "gain_muscle") protein = 2.2 * weightKg;
  if (profile.goal === "lose_weight") protein = 2.0 * weightKg;

  const proteinCal = protein * 4;
  const fatCal = calories * 0.25;
  const fat = fatCal / 9;
  const carb = (calories - (proteinCal + fatCal)) / 4;

  return {
    calories,
    macros: {
      protein: Math.round(protein),
      fats: Math.round(fat),
      carbs: Math.round(carb),
    },
  };
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();

  const pink = "#fca5a5";
  const brown = "#7c3f3f";
  const cream = "#fff8f2";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/welcome");
        return;
      }
      setUser(firebaseUser);
      const ref = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        navigate("/welcome");
        return;
      }
      const raw = snap.data();
      const calculated = calculateProfileMetrics(raw);
      setProfile({ ...raw, ...calculated });
      setLoading(false);
    });
    return () => unsub();
  }, [auth, navigate]);

  useEffect(() => {
    if (!user?.uid) return;
    const entriesRef = collection(db, "users", user.uid, "entries");
    const unsubscribe = onSnapshot(entriesRef, (snapshot) => {
      const today = new Date().toLocaleDateString("en-CA");
      const todayEntries = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          const createdAtDate = data.createdAt?.toDate?.() ||
            (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null);
          const localDateString = createdAtDate?.toLocaleDateString("en-CA");
          return { id: docSnap.id, ...data, createdAtDate, localDateString };
        })
        .filter((e) => e.localDateString === today);
      setEntries(todayEntries);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const handleAddEntry = async (entry) => {
    try {
      await addDoc(collection(db, "users", user.uid, "entries"), entry); // entry already includes createdAt
    } catch (err) {
      console.error("🔥 Failed to add entry:", err.message);
      alert("Could not add entry. Check your inputs.");
    }
  };
  

  const handleDeleteEntry = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "entries", id));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/welcome");
    setUser(null);
  };

  if (loading) return <p style={{ padding: 40, fontSize: 18 }}>Loading profile...</p>;

  const total = {
    calories: entries.reduce((acc, e) => {
      if (e.type === "workout") return acc - (e.caloriesBurned || 0); // subtracting negative = adding
      return acc + (e.nutrients?.calories || 0);
    }, 0),
    protein: entries.reduce((acc, e) => acc + (e.nutrients?.protein || 0), 0),
    carbs: entries.reduce((acc, e) => acc + (e.nutrients?.carbs || 0), 0),
    fats: entries.reduce((acc, e) => acc + (e.nutrients?.fat || 0), 0),
  };
  

  const targets = {
    calories: profile.calories,
    protein: profile.macros.protein,
    carbs: profile.macros.carbs,
    fats: profile.macros.fats,
  };

  const remaining = {
    calories: Math.max(targets.calories - total.calories, 0),
    protein: Math.max(targets.protein - total.protein, 0),
    carbs: Math.max(targets.carbs - total.carbs, 0),
    fats: Math.max(targets.fats - total.fats, 0),
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: cream,
      minHeight: "100vh",
      padding: "40px 20px",
      fontFamily: "'Inter', sans-serif" ,
      position: "relative"
    }}>
      {/* 👤 Profile & Logout Buttons */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <button
          onClick={() => setShowProfilePanel(true)}
          style={{
            background: pink,
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            marginRight: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease",
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
           Profile
        </button>
        <button
          onClick={handleLogout}
          style={{
            background: "#fff",
            border: `2px solid ${pink}`,
            color: pink,
            padding: "10px 16px",
            borderRadius: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
           Logout
        </button>
      </div>

      <h1 style={{ fontSize: "30px", marginBottom: 24, color: brown }}>
  Hey, {profile.firstName
    ? profile.firstName.charAt(0).toUpperCase() + profile.firstName.slice(1)
    : user.email}!
</h1>


      {/* 🔥 Calorie & Macro Overview */}
      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
          <div>
            <h3 style={sectionTitleStyle}> Calories</h3>
            <div style={chartHoverBox}>
              <CircleChart label="Calories" value={remaining.calories} max={targets.calories} size={200} />
            </div>
            <p style={{ marginTop: 10 }}>
              <strong>{remaining.calories}</strong> kcal left<br />
              (<strong>{total.calories}</strong> eaten / {targets.calories})
            </p>
          </div>

          <div>
            <h3 style={sectionTitleStyle}> Macros</h3>

            <div style={{ ...chartHoverBox, marginBottom: 12 }}>
              <CircleChart label="Protein" value={remaining.protein} max={targets.protein} size={80} />
              <p style={macroTextStyle}>
                <strong>{remaining.protein}</strong>g left<br />
                ({total.protein} / {targets.protein})
              </p>
            </div>

            <div style={{ ...chartHoverBox, marginBottom: 12 }}>
              <CircleChart label="Carbs" value={remaining.carbs} max={targets.carbs} size={80} />
              <p style={macroTextStyle}>
                <strong>{remaining.carbs}</strong>g left<br />
                ({total.carbs} / {targets.carbs})
              </p>
            </div>

            <div style={chartHoverBox}>
              <CircleChart label="Fats" value={remaining.fats} max={targets.fats} size={80} />
              <p style={macroTextStyle}>
                <strong>{remaining.fats}</strong>g left<br />
                ({total.fats} / {targets.fats})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Food Input + Entries */}
      <div style={{ marginTop: 40, width: "100%", maxWidth: 700 }}>
      <FloatingFoodPanel onAddEntry={handleAddEntry} />


        <EntriesTable entries={entries} onDelete={handleDeleteEntry} />
      </div>

      {/*  Profile Side Panel */}
      {showProfilePanel && (
        <ProfilePanel
          user={user}
          onClose={() => setShowProfilePanel(false)}
        />
      )}
    </div>
  );
}

// 🎀 Styles
const cardStyle = {
  width: "100%",
  maxWidth: 800,
  background: "#fff7f5",
  padding: 30,
  borderRadius: 20,
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  transition: "all 0.3s ease-in-out",
};

const sectionTitleStyle = {
  fontSize: 22,
  fontWeight: 700,
  marginBottom: 12,
  color: "#7c3f3f",
};

const chartHoverBox = {
  padding: "6px",
  borderRadius: "12px",
  transition: "box-shadow 0.3s ease",
  boxShadow: "0 0 0 rgba(0,0,0,0)",
  cursor: "pointer",
  background: "#fff",
};

const macroTextStyle = {
  marginTop: 8,
  fontSize: 14,
  lineHeight: "1.5",
  color: "#444",
};
