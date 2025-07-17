import React, { useState } from "react";

export default function OnboardingQuiz({
  onComplete,
  onSwitchToSignIn,
}) {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [goal, setGoal] = useState("");
  const [activity, setActivity] = useState("");
  const [gender, setGender] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [goalWeightLbs, setGoalWeightLbs] = useState("");

  const pink = "#ff7da9";
  const totalSteps = 5;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = () => {
    onComplete({
      firstName,
      goal,
      activity,
      gender,
      heightFeet: Number(heightFeet),
      heightInches: Number(heightInches),
      weightLbs: Number(weightLbs),
      goalWeightLbs: Number(goalWeightLbs),
      createdAt: new Date(),
    });
  };

  const progressPercent = `${(step / totalSteps) * 100}%`;

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        {/* Progress Bar */}
        <div style={progressBarContainerStyle}>
          <div
            style={{
              ...progressBarFillStyle,
              width: progressPercent,
              background: pink,
            }}
          />
        </div>

        {step === 1 && (
          <>
            <h2 style={questionStyle}>👋 What's your first name?</h2>
            <input
              style={inputStyle}
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <div style={buttonRow}>
              <div /> {/* spacer */}
              <button
                style={nextButtonStyle(pink)}
                disabled={!firstName}
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={questionStyle}>🎯 What’s your goal?</h2>
            <div style={optionGrid}>
              {["lose_weight", "gain_weight", "gain_muscle", "maintain"].map(
                (g) => (
                  <button
                    key={g}
                    style={optionButtonStyle(pink, goal === g)}
                    onClick={() => {
                      setGoal(g);
                      nextStep();
                    }}
                  >
                    {g.replace("_", " ").toUpperCase()}
                  </button>
                )
              )}
            </div>
            <div style={buttonRow}>
              <button style={backButtonStyle(pink)} onClick={prevStep}>
                Back
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={questionStyle}>💪 Activity level?</h2>
            <div style={optionGrid}>
              {[
                "not_active",
                "slightly_active",
                "active",
                "very_active",
              ].map((lvl) => (
                <button
                  key={lvl}
                  style={optionButtonStyle(pink, activity === lvl)}
                  onClick={() => {
                    setActivity(lvl);
                    nextStep();
                  }}
                >
                  {lvl.replace("_", " ").toUpperCase()}
                </button>
              ))}
            </div>
            <div style={buttonRow}>
              <button style={backButtonStyle(pink)} onClick={prevStep}>
                Back
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 style={questionStyle}>🧍 About you</h2>
            <select
              style={inputStyle}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Choose Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <div style={twoFieldRow}>
              <select
                style={inputStyle}
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
              >
                <option value="">Feet</option>
                {[4, 5, 6, 7].map((ft) => (
                  <option key={ft} value={ft}>
                    {ft} ft
                  </option>
                ))}
              </select>
              <select
                style={inputStyle}
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
              >
                <option value="">Inches</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i}>
                    {i} in
                  </option>
                ))}
              </select>
            </div>

            <input
              type="number"
              placeholder="Current Weight (lbs)"
              style={inputStyle}
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
            />

            <div style={buttonRow}>
              <button style={backButtonStyle(pink)} onClick={prevStep}>
                Back
              </button>
              <button
                style={nextButtonStyle(pink)}
                disabled={
                  !gender ||
                  !heightFeet ||
                  !heightInches ||
                  !weightLbs
                }
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 style={questionStyle}>🎯 Goal Weight?</h2>
            <input
              type="number"
              placeholder="Your goal weight (lbs)"
              style={inputStyle}
              value={goalWeightLbs}
              onChange={(e) => setGoalWeightLbs(e.target.value)}
            />

            <div style={buttonRow}>
              <button style={backButtonStyle(pink)} onClick={prevStep}>
                Back
              </button>
              <button
                style={nextButtonStyle(pink)}
                disabled={!goalWeightLbs}
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </>
        )}

        {/* ←— Back to Sign In Link */}
        <div style={{ marginTop: 24 }}>
          <button
            onClick={onSwitchToSignIn}
            style={{
              background: "none",
              border: "none",
              color: pink,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

// 🌟 Styles

const wrapperStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: "#f4f4f4",
};

const cardStyle = {
  width: "100%",
  maxWidth: 500,
  background: "#fff",
  padding: "40px 30px",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  fontFamily: "sans-serif",
  textAlign: "center",
};

const progressBarContainerStyle = {
  height: "8px",
  background: "#eee",
  borderRadius: "4px",
  overflow: "hidden",
  marginBottom: "20px",
};

const progressBarFillStyle = {
  height: "100%",
  transition: "width 0.3s ease",
};

const questionStyle = {
  fontSize: "22px",
  color: "#333",
  marginBottom: 20,
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "16px",
  marginBottom: "20px",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
};

const buttonRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 10,
};

const twoFieldRow = {
  display: "flex",
  gap: 10,
  marginBottom: 20,
};

const optionGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginBottom: 20,
};

const nextButtonStyle = (color) => ({
  flex: 1,
  background: color,
  border: "none",
  color: "white",
  padding: "12px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
});

const backButtonStyle = (color) => ({
  flex: 1,
  background: "transparent",
  border: `2px solid ${color}`,
  color,
  padding: "12px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
});

const optionButtonStyle = (color, selected) => ({
  background: selected ? color : "#fff",
  border: `2px solid ${color}`,
  color: selected ? "#fff" : color,
  padding: "12px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
});
