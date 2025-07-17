import React, { useState } from "react";
import { auth, provider, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SignInForm({
  quizData,
  onAuthSuccess,
  onSwitchToQuiz,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const pink = "#ff7da9";

  const handleSignIn = async () => {
    setError("");
    if (!email || !password) {
      setError("Email and password required.");
      return;
    }
    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      onAuthSuccess(userCred.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (quizData) {
        await setDoc(doc(db, "users", user.uid), {
          ...quizData,
          email: user.email,
          createdAt: new Date(),
        });
      }
      onAuthSuccess(user);
    } catch {
      setError("Google sign-in failed");
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h2 style={headerStyle}>Welcome Back</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && <p style={errorStyle}>{error}</p>}

        <button onClick={handleSignIn} style={primaryButtonStyle(pink)}>
          Sign In
        </button>
        <button
          onClick={onSwitchToQuiz}
          style={linkStyle(pink)}
        >
          Take onboarding quiz
        </button>

        <div style={dividerStyle} />

        <button onClick={handleGoogle} style={secondaryButtonStyle(pink)}>
          Sign In with Google
        </button>
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────

const wrapperStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: "#f4f4f4",
};

const cardStyle = {
  width: "100%",
  maxWidth: 420,
  background: "#fff",
  padding: "40px 30px",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  textAlign: "center",
  fontFamily: "sans-serif",
};

const headerStyle = {
  fontSize: "24px",
  marginBottom: "24px",
  color: "#333",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "16px",
  marginBottom: "16px",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
};

const primaryButtonStyle = (color) => ({
  width: "100%",
  background: color,
  color: "#fff",
  border: "none",
  padding: "12px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  marginBottom: "12px",
});

const secondaryButtonStyle = (color) => ({
  width: "100%",
  background: "transparent",
  border: `2px solid ${color}`,
  color: color,
  padding: "12px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
});

const linkStyle = (color) => ({
  background: "none",
  border: "none",
  color: color,
  fontSize: "14px",
  cursor: "pointer",
  marginBottom: "20px",
});

const dividerStyle = {
  width: "100%",
  height: "1px",
  background: "#eee",
  margin: "20px 0",
};

const errorStyle = {
  color: "red",
  marginBottom: "16px",
};
