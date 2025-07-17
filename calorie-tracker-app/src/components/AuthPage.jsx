import React, { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

export default function AuthPage() {
  const [mode, setMode] = useState("signin"); // or "signup"

  return (
    <div style={{ padding: 20 }}>
      <h2>{mode === "signin" ? "Sign In" : "Sign Up"}</h2>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setMode("signin")}>Sign In</button>
        <button onClick={() => setMode("signup")}>Sign Up</button>
      </div>
      {mode === "signin" ? <SignInForm /> : <SignUpForm />}
    </div>
  );
}
