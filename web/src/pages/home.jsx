import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  // Clear timers
  function startQuiz(quizId) {

    Object.keys(localStorage)
      .filter((k) => k.startsWith("timer-"))
      .forEach((k) => localStorage.removeItem(k));

    nav(`/quiz/${quizId}`);
  }

  const baseBtn = {
    width: 250,
    padding: "12px 0",
    color: "white",
    fontSize: 16,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  };

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
        onClick={() => startQuiz(1)} 
        style={{ ...baseBtn, background: "#4CAF50" }}
      >
        Practice Quiz
      </button>

      <button
        onClick={() => startQuiz(1)}
        style={{ ...baseBtn, background: "#2196F3" }}
      >
        Quiz 1
      </button>

      <button
        onClick={() => startQuiz(2)}
        style={{ ...baseBtn, background: "#2196F3" }}
      >
        Quiz 2
      </button>

      <button
        onClick={() => startQuiz(3)}
        style={{ ...baseBtn, background: "#2196F3" }}
      >
        Quiz 3
      </button>

      <button
        onClick={() => startQuiz(4)}
        style={{ ...baseBtn, background: "#2196F3" }}
      >
        Quiz 4
      </button>
    </div>
  );
}
