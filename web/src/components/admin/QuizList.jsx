import React from 'react';

export default function QuizList({ quizzes, onDeleteQuiz, onDeleteQuestion }) {
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '20px' }}>
        Quiz Management ({quizzes.length} quizzes)
      </h2>
      {quizzes.map(quiz => (
        <div key={quiz.quiz_id} style={{
          marginBottom: '20px',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>{quiz.title}</h3>
            <button
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => onDeleteQuiz(quiz.quiz_id)}
            >
              Delete Quiz
            </button>
          </div>

          <div style={{ color: '#666', marginBottom: '15px' }}>
            Questions: {quiz.questions?.length || 0} | Time Limit: {quiz.time_limit} minutes
          </div>

          {(quiz.questions || []).map(question => (
            <div key={question.question_id || question.id} style={{
              marginLeft: '20px',
              marginTop: '10px',
              padding: '10px',
              background: '#f5f5f5',
              borderRadius: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '500' }}>{question.text}</div>
                <button
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
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
