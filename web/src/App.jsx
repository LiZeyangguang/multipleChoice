import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import QuestionCard from './components/QuestionCard.jsx';
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Home from "./pages/home";      
import Login from "./pages/login";
import SignUp from "./pages/signUp";
import Quiz from './pages/quiz.jsx';

function getSessionId() {
  const key = 'quiz-session-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2, 14);
    localStorage.setItem(key, id);
  }
  return id;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}