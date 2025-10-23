import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  function goPractice() {
    nav("/quiz/1"); 
  }

  // add routes later
  function goQuiz1() { nav('/quiz/1'); }
  function goQuiz2() { nav('/quiz/2'); }
  function goQuiz3() { nav('/quiz/3'); }
  function goQuiz4() { nav('/quiz/4'); }
  // Add admin page navigation
  function goAdmin() { nav('/admin'); }

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <h1>Welcome to the Quiz Hub</h1>
      <p>Select a quiz to begin:</p>

      <button
        onClick={goPractice}
        style={{
          width: 250,
          padding: "12px 0",
          background: "#4CAF50",
          color: "white",
          fontSize: 16,
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Practice Quiz
      </button>

      <button
        onClick={goQuiz1}
        style={{
          width: 250,
          padding: "12px 0",
          background: "#2196F3",
          color: "white",
          fontSize: 16,
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Quiz 1
      </button>

      <button
        onClick={goQuiz2}
        style={{
          width: 250,
          padding: "12px 0",
          background: "#2196F3",
          color: "white",
          fontSize: 16,
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Quiz 2
      </button>

      <button
        onClick={goQuiz3}
        style={{
          width: 250,
          padding: "12px 0",
          background: "#2196F3",
          color: "white",
          fontSize: 16,
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Quiz 3
      </button>

      <button
        onClick={goQuiz4}
        style={{
          width: 250,
          padding: "12px 0",
          background: "#2196F3",
          color: "white",
          fontSize: 16,
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Quiz 4
      </button>
      {/* Add admin button */}
      <button
        onClick={goAdmin}
        style={{
          width: 250,
          padding: "12px 0",
          background: "#FF9800",
          color: "white",
          fontSize: 16,
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Admin Dashboard
      </button>
    </div>
  );
}
