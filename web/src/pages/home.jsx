import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  function startTest() {
    nav("/"); 
  }

  return (
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <h1>Home</h1>
      <p>Welcome! Click below to begin.</p>
      <button onClick={startTest} style={{ padding: "12px 20px", cursor: "pointer" }}>
        Start Test
      </button>
    </div>
  );
}
