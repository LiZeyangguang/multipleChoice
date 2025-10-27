import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { AuthContext } from "../contexts/AuthProvider";

export default function Home() {
  const nav = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await api.getPublicQuizzes();
        if (mounted) setQuizzes(list || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function startQuiz(quizId) {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("timer-"))
      .forEach((k) => localStorage.removeItem(k));
    nav(`/quiz/${quizId}`);
  }

  async function handleLogout() {
    try {
      await api.logout();
      setUser(null);
      nav("/login");
    } catch (err) {
      alert("Logout failed: " + err.message);
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

  const practice = quizzes[0];                  // first quiz becomes “Practice”
  const rest = quizzes.slice(0, 5);             // show up to 5 total, rename as Quiz 1..4

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

      {/* Practice (first quiz) */}
      <button
        onClick={() => practice && startQuiz(practice.quiz_id)}
        style={{ ...baseBtn, background: "#4CAF50" }}
        disabled={!practice}
      >
        {practice ? "Practice Quiz" : loading ? "Loading…" : "No quizzes yet"}
      </button>

      {/* The rest as Quiz 1..4 using real IDs */}
      {rest.map((q, i) => (
        <button
          key={q.quiz_id}
          onClick={() => startQuiz(q.quiz_id)}
          style={{ ...baseBtn, background: "#2196F3" }}
        >
          {`Quiz ${i + 1}`}
        </button>
      ))}

      <button
        onClick={() => nav("/admin")}
        style={{ ...baseBtn, background: "#ff9800", marginTop: 20 }}
      >
        Admin Dashboard
      </button>

      <button
        onClick={handleLogout}
        style={{ ...baseBtn, background: "#f44336", marginTop: 40 }}
      >
        Logout
      </button>
    </div>
  );
}
