import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function OnboardingAuth() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth user:", user);

      if (user) {
        // Check if user profile exists in Firestore
        const userRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(userRef);

        if (profileSnap.exists()) {
          console.log("Navigate to dashboard");
          navigate("/dashboard");
        } else {
          console.log("User is authenticated but no profile found. Redirecting to welcome");
          navigate("/welcome");
        }
      } else {
        console.log("No user. Redirecting to welcome");
        navigate("/welcome");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div style={{ padding: 20 }}>
      {loading ? <p>Loading profile...</p> : <p>Redirecting...</p>}
    </div>
  );
}
