const BASE = 'http://127.0.0.1:4000/api';

export const api = {
  // Quiz Endpoints
  getQuizzes: async () => {
    const response = await fetch(`${BASE}/quiz/`);
    if (!response.ok) throw new Error('Failed to fetch quizzes');
    return response.json();
  },
  getQuiz: async (quizId) => {
    const response = await fetch(`${BASE}/quiz/${quizId}`);
    if (!response.ok) throw new Error('Failed to fetch quiz');
    return response.json();
  },

  // Question Endpoints
  getQuestions: async () => {
    const response = await fetch(`${BASE}/question/`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
  },
  getQuestion: async (questionId) => {
    const response = await fetch(`${BASE}/question/${questionId}`);
    if (!response.ok) throw new Error('Failed to fetch question');
    return response.json();
  },

  // Choice Endpoints
  getChoices: async () => {
    const response = await fetch(`${BASE}/choice/`);
    if (!response.ok) throw new Error('Failed to fetch choices');
    return response.json();
  },
  getChoice: async (choiceId) => {
    const response = await fetch(`${BASE}/choice/${choiceId}`);
    if (!response.ok) throw new Error('Failed to fetch choice');
    return response.json();
  },

  // User Endpoints
  getUsers: async () => {
    const response = await fetch(`${BASE}/user/`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
  getUser: async (userId) => {
    const response = await fetch(`${BASE}/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },
  createUser: async ({ email, password, is_admin = 0 }) => {
    const response = await fetch(`${BASE}/user/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, is_admin })
    });
    const text = await response.text();
    if (!response.ok) {
      let message = text || 'Failed to create user';
      try {
        const json = JSON.parse(text || '{}');
        if (json && json.error) message = json.error;
      } catch (e) {
        // ignore JSON parse errors
      }
      throw new Error(message);
    }
    return JSON.parse(text);
  },
  login: async ({ email, password }) => {
    const response = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const text = await response.text();
    if (!response.ok) {
      let message = text || 'Login failed';
      try {
        const json = JSON.parse(text || '{}');
        if (json && json.error) message = json.error;
      } catch (e) {}
      throw new Error(message);
    }
    return JSON.parse(text);
  },

  // ---------------------------------------------------------------

  /*
    CHECK IF USER IS LOGGED ON -ARSENY
  */
  // ---------------------------------------------------------------
  checkAuth: async () => {
  const response = await fetch(`${BASE}/auth/me`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Not authenticated');
  }
  return response.json();
},

// ---------------------------------------------------------------


  // Quiz Attempt Endpoints
  getQuizAttempts: async () => {
    const response = await fetch(`${BASE}/quiz_attempt/`);
    if (!response.ok) throw new Error('Failed to fetch quiz attempts');
    return response.json();
  },
  getQuizAttempt: async (attemptId) => {
    const response = await fetch(`${BASE}/quiz_attempt/${attemptId}`);
    if (!response.ok) throw new Error('Failed to fetch quiz attempt');
    return response.json();
  },



  // Response Endpoints
  getResponses: async (sessionId) => {
    const response = await fetch(`${BASE}/responses/${sessionId}`);
    if (!response.ok) throw new Error('Failed to fetch responses');
    return response.json();
  },

  saveResponse: async (sessionId, qid, choiceId) => {
    const response = await fetch(`${BASE}/responses/${sessionId}/${qid}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choiceId })
    });
    if (!response.ok) throw new Error('Failed to save response');
  },

  clearResponse: async (sessionId, qid) => {
    const response = await fetch(`${BASE}/responses/${sessionId}/${qid}`, { method: 'DELETE' });
    if (!response.ok && response.status !== 204) throw new Error('Failed to clear response');
  },

  clearAll: async (sessionId) => {
    const response = await fetch(`${BASE}/responses/${sessionId}`, { method: 'DELETE' });
    if (!response.ok && response.status !== 204) throw new Error('Failed to clear all responses');
  },

  getAnswers: async () => {
    const response = await fetch(`${BASE}/answers`);
    if (!response.ok) throw new Error('Failed to fetch answers');
    return response.json();
  },

  getScore: async (sessionId) => {
    const response = await fetch(`${BASE}/score/${sessionId}`);
    if (!response.ok) throw new Error('Failed to fetch score');
    return response.json();
  }
};
