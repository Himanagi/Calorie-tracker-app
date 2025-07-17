import React from "react";

export default function WelcomePage({ user }) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome, {user.email}!</h2>
      <p>This is your onboarding quiz page. Build your quiz here.</p>
    </div>
  );
}
