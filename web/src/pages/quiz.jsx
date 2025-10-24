import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Progress from '../components/Progress';
import QuestionCard from '../components/QuestionCard.jsx';
import TimerBar from '../components/TimeBar.jsx';
import useQuiz from '../hooks/useQuiz';

export default function Quiz() {
  const params = useParams();
  const quizId = params?.quizId ? Number(params.quizId) : 1;
  const navigate = useNavigate();

  const {
    quiz,
    loading,
    answers,
    pick,
    clear,
    score,
    calcScore,
    clearAll,
    showAnswers,
    correctMap,
    answersLoading,
    total,
    answered,
    remaining,
    expired,
    reset,
    totalSec,
    locked,
    submitting,
    submit,
  } = useQuiz(quizId);

  if (loading || !quiz) return <div className="container">Loading</div>;

  return (
    <div className="container">
      {locked ? (
        <div className="submitted-banner">
          <div>
            <div className="title">Submitted</div>
            {score && <div className="meta">Score: {score.score}/{score.total}</div>}
          </div>
          <div>
            <button className="btn-primary" onClick={() => navigate('/home')}>Return Home</button>
          </div>
        </div>
      ) : (
        <TimerBar
          remainingSec={remaining}
          totalSec={totalSec}
          onReset={reset}
        />
      )}
      <header className="header">
        <h1>{quiz.title}</h1>
        <Progress answered={answered} total={total} />
      </header>

      <ol className="list">
        {quiz.questions.map(q => (
          <li key={q.id}>
            <QuestionCard
              q={q}
              selected={answers[String(q.id)]}
              onPick={pick}
              onClear={clear}
              correctChoiceId={correctMap ? correctMap[String(q.id)] : null}
              showAnswer={showAnswers}
              disabled={expired || locked}
            />
          </li>
        ))}
      </ol>

      <footer className="footer">
        <button
          onClick={() => {
            // Confirmation popup with unanswered warning
            const unanswered = total - answered;
            const base = 'Are you sure you want to submit your answers?';
            const warn = unanswered > 0 ? `\n\nWarning: ${unanswered} question(s) are unanswered.` : '';
            const msg = `${base}${warn}`;
            if (window.confirm(msg)) {
              submit();
            }
          }}
          className="btn-primary"
          disabled={submitting || locked || answered === 0}
        >
          Submit
        </button>
        <button onClick={clearAll} disabled={answered === 0 || locked}>Reset All Answers</button>
        {answersLoading && <span style={{ marginLeft: 8 }}>Loading answers…</span>}
        {score && <div className="score">Score: {score.score}/{score.total}</div>}
        {!locked && expired && <div style={{ marginTop: 8, color: '#e53935' }}>Time’s up!</div>}
        {locked && !expired && <div style={{ marginTop: 8, color: '#2e7d32' }}>Submitted. Your answers are locked.</div>}
      </footer>
    </div>
  );
}