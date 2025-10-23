import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import QuestionCard from './components/QuestionCard.jsx';
import QuizPage from './pages/QuizPage.jsx';
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
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

  // read quiz id from route params if present
  const params = useParams ? useParams() : null;
  const quizId = params && params.quizId ? Number(params.quizId) : 1;

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

  if (loading || !quiz) return <div className="container">Loading</div>;

  return (
    <QuizPage
      title={quiz.title}
      questions={quiz.questions}
      renderQuestion={(q) => (
        <QuestionCard
          q={q}
          selected={answers[String(q.id)]}
          onPick={handlePick}
          onClear={handleClear}
          correctChoiceId={correctMap ? correctMap[String(q.id)] : null}
          showAnswer={showAnswers}
        />
      )}
      answered={answered}
      total={total}
      onCheckScore={calcScore}
      onResetAll={clearAllAnswers}
      onToggleAnswerSheet={toggleAnswerSheet}
      answersLoading={answersLoading}
      showAnswers={showAnswers}
      score={score}
    />
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