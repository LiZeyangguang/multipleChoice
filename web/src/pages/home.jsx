import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { AuthContext } from "../contexts/AuthProvider";

export default function Home() {
  const nav = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);

  // Fetch quizzes from API
  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await api.getQuizzes();
        setQuizzes(res || []);
      } catch (err) {
        console.error("Failed to load quizzes:", err);
        alert("Failed to load quizzes. Please try again later.");
      }
    }
    fetchQuizzes();
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

  // Sort quizzes so "practice" ones come first
  const sortedQuizzes = [...quizzes].sort((a, b) => {
    const aIsPractice = a.title?.toLowerCase().includes("practice");
    const bIsPractice = b.title?.toLowerCase().includes("practice");
    if (aIsPractice && !bIsPractice) return -1;
    if (!aIsPractice && bIsPractice) return 1;
    return 0;
  });

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
      <h1>
        Welcome to the Quiz Hub
        {user?.email && (
          <span style={{ fontSize: "18px", display: "block", marginTop: 8 }}>
            Logged in as: <strong>{user.email}</strong>
          </span>
        )}
      </h1>

      <p>Select a quiz to begin:</p>

      {sortedQuizzes.length > 0 ? (
        sortedQuizzes.map((quiz) => {
          const isPractice = quiz.title?.toLowerCase().includes("practice");
          return (
            <button
              key={quiz.id}
              onClick={() => startQuiz(quiz.id)}
              style={{
                ...baseBtn,
                background: isPractice ? "#4CAF50" : "#2196F3",
              }}
            >
              {quiz.title || `Quiz ${quiz.id}`}
            </button>
          );
        })
      ) : (
        <p>Loading quizzes...</p>
      )}

      {user?.is_admin && (
        <button
          onClick={() => nav("/admin")}
          style={{ ...baseBtn, background: "#ff9800", marginTop: 20 }}
        >
          Admin Dashboard
        </button>
      )}

      <button
        onClick={handleLogout}
        style={{ ...baseBtn, background: "#f44336", marginTop: 40 }}
      >
        Logout
      </button>
    </div>
  );
}
