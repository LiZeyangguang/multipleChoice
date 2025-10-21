const BASE = 'http://127.0.0.1:4000/api';

export const api = {
  getQuiz: async () => (await fetch(`${BASE}/quiz`)).json(),

  getResponses: async (sessionId) =>
    (await fetch(`${BASE}/responses/${sessionId}`)).json(),

  saveResponse: async (sessionId, qid, choiceId) => {
    const r = await fetch(`${BASE}/responses/${sessionId}/${qid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choiceId })
    });
    if (!r.ok) throw new Error('Failed to save');
  },

  clearResponse: async (sessionId, qid) => {
    const r = await fetch(`${BASE}/responses/${sessionId}/${qid}`, { method: 'DELETE' });
    if (!r.ok && r.status !== 204) throw new Error('Failed to clear');
  },

  clearAll: async (sessionId) => {
    const r = await fetch(`${BASE}/responses/${sessionId}`, { method: 'DELETE' });
    if (!r.ok && r.status !== 204) throw new Error('Failed to clear all');
  },

  getAnswers: async () => (await fetch(`${BASE}/answers`)).json(),

  getScore: async (sessionId) =>
    (await fetch(`${BASE}/score/${sessionId}`)).json()
};
