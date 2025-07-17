import React, { useState } from "react";
import OnboardingQuiz from "./OnboardingQuiz";
import SignInForm from "./SignInForm";
import RegisterForm from "./RegisterForm";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function WelcomeOnboarding({ onAuthSuccess }) {
  const [mode, setMode] = useState("quiz"); // "quiz" | "register" | "signin"
  const [quizData, setQuizData] = useState(null);

  const handleQuizComplete = (data) => {
    setQuizData(data);
    setMode("register");
  };

  const handleAuthSuccess = async (user) => {
    if (quizData) {
      await setDoc(doc(db, "users", user.uid), {
        ...quizData,
        email: user.email,
        createdAt: new Date(),
      });
    }
    onAuthSuccess(user);
  };

  return (
    <div>
      {mode === "quiz" && (
        <>
       <OnboardingQuiz
  onComplete={handleQuizComplete}
  onSwitchToSignIn={() => setMode("signin")} // ✅ passes the prop
/>

          <p style={{ textAlign: "center", marginTop: 20, color: "#555" }}>
            Already have an account?{" "}
            <button
              onClick={() => setMode("signin")}
              style={{
                background: "none",
                border: "none",
                color: "#ff7da9",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          </p>
        </>
      )}

      {mode === "register" && (
        <RegisterForm
          quizData={quizData}
          onAuthSuccess={handleAuthSuccess}
          onSwitchToSignIn={() => setMode("signin")}
        />
      )}

      {mode === "signin" && (
        <SignInForm
          quizData={quizData}
          onAuthSuccess={handleAuthSuccess}
          onSwitchToQuiz={() => setMode("quiz")}
        />
      )}
    </div>
  );
}
