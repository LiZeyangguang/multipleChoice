import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import QuestionCard from './components/QuestionCard.jsx';
import Progress from './components/Progress.jsx';
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Home from "./pages/home";      
import Login from "./pages/login";
import SignUp from "./pages/signUp";
import TimerBar from "./components/TimerBar.jsx";

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

  // read quiz id from route params if present
  const TOTAL_SEC = 1 * 60;
  const { quizId: quizIdParam } = useParams();
  const quizId = Number(quizIdParam || 1);
  const timerKey = React.useMemo(() => `timer-${sessionId}-${quizId}`, [sessionId, quizId]);

  const [remaining, setRemaining] = useState(() => {
  const saved = localStorage.getItem(timerKey);
  return saved !== null ? Number(saved) : TOTAL_SEC;
});
  const [expired, setExpired] = useState(false);

// Refresh timer
  useEffect(() => {
  setExpired(false);
  setRemaining(TOTAL_SEC);
  localStorage.setItem(timerKey, String(TOTAL_SEC));
}, [timerKey]);

  // Timer 
    useEffect(() => {
    if (expired) return;
    if (remaining <= 0) {
      setExpired(true);
      // auto score?
      calcScore();
      return;
    }
    localStorage.setItem(timerKey, String(remaining));
    const id = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, expired, timerKey]);

  function resetTimer() {
    setExpired(false);
    setRemaining(TOTAL_SEC);
    localStorage.setItem(timerKey, String(TOTAL_SEC));
  }

  // Load quiz + session responses
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const q = await api.getQuiz(quizId) // Fetch the quiz
        setQuiz(q);
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]); // reload when quizId changes

  const total = quiz?.questions?.length || 0;
  const answered = useMemo(() => Object.keys(answers).length, [answers]);
  const hasAny = answered > 0;

  async function handlePick(questionId, choiceId) {
    if (expired) return; 
    setAnswers((prev) => ({ ...prev, [String(questionId)]: choiceId }));
  }

  async function handleClear(questionId) {
    if (expired) return; 
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
      <TimerBar
        remainingSec={remaining}
        totalSec={TOTAL_SEC}
        onReset={resetTimer} 
      />
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
        {expired && <div style={{ marginTop: 8, color: '#e53935' }}>Time’s up!</div>}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/quiz/:quizId" element={<QuizApp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}
