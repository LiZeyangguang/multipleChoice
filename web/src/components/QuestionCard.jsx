import React from 'react';

export default function QuestionCard({ q, selected, onPick, onClear, correctChoiceId, showAnswer, disabled = false }) {
  return (
    <div className="card">
      <div className="qtext">{q.index}. {q.text}</div>
      <div className="choices">
        {q.choices.map(c => {
          const isSelected = selected === c.id;
          const isCorrect = showAnswer && correctChoiceId === c.id;

          return (
            <label
              key={c.id}
              className={[
                'choice',
                isSelected ? 'selected' : '',
                isCorrect ? 'correct' : ''
              ].join(' ').trim()}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={isSelected}
                onChange={() => onPick(q.id, c.id)}
                disabled={disabled}
              />
              <span>
                {c.text}
                {isCorrect ? '  ✓' : ''}
              </span>
            </label>
          );
        })}
      </div>
      <div className="actions">
        <button type="button" disabled={disabled || selected == null} onClick={() => onClear(q.id)}>Clear</button>
      </div>
    </div>
  );
}
