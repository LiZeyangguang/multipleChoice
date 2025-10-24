import React from 'react';
import { useParams } from 'react-router-dom';
import Progress from '../components/Progress';
import QuestionCard from '../components/QuestionCard.jsx';
import TimerBar from '../components/TimeBar.jsx';
import useQuiz from '../hooks/useQuiz';

export default function Quiz() {
  const params = useParams();
  const quizId = params?.quizId ? Number(params.quizId) : 1;

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
      <TimerBar
        remainingSec={remaining}
        totalSec={totalSec}
        onReset={reset}
      />
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
        <button onClick={submit} disabled={submitting || locked || answered === 0}>Submit</button>
        <button onClick={clearAll} disabled={answered === 0 || locked}>Reset All Answers</button>
        {answersLoading && <span style={{ marginLeft: 8 }}>Loading answers…</span>}
        {score && <div className="score">Score: {score.score}/{score.total}</div>}
        {expired && <div style={{ marginTop: 8, color: '#e53935' }}>Time’s up!</div>}
        {locked && !expired && <div style={{ marginTop: 8, color: '#2e7d32' }}>Submitted. Your answers are locked.</div>}
      </footer>
    </div>
  );
}