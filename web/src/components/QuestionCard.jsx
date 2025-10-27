import React from 'react';

export default function QuestionCard({ q, selected, onPick, onClear, correctChoiceId, showAnswer, disabled = false }) {
  return (
    <div className="card">
      <div className="qtext">{q.index}. {q.text}</div>
      <div className="choices">
        {q.choices.map(c => {
          const isSelected = selected === c.id;
          const isCorrect = showAnswer && correctChoiceId === c.id;

          // Determine post-submit highlighting classes
          const classes = ['choice'];
          if (showAnswer) {
            if (isSelected && isCorrect) {
              classes.push('correct-selected'); // green
            } else if (isSelected && !isCorrect) {
              classes.push('incorrect-selected'); // red
            } else if (!isSelected && isCorrect) {
              classes.push('correct-unselected'); // grey for the right answer not chosen
            }
          } else {
            if (isSelected) classes.push('selected'); // pre-submit selected state
          }

          return (
            <label
              key={c.id}
              className={classes.join(' ').trim()}
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
