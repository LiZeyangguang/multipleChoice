import React from 'react';
import { useParams } from 'react-router-dom';
import Progress from '../components/Progress';
import QuestionCard from '../components/QuestionCard.jsx';
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
    toggleAnswerSheet,
    showAnswers,
    correctMap,
    answersLoading,
    total,
    answered,
  } = useQuiz(quizId);

  if (loading || !quiz) return <div className="container">Loading</div>;

  return (
    <div className="container">
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
            />
          </li>
        ))}
      </ol>

      <footer className="footer">
        <button onClick={calcScore}>Check Score</button>
        <button onClick={clearAll} disabled={answered === 0}>Reset All Answers</button>
        <button onClick={toggleAnswerSheet} disabled={answersLoading}>
          {showAnswers ? 'Hide Answer Sheet' : 'Show Answer Sheet'}
        </button>
        {answersLoading && <span style={{ marginLeft: 8 }}>Loading answers…</span>}
        {score && <div className="score">Score: {score.score}/{score.total}</div>}
      </footer>
    </div>
  );
}