import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import QuestionCard from './components/QuestionCard.jsx';
import Progress from './components/Progress.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";      
import Login from "./pages/login";
import SignUp from "./pages/signUp";

function getSessionId() {
  const key = 'quiz-session-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2, 14);
    localStorage.setItem(key, id);
  }
  return id;
}

function QuizApp() {
  const sessionId = getSessionId();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAnswers, setShowAnswers] = useState(false);
  const [correctMap, setCorrectMap] = useState(null); // { [qid]: choiceId }
  const [answersLoading, setAnswersLoading] = useState(false);

  // Load quiz + session responses
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const q = await api.getQuiz(1) // Fetch the quiz
        setQuiz(q);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // Removed sessionId dependency

  const total = quiz?.questions?.length || 0;
  const answered = useMemo(() => Object.keys(answers).length, [answers]);
  const hasAny = answered > 0;

  async function handlePick(questionId, choiceId) {
    setAnswers((prev) => ({ ...prev, [String(questionId)]: choiceId }));
  }

  async function handleClear(questionId) {
    setAnswers((prev) => {
      const { [String(questionId)]: _, ...rest } = prev;
      return rest;
    });
  }

  async function calcScore() {
    const s = await api.getScore(sessionId);
    setScore(s);
  }

  async function clearAllAnswers() {
    if (!window.confirm('Clear ALL your saved answers?')) return;
    setAnswers({});
    setScore(null);
  }

  async function toggleAnswerSheet() {
    if (!showAnswers && !correctMap) {
      try {
        setAnswersLoading(true);
        const map = await api.getAnswers();
        setCorrectMap(map);
      } finally {
        setAnswersLoading(false);
      }
    }
    setShowAnswers(v => !v);
  }

  if (loading || !quiz) return <div className="container">Loading…</div>;

  return (
    <div className="container">
      <header className="header">
        <h1>{quiz.title}</h1>
        <Progress answered={answered} total={total} />
      </header>

       {/*<div style={{marginBottom: 8, fontSize: 12, opacity: 0.8}}>
        Session: <code>{sessionId}</code>
      </div> */}

      <ol className="list">
        {quiz.questions.map(q => (
          <li key={q.id}>
            <QuestionCard
              q={q}
              selected={answers[String(q.id)]}
              onPick={handlePick}
              onClear={handleClear}
              correctChoiceId={correctMap ? correctMap[String(q.id)] : null}
              showAnswer={showAnswers}
            />
          </li>
        ))}
      </ol>

      <footer className="footer">
        <button onClick={calcScore}>Check Score</button>
        <button onClick={clearAllAnswers} disabled={!hasAny}>Reset All Answers</button>
        <button onClick={toggleAnswerSheet} disabled={answersLoading}>
          {showAnswers ? 'Hide Answer Sheet' : 'Show Answer Sheet'}
        </button>
        {answersLoading && <span style={{marginLeft: 8}}>Loading answers…</span>}
        {score && <div className="score">Score: {score.score}/{score.total}</div>}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizApp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}