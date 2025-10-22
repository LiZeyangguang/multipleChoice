import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  function goPractice() {
    nav("/"); 
  }

  // add routes later
  function goQuiz1() { alert("Quiz 1 coming soon!"); }
  function goQuiz2() { alert("Quiz 2 coming soon!"); }
  function goQuiz3() { alert("Quiz 3 coming soon!"); }
  function goQuiz4() { alert("Quiz 4 coming soon!"); }

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
    </div>
  );
}
