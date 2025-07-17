import React, { useState } from "react";
import { auth, provider, db } from "../firebase";  // <-- add provider here
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";


export default function AuthForm({ onAuthSuccess, quizData }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleEmailSubmit = async () => {
    setAuthError("");
    if (!email || !password) {
      setAuthError("Email and password required.");
      return;
    }

    try {
      let userCred;

      if (isRegistering) {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
        // Save quiz data + email in Firestore after registration
        const userRef = doc(db, "users", userCred.user.uid);
        await setDoc(userRef, {
          ...quizData,
          email,
          createdAt: new Date(),
        });
      } else {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      }

      onAuthSuccess(userCred.user);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      onAuthSuccess(result.user);
    } catch (err) {
      setAuthError("Google sign-in failed");
    }
  };

  return (
    <div>
      <h1>{isRegistering ? "Register" : "Sign In"}</h1>
      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {authError && <p style={{ color: "red" }}>{authError}</p>}
      <button onClick={handleEmailSubmit}>{isRegistering ? "Register" : "Sign In"}</button>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register"}
      </button>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
}
