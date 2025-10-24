import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";      
import Login from "./pages/login";
import SignUp from "./pages/signUp";

// Make certain routes private unless logged-in 
// - Arseny
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthProvider';
// ------------------------------------------------
import Quiz from './pages/quiz.jsx';


export default function App() {
  return (
    <AuthProvider>   {/* Wrap app with AuthProvider */}
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />

          {/* Protected routes */}
          <Route 
            path="/home" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
          <Route
            path="/quiz/:quizId"
            element={
              <PrivateRoute>
                <Quiz />
              </PrivateRoute>
            }
          />
          {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
