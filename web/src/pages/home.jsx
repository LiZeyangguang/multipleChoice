import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";              // import your api helper
import { AuthContext } from "../contexts/AuthProvider";  // import auth context

export default function Home() {
  const nav = useNavigate();
  const { setUser } = useContext(AuthContext);   // get setUser from context

  // Clear timers and start quiz
  function startQuiz(quizId) {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("timer-"))
      .forEach((k) => localStorage.removeItem(k));

    nav(`/quiz/${quizId}`);
  }

  async function handleLogout() {
    try {
      await api.logout();      // call logout API
      setUser(null);           // clear user in context
      nav('/login');           // redirect to login page
    } catch (err) {
      alert('Logout failed: ' + err.message);
    }
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

      {/* Quiz buttons */}
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

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{ ...baseBtn, background: "#f44336", marginTop: 40 }}
      >
        Logout
      </button>
    </div>
  );
}
