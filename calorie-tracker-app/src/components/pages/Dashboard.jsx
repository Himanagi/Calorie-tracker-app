import React, { useState, useEffect } from "react";
import {
  doc, getDoc, collection, onSnapshot, addDoc, deleteDoc
} from "firebase/firestore";
import { db } from "../../firebase"; 
import WaterTracker from "./dashboard help/WaterTracker";
import EntriesTable from "./dashboard help/EntriesTable";
import CircleChart from "./dashboard help/CircleChart";
import FloatingFoodPanel from "./dashboard help/FloatingFoodPanel";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ProfilePanel from "../profile page/ProfilePanel";

// ----- New Color Palette -----
const softPink = "#FFE0F0";
const blushPink = "#FFC2D6";
const coral = "#FF7E9D";
const lightCoral = "#FFA6C1";
const softLavender = "#E6D0DE";
const paleGold = "#FFE5B4";
const textColor = "#5A3E51";
const glassCardBg = "rgba(255, 255, 255, 0.7)";
const glassCardBorder = "1px solid rgba(255, 194, 214, 0.5)";

// Background with subtle floral pattern
const floralBackground = `
  radial-gradient(circle at 10% 20%, rgba(255, 194, 214, 0.1) 0%, rgba(255, 194, 214, 0) 20%),
  radial-gradient(circle at 90% 80%, rgba(255, 194, 214, 0.1) 0%, rgba(255, 194, 214, 0) 20%),
  linear-gradient(135deg, #FFF5F9, #FFE9F3)
`;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showFoodPanel, setShowFoodPanel] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();

const [streak, setStreak] = useState(0);
const currentUser = auth.currentUser;




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
        protein,
        fats: fat,
        carbs: carb,
      },
    };
  }

  useEffect(() => {
    if (!currentUser) return;
  
    const entriesRef = collection(db, `users/${currentUser.uid}/entries`);
    const unsubscribe = onSnapshot(entriesRef, (snapshot) => {
      const userEntries = snapshot.docs.map((doc) => doc.data());
      setEntries(userEntries);
    });
  
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (entries.length === 0) {
      setStreak(0);
      return;
    }
  
    const dateSet = new Set(
      entries.map((entry) => {
        const entryDate = entry.date?.seconds
          ? new Date(entry.date.seconds * 1000)
          : new Date(entry.date); // fallback for Date objects
        return entryDate.toDateString();
      })
    );
  
    let streakCount = 0;
    let today = new Date();
  
    while (true) {
      const dateStr = today.toDateString();
      if (dateSet.has(dateStr)) {
        streakCount++;
        today.setDate(today.getDate() - 1);
      } else {
        break;
      }
    }
  
    setStreak(streakCount);
  }, [entries]);
  
  

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
      await addDoc(collection(db, "users", user.uid, "entries"), entry);
      setShowFoodPanel(false);
    } catch (err) {
      console.error("Failed to add entry:", err.message);
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
  function formatNum(value) {
    // value can be number or string, convert to float and format to 1 decimal
    return Number(value).toFixed(1);
  }
  if (loading)
    return (
      <div style={loadingStyle}>
        <div className="spinner">
          <div className="bounce1" style={{ backgroundColor: coral }}></div>
          <div className="bounce2" style={{ backgroundColor: coral }}></div>
          <div className="bounce3" style={{ backgroundColor: coral }}></div>
        </div>
        <p style={{ marginTop: 20 }}>Loading your profile...</p>
      </div>
    );

  const total = {
    calories: entries.reduce((acc, e) => {
      if (e.type === "workout") return acc - (e.caloriesBurned || 0);
      return acc + (e.nutrients?.calories || 0);
    }, 0),
    protein: entries.reduce((acc, e) => acc + (e.nutrients?.protein || 0), 0),
    carbs: entries.reduce((acc, e) => acc + (e.nutrients?.carbs || 0), 0),
    fats: entries.reduce((acc, e) => acc + (e.nutrients?.fat || 0), 0),
    fiber: entries.reduce((acc, e) => acc + (e.nutrients?.fiber || 0), 0),

  };

  const targets = {
    calories: profile.calories,
    protein: profile.macros.protein,
    carbs: profile.macros.carbs,
    fats: profile.macros.fats,
    fiber: profile.macros.fiber || 25, 
  };

  const remaining = {
    calories: Math.max(targets.calories - total.calories, 0),
    protein: Math.max(targets.protein - total.protein, 0),
    carbs: Math.max(targets.carbs - total.carbs, 0),
    fats: Math.max(targets.fats - total.fats, 0),
    fiber: Math.max(targets.fiber - total.fiber, 0),
  };

  return (
    <div style={dashboardStyle}>
      {/* Decorative Elements */}
      <div className="floating-bubble" style={{ top: "10%", left: "5%", animationDelay: "0s" }}></div>
      <div className="floating-bubble" style={{ top: "25%", right: "8%", animationDelay: "0.5s" }}></div>
      <div className="floating-bubble" style={{ bottom: "15%", left: "15%", animationDelay: "1s" }}></div>
      <div className="floating-bubble" style={{ bottom: "30%", right: "12%", animationDelay: "1.5s" }}></div>
      
      {/* Logo */}
      <img
        src="/kalpal-logo.png"
        alt="KalPal Logo"
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          width: 100,
          height: "auto",
          zIndex: 10,
          filter: "drop-shadow(0 0 6px rgba(255, 126, 157, 0.5))",
        }}
      />
      
      {/* Header Buttons */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10, display: "flex", gap: "12px" }}>
  <button
    onClick={() => setShowProfilePanel(true)}
    style={profileButtonStyle}
    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
  >
    <i className="fas fa-user" style={{ marginRight: 8 }}></i>
    Profile
  </button>
  <button
    onClick={handleLogout}
    style={logoutButtonStyle}
    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
  >
    <i className="fas fa-sign-out-alt" style={{ marginRight: 8 }}></i>
    Logout
  </button>
</div>

{/* Streak Display */}
<div
  style={{
    position: "absolute",
    top: 80,              // adjust to place below buttons nicely
    right: 20,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255, 194, 214, 0.2)",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "700",
    color: coral,
    boxShadow: "0 2px 6px rgba(255, 126, 157, 0.4)",
    userSelect: "none",
  }}
>
  <img
       src={streak > 0 ? "/bao-frames/streak.png" : "/bao-frames/0streak.png"}
    alt="Streak Icon"
    style={{ width: 100, height: 100 }}
  />
  <span> {streak} days streak</span>
</div>





      {/* Welcome Message */}
      <h1 style={welcomeStyle}>
        Good morning,{" "}
        <span style={userNameStyle}>
          {profile.firstName
            ? profile.firstName.charAt(0).toUpperCase() + profile.firstName.slice(1)
            : user.email.split("@")[0]}
        </span>!
      </h1>
      <p style={subtitleStyle}>Let's make today a healthy one!</p>

      {/* Stats Dashboard */}
      <div style={statsDashboard}>
        {/* Calorie Section */}
        <div 
          style={calorieCard}
          onMouseEnter={() => setHoveredCard("calories")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={cardHeader}>
            <i className="fas fa-fire" style={cardIcon}></i>
            <h3 style={sectionTitleStyle}>Calories</h3>
          </div>
          
          <div style={chartContainer}>
            <CircleChart 
              label="Calories" 
              value={remaining.calories} 
              max={targets.calories} 
              size={180}
              primaryColor={coral}
              secondaryColor={blushPink}
            />
          </div>
          
          <div style={statsSummary}>
            <div style={statItem}>
              <div style={statLabel}>Target</div>
              <div style={statValue}>{targets.calories} kcal</div>
            </div>
            <div style={statItem}>
              <div style={statLabel}>Consumed</div>
              <div style={statValue}>{Math.round(total.calories)} kcal</div>

            </div>
            <div style={statItem}>
              <div style={statLabel}>Remaining</div>
              <div style={{ ...statValue, color: coral }}>{remaining.calories} kcal</div>
            </div>
          </div>
        </div>
        
        {/* Macros Section */}
        <div 
          style={macroCard}
          onMouseEnter={() => setHoveredCard("macros")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={cardHeader}>
            <i className="fas fa-apple-alt" style={cardIcon}></i>
            <h3 style={sectionTitleStyle}>Macros</h3>
          </div>
          
          <div style={macroGrid}>
            <div style={macroItem}>
              <CircleChart 
                label="Protein" 
                value={remaining.protein} 
                max={targets.protein} 
                size={80}
                primaryColor={coral}
                secondaryColor={blushPink}
              />
              <div style={macroLabel}>Protein</div>
              <div style={macroValue}>{Number(remaining.protein).toFixed(1)}g left</div>

            </div>
            
            <div style={macroItem}>
              <CircleChart 
                label="Carbs" 
                value={remaining.carbs} 
                max={targets.carbs} 
                size={80}
                primaryColor={paleGold}
                secondaryColor={blushPink}
              />
              <div style={macroLabel}>Carbs</div>
              <div style={macroValue}>{Number(remaining.carbs).toFixed(1)}g left</div>
            </div>
            
            <div style={macroItem}>
              <CircleChart 
                label="Fats" 
                value={remaining.fats} 
                max={targets.fats} 
                size={80}
                primaryColor={softLavender}
                secondaryColor={blushPink}
              />
              <div style={macroLabel}>Fats</div>
              <div style={macroValue}>{Number(remaining.fats).toFixed(1)}g left</div>
            </div>

            <div style={macroItem}>
  <CircleChart 
    label="Fiber" 
    value={remaining.fiber} 
    max={targets.fiber} 
    size={80}
    primaryColor={"#9ACD32"} // e.g. yellowgreen for fiber
    secondaryColor={blushPink}
  />
  <div style={macroLabel}>Fiber</div>
  <div style={macroValue}>{Number(remaining.fiber).toFixed(1)}g left</div>
</div>
          </div>
          
          <div style={macroSummary}>
            <div style={macroSummaryItem}>
              <div style={macroSummaryLabel}>Protein:</div>
              <div style={macroSummaryValue}> {formatNum(total.protein)}g / {formatNum(targets.protein)}g</div>
            </div>
            <div style={macroSummaryItem}>
              <div style={macroSummaryLabel}>Carbs:</div>
              <div style={macroSummaryValue}> {formatNum(total.carbs)}g / {formatNum(targets.carbs)}g</div>
            </div>
            <div style={macroSummaryItem}>
              <div style={macroSummaryLabel}>Fats:</div>
              <div style={macroSummaryValue}>{formatNum(total.fats)}g / {formatNum(targets.fats)}g</div>
            </div>

            <div style={macroSummaryItem}>
  <div style={macroSummaryLabel}>Fiber:</div>
  <div style={macroSummaryValue}>
    {formatNum(total.fiber)}g / {formatNum(targets.fiber)}
  </div>
</div>
          </div>

        </div>
      </div>
      

      
      {/* Centered Water Tracker */}
      <div style={waterTrackerContainer}>
      <WaterTracker gender={profile.gender || "male"} currentUser={user} />

      </div>
      
      {/* Food Input + Entries */}
      <div style={entriesContainer}>
        <EntriesTable 
      entries={entries.filter(e => e.type !== "water")}
         onDelete={handleDeleteEntry} />
      </div>
      
      {/* Profile Side Panel */}
      {showProfilePanel && (
        <ProfilePanel user={user} onClose={() => setShowProfilePanel(false)} />
      )}
      
      {/* Floating action button */}
      <button 
        style={floatingButton}
        onClick={() => setShowFoodPanel(true)}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        <i className="fas fa-plus"></i>
      </button>
      
      {/* Food Panel Modal */}
      {showFoodPanel && (
        <div className="w-full max-w-3xl mt-10 mx-auto p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-pink-200">
  <FloatingFoodPanel onAddEntry={handleAddEntry} />
</div>
      )}
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-15px);}
          60% {transform: translateY(-7px);}
        }
        
        .floating-bubble {
          position: fixed;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, ${blushPink}, rgba(255, 194, 214, 0.3));
          filter: blur(10px);
          z-index: 0;
          animation: float 6s ease-in-out infinite;
        }
        
        .spinner {
          margin: 20px auto 0;
          width: 70px;
          text-align: center;
        }
        
        .spinner > div {
          width: 18px;
          height: 18px;
          background-color: ${coral};
          border-radius: 100%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        
        .spinner .bounce1 {
          animation-delay: -0.32s;
        }
        
        .spinner .bounce2 {
          animation-delay: -0.16s;
        }
      `}</style>
    </div>
  );
}

// Styles
const dashboardStyle = {
  minHeight: "100vh",
  background: floralBackground,
  padding: "30px 20px 80px",
  fontFamily: "'Poppins', sans-serif",
  color: textColor,
  position: "relative",
  overflowX: "hidden",
};

const loadingStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: floralBackground,
  fontFamily: "'Poppins', sans-serif",
  color: textColor,
  fontSize: "18px",
  fontWeight: "500",
};

const welcomeStyle = {
  fontSize: "36px",
  fontWeight: "600",
  marginBottom: "10px",
  color: textColor,
  textAlign: "center",
  position: "relative",
  zIndex: "10",
  marginTop: "40px",
};

const userNameStyle = {
  background: `linear-gradient(135deg, ${coral}, ${textColor})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: "700",
};

const subtitleStyle = {
  fontSize: "18px",
  color: textColor,
  textAlign: "center",
  marginBottom: "40px",
  fontWeight: "500",
  position: "relative",
  zIndex: "10",
};

const statsDashboard = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "30px",
  maxWidth: "1200px",
  margin: "0 auto 40px",
  position: "relative",
  zIndex: "10",
};

const calorieCard = {
  background: glassCardBg,
  backdropFilter: "blur(10px)",
  borderRadius: "25px",
  padding: "25px",
  border: glassCardBorder,
  boxShadow: "0 8px 32px rgba(255, 126, 157, 0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
};

const macroCard = {
  background: glassCardBg,
  backdropFilter: "blur(10px)",
  borderRadius: "25px",
  padding: "25px",
  border: glassCardBorder,
  boxShadow: "0 8px 32px rgba(255, 126, 157, 0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "25px",
};

const cardIcon = {
  fontSize: "24px",
  color: coral,
  background: "rgba(255, 126, 157, 0.1)",
  width: "45px",
  height: "45px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const sectionTitleStyle = {
  fontSize: "22px",
  fontWeight: "700",
  color: textColor,
  margin: "0",
};

const chartContainer = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "25px",
};

const statsSummary = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "15px",
  textAlign: "center",
};

const statItem = {
  padding: "15px",
  background: "rgba(255, 194, 214, 0.2)",
  borderRadius: "15px",
};

const statLabel = {
  fontSize: "14px",
  fontWeight: "500",
  color: textColor,
  opacity: "0.8",
  marginBottom: "5px",
};

const statValue = {
  fontSize: "18px",
  fontWeight: "700",
  color: textColor,
};

const macroGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)", // changed from 3 to 4 columns
  gap: "15px",
  marginBottom: "25px",
};

const macroItem = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
};

const macroLabel = {
  fontSize: "16px",
  fontWeight: "600",
  color: textColor,
};

const macroValue = {
  fontSize: "14px",
  fontWeight: "500",
  color: coral,
};

const macroSummary = {
  background: "rgba(255, 194, 214, 0.2)",
  borderRadius: "15px",
  padding: "20px",
};

const macroSummaryItem = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "12px",
};

const macroSummaryLabel = {
  fontSize: "16px",
  fontWeight: "500",
  color: textColor,
};

const macroSummaryValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: textColor,
};

const waterTrackerContainer = {
  maxWidth: "600px",
  margin: "0 auto 40px",
  position: "relative",
  zIndex: "10",
  display: "flex",
  justifyContent: "center",
};

const entriesContainer = {
  maxWidth: "800px",
  margin: "0 auto",
  position: "relative",
  zIndex: "10",
};

const floatingButton = {
  position: "fixed",
  bottom: "30px",
  right: "30px",
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  background: `linear-gradient(135deg, ${coral}, ${lightCoral})`,
  color: "white",
  border: "none",
  fontSize: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: `0 4px 20px rgba(255, 126, 157, 0.4)`,
  cursor: "pointer",
  zIndex: "100",
  transition: "all 0.3s ease",
};

const buttonRowStyle = {
  display: "flex",
  gap: "12px",            // spacing between buttons
  justifyContent: "center", // or "flex-end" / "space-between" depending on layout
  alignItems: "center",
  marginTop: "16px",
};
const profileButtonStyle = {
  background: `linear-gradient(135deg, ${coral}, ${lightCoral})`,
  color: "white",
  border: "none",
  padding: "12px 25px",
  borderRadius: "50px",
  fontWeight: "600",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: `0 4px 15px rgba(255, 126, 157, 0.3)`,
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
};

const logoutButtonStyle = {
  background: "white",
  border: `2px solid ${coral}`,
  color: coral,
  padding: "12px 25px",
  borderRadius: "50px",
  fontWeight: "600",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: `0 4px 15px rgba(255, 126, 157, 0.2)`,
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(5px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "white",
  borderRadius: "20px",
  padding: "30px",
  boxShadow: "0 10px 50px rgba(255, 126, 157, 0.4)",
  maxWidth: "500px",
  width: "90%",
  position: "relative",
};

const closeButtonStyle = {
  position: "absolute",
  top: "15px",
  right: "15px",
  background: "none",
  border: "none",
  fontSize: "24px",
  color: coral,
  cursor: "pointer",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
};