import React from 'react';
import Progress from '../components/Progress';

// Presentational QuizPage component
// Props:
// - title: string
// - questions: array
// - renderQuestion: function(q) => ReactNode
// - answered: number
// - total: number
// - onCheckScore, onResetAll, onToggleAnswerSheet
// - answersLoading, showAnswers, score
export default function QuizPage({
  title,
  questions = [],
  renderQuestion,
  answered = 0,
  total = 0,
  onCheckScore,
  onResetAll,
  onToggleAnswerSheet,
  answersLoading = false,
  showAnswers = false,
  score = null,
}) {
  return (
    <div className="container">
      <header className="header">
        <h1>{title}</h1>
        <Progress answered={answered} total={total} />
      </header>

      <ol className="list">
        {questions.map(q => (
          <li key={q.id}>{renderQuestion ? renderQuestion(q) : null}</li>
        ))}
      </ol>

      <footer className="footer">
        <button onClick={onCheckScore}>Check Score</button>
        <button onClick={onResetAll} disabled={answered === 0}>Reset All Answers</button>
        <button onClick={onToggleAnswerSheet} disabled={answersLoading}>
          {showAnswers ? 'Hide Answer Sheet' : 'Show Answer Sheet'}
        </button>
        {answersLoading && <span style={{marginLeft: 8}}>Loading answers…</span>}
        {score && <div className="score">Score: {score.score}/{score.total}</div>}
      </footer>
    </div>
  );
}
