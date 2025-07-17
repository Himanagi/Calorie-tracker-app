import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import OnboardingAuth from "./components/OnboardingAuth";
import WelcomeOnboarding from "./components/WelcomeOnboarding";
import Dashboard from "./components/pages/Dashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page: auth check + redirect */}
        <Route path="/" element={<OnboardingAuth />} />

        {/* Welcome page: quiz + register + sign-in */}
        <Route
  path="/welcome"
  element={
    <WelcomeOnboarding
      onAuthSuccess={(user) => {
        console.log("User authenticated:", user);
        // Redirect or lift to global state
        window.location.href = "/dashboard";
      }}
    />
  }
/>


        {/* Dashboard for logged-in users */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Catch-all redirects to landing auth check */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
