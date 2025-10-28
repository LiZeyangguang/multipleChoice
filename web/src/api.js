const BASE = 'http://127.0.0.1:4000/api';
const client = (url, opts = {}) =>
  fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });

export const api = {
  // Quiz Endpoints
  getQuizzes: async () => {
    const response = await client(`/api/quiz/`);
    if (!response.ok) throw new Error('Failed to fetch quizzes');
    return response.json();
  },
  getQuiz: async (quizId) => {
    const response = await client(`/api/quiz/${quizId}`);
    if (!response.ok) throw new Error('Failed to fetch quiz');
    return response.json();
  },
  deleteQuiz: async (quizId) => {
    const response = await client(`/api/quiz/${quizId}`, { method: 'DELETE' });
    if (!response.ok && response.status !== 204) throw new Error('Failed to delete quiz');
    return true;
  },

  updateQuizTitle: async (quizId, title) => {
  const r = await client(`/api/quiz/${quizId}`, {
    method: 'PUT',
    body: JSON.stringify({ title }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(text || 'Failed to update quiz title');
  return JSON.parse(text);
},

  // Question Endpoints
  getQuestions: async () => {
    const response = await client(`/api/question/`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
  },
  getQuestion: async (questionId) => {
    const response = await client(`/api/question/${questionId}`);
    if (!response.ok) throw new Error('Failed to fetch question');
    return response.json();
  },
  deleteQuestion: async (questionId) => {
    const response = await client(`/api/question/${questionId}`, { method: 'DELETE' });
    if (!response.ok && response.status !== 204) throw new Error('Failed to delete question');
    return true;
  },

  // Choice Endpoints
  getChoices: async () => {
    const response = await client(`/api/choice/`);
    if (!response.ok) throw new Error('Failed to fetch choices');
    return response.json();
  },
  getChoice: async (choiceId) => {
    const response = await client(`/api/choice/${choiceId}`);
    if (!response.ok) throw new Error('Failed to fetch choice');
    return response.json();
  },

  // User Endpoints
  getUsers: async () => {
    const response = await client(`/api/user/`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
  getUser: async (userId) => {
    const response = await client(`/api/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },
  deleteUser: async (userId) => {
    const response = await client(`/api/user/${userId}`, { method: 'DELETE' });
    if (!response.ok && response.status !== 204) throw new Error('Failed to delete user');
    return true;
  },
  createUser: async ({ email, password, is_admin = 0 }) => {
    const response = await client(`/api/user/`, {
      method: 'POST',
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
  login: (emailOrObj, password) => {
      // Support both api.login(email, password) and api.login({ email, password })
      let payload;
      if (typeof emailOrObj === 'object' && emailOrObj !== null) {
        const { email, password: pw } = emailOrObj;
        payload = { email, password: pw };
      } else {
        payload = { email: emailOrObj, password };
      }
      return client('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
    },
  // ---------------------------------------------------------------

  /*
    CHECK IF USER IS LOGGED ON -ARSENY
  */
  // ---------------------------------------------------------------
  checkAuth: async () => {
  const response = await client(`/api/auth/me`, {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error('Not authenticated');
  }
  return response.json();
},


 /*
    LOG-OUT FUNCTIONALITY -ARSENY
  */

logout: async () => {
  const response = await client(`/api/auth/logout`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  return true;
},

// ---------------------------------------------------------------


  // Quiz Attempt Endpoints
  getQuizAttempts: async () => {
    const response = await client(`/api/quiz_attempt/`);
    if (!response.ok) throw new Error('Failed to fetch quiz attempts');
    return response.json();
  },
  getQuizAttempt: async (attemptId) => {
    const response = await client(`/api/quiz_attempt/${attemptId}`);
    if (!response.ok) throw new Error('Failed to fetch quiz attempt');
    return response.json();
  },

  // Used when submitting a quiz
  createQuizAttempt: async ({ user_id, quiz_id, score = 0 }) => {
    const response = await client(`/api/quiz_attempt/`, {
      method: 'POST',
      body: JSON.stringify({ user_id, quiz_id, score }),
    });
    if (!response.ok) {
      const text = await response.text();
      let message = 'Failed to create quiz attempt';
      try {
        const j = JSON.parse(text || '{}');
        if (j && j.error) message = j.error;
      } catch (_) {}
      throw new Error(message);
    }
    return response.json();
  },

  // Top score per user for a quiz (admin)
  getTopAttemptsByUser: async (quiz_id) => {
    const response = await client(`/api/quiz_attempt/quiz/${quiz_id}/top_by_user`);
    if (!response.ok) throw new Error('Failed to fetch top attempts');
    return response.json();
  },



  // Response Endpoints
  getResponses: async (sessionId) => {
    const response = await client(`/api/responses/${sessionId}`);
    if (!response.ok) throw new Error('Failed to fetch responses');
    return response.json();
  },

  saveResponse: async (sessionId, qid, choiceId) => {
    const response = await client(`/api/responses/${sessionId}/${qid}`, {
      method: 'PUT',
      body: JSON.stringify({ choiceId })
    });
    if (!response.ok) throw new Error('Failed to save response');
  },

  clearResponse: async (sessionId, qid) => {
    const response = await client(`/api/responses/${sessionId}/${qid}`, { method: 'DELETE' });
    if (!response.ok && response.status !== 204) throw new Error('Failed to clear response');
  },

  clearAll: async (sessionId) => {
    const response = await client(`/api/responses/${sessionId}`, { method: 'DELETE' });
    if (!response.ok && response.status !== 204) throw new Error('Failed to clear all responses');
  },

  getAnswers: async () => {
    const response = await client(`/api/answers`);
    if (!response.ok) throw new Error('Failed to fetch answers');
    return response.json();
  },

  // getScore: async (sessionId) => {
  //   const response = await client(`/api/score/${sessionId}`);
  //   if (!response.ok) throw new Error('Failed to fetch score');
  //   return response.json();
  // }, 


  getScore: async (sessionId, quiz_id) => {
  const response = await client(`/api/score/${sessionId}?QuizId=${quiz_id}`);
  if (!response.ok) throw new Error('Failed to fetch score');
  return response.json();
},

  // import quiz endpoint
  adminImportQuiz: async ({ title, time_limit, questions }) => {
    const response = await client(`/api/quiz/import`, {
      method: 'POST',
      body: JSON.stringify({ title, time_limit, questions }),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || 'Failed to import quiz');
    return JSON.parse(text); // { quiz_id, title, question_count, time_limit }
  }, 

  getQuizQuestionAmount: async (quiz_id) => {
    const response = await client(`/api/quiz/questions_number/${quiz_id}`);
    if (!response.ok) throw new Error('Failed to fetch score');
    return response.json();
  },


  getPublicQuizzes: async () => {
    const r = await client('/api/quiz/public');
    if (!r.ok) throw new Error('Failed to fetch quizzes');
    return r.json(); // [{quiz_id, title}]
  },
};
