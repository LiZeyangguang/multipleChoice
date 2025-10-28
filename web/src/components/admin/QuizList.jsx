import React, { useEffect, useState } from 'react';
import { api } from '../../api';

export default function QuizList({ quizzes, onDeleteQuiz, onDeleteQuestion, onImported }) {
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const [counts, setCounts] = useState({}); // store question counts
  const [attemptsOpen, setAttemptsOpen] = useState({}); // quizId => boolean
  const [topAttempts, setTopAttempts] = useState({}); // quizId => array
  // inline rename state
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [savingRename, setSavingRename] = useState(false);

  function startRename(q) {
    setEditingId(q.quiz_id);
    setNewTitle(q.title);
  }

  function cancelRename() {
    setEditingId(null);
    setNewTitle('');
  }

  async function saveRename(quizId) {
    const title = (newTitle || '').trim();
    if (!title) return alert('Title cannot be empty.');
    try {
      setSavingRename(true);
      await api.updateQuizTitle(quizId, title);
      // Refresh list: use your parent refetch if provided, else reload
      onImported?.() || window.location.reload();
    } catch (e) {
      alert(e.message || 'Rename failed');
    } finally {
      setSavingRename(false);
    }
  }

  function handleRenameKey(e, quizId) {
    if (e.key === 'Enter') saveRename(quizId);
    if (e.key === 'Escape') cancelRename();
  }
  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErr('');
    setOk('');

    if (!title.trim()) {
      setErr('Please enter a quiz title before selecting a file.');
      e.target.value = '';
      return;
    }

    try {
      setBusy(true);
      const text = await file.text();
      let raw;
      try {
        raw = JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON file.');
      }

      if (!Array.isArray(raw)) {
        throw new Error('Expected a JSON array of {question, options, answer}.');
      }

      const normalizedQuestions = raw.map((q, idx) => {
        if (!q?.question || !q?.options || !q?.answer) {
          throw new Error(`Row ${idx + 1} is missing fields (question/options/answer).`);
        }
        const letter = String(q.answer).trim().toLowerCase();
        const choices = Object.entries(q.options).map(([key, val]) => ({
          text: String(val ?? '').trim(),
          is_correct: key.toLowerCase() === letter,
        }));
        if (!choices.some(c => c.is_correct)) {
          throw new Error(`Row ${idx + 1} has no correct answer match.`);
        }
        return { text: q.question, choices };
      });

      const payload = {
        title: title.trim(),
        questions: normalizedQuestions,
      };

      const created = await api.adminImportQuiz(payload);

      setOk(`Imported: ${created.title} (ID: ${created.quiz_id}) with ${created.question_count} questions.`);
      setTitle('');
      onImported?.(); // ask parent to refresh
    } catch (e2) {
      setErr(e2.message || 'Failed to import quiz.');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  // Fetch question counts for quizzes
  useEffect(() => {
    quizzes.forEach(async (quiz) => {
      try {
        const data = await api.getQuizQuestionAmount(quiz.quiz_id);
        setCounts(prev => ({ ...prev, [quiz.quiz_id]: data.amount }));
      } catch (err) {
        console.error(err);
        setCounts(prev => ({ ...prev, [quiz.quiz_id]: '?' }));
      }
    });
  }, [quizzes]);

  async function toggleAttempts(quizId) {
    setAttemptsOpen(prev => ({ ...prev, [quizId]: !prev[quizId] }));
    // Lazy-load attempts on first open
    if (!topAttempts[quizId]) {
      try {
        const list = await api.getTopAttemptsByUser(quizId);
        setTopAttempts(prev => ({ ...prev, [quizId]: list }));
      } catch (e) {
        console.error('Failed to load latest attempts', e);
        setTopAttempts(prev => ({ ...prev, [quizId]: [] }));
      }
    }
  }

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '20px' }}>Quiz Management ({quizzes.length} quizzes)</h2>

      {/* Import panel */}
      <div style={{ display: 'grid', gap: 8, alignItems: 'center', gridTemplateColumns: '1fr 160px 220px', marginBottom: 16 }}>
        <input
          placeholder="Quiz title (e.g., Python Basics)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ padding: 8 }}
        />

        <label style={{
          display: 'inline-block',
          background: busy ? '#aaa' : '#0d6efd',
          color: 'white',
          padding: '8px 12px',
          borderRadius: 4,
          cursor: busy ? 'not-allowed' : 'pointer',
          textAlign: 'center'
        }}>
          {busy ? 'Importing…' : 'Import Quiz (JSON)'}
          <input
            type="file"
            accept="application/json"
            onChange={handleFile}
            disabled={busy}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      {ok && <div style={{ color: 'seagreen', marginBottom: 12 }}>{ok}</div>}
      {err && <div style={{ color: 'crimson', marginBottom: 12 }}>{err}</div>}

      {/* Existing listing */}
      {quizzes.map(quiz => (
        <div key={quiz.quiz_id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '6px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              gap: 12,
            }}
          >
            {/* Left side: title or editor */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              {editingId === quiz.quiz_id ? (
                <>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => handleRenameKey(e, quiz.quiz_id)}
                    autoFocus
                    style={{ padding: '8px', flex: 1, minWidth: 160 }}
                    aria-label="New quiz title"
                  />
                  <button
                    onClick={() => saveRename(quiz.quiz_id)}
                    disabled={savingRename}
                    style={{ padding: '8px 12px' }}
                    title="Save title"
                  >
                    {savingRename ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={cancelRename}
                    disabled={savingRename}
                    style={{ padding: '8px 12px' }}
                    title="Cancel"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h3 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {quiz.title}
                  </h3>
                  <button
                    onClick={() => startRename(quiz)}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                    title="Rename this quiz"
                  >
                    Rename
                  </button>
                </>
              )}
            </div>

            {/* Right side: delete stays where it is */}
            <button
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              onClick={() => onDeleteQuiz(quiz.quiz_id)}
            >
              Delete Quiz
            </button>
          </div>


          <div style={{ color: '#666', marginBottom: '15px' }}>
            Questions: {counts[quiz.quiz_id] ?? '…'} | Time Limit: {quiz.time_limit} minutes
          </div>

          <div style={{ marginBottom: 12 }}>
            <button
              style={{ background: '#0d6efd', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}
              onClick={() => toggleAttempts(quiz.quiz_id)}
            >
              {attemptsOpen[quiz.quiz_id] ? 'Hide top scores' : 'Show top scores'}
            </button>
          </div>

          {attemptsOpen[quiz.quiz_id] && (
            <div style={{ background: '#f9fbff', border: '1px solid #e3f2fd', borderRadius: 6, padding: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Top score per user</div>
              {(() => {
                const list = topAttempts[quiz.quiz_id];
                if (!list) return <div>Loading…</div>;
                if (list.length === 0) return <div style={{ color: '#666' }}>No attempts yet.</div>;
                return (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {list.map((a) => (
                      <li key={a.attempt_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px dashed #ddd' }}>
                        <span>
                          <strong>{a.email || `User #${a.user_id}`}</strong>
                          {a.score == null ? ' — In progress' : ` — Top score: ${a.score}`}
                        </span>
                        <span style={{ color: '#555' }}>{a.attempts_count} attempt{a.attempts_count === 1 ? '' : 's'}</span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          )}

          {(quiz.questions || []).map(question => (
            <div key={question.question_id || question.id} style={{ marginLeft: '20px', marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '500' }}>{question.text}</div>
                <button
                  style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                  onClick={() => onDeleteQuestion(question.question_id || question.id)}
                >
                  Delete Question
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
