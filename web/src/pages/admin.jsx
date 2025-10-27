import React from 'react';
import useAdmin from '../hooks/useAdmin';
import UserList from '../components/admin/UserList';
import QuizList from '../components/admin/QuizList';

const Admin = () => {
  const { users, quizzes, loading, error, deleteUser, deleteQuiz, deleteQuestion } = useAdmin();

  const handleDelete = (kind, id) => {
    if (!window.confirm('Are you sure you want to delete?')) return;
    if (kind === 'user') return deleteUser(id);
    if (kind === 'quiz') return deleteQuiz(id);
    if (kind === 'question') return deleteQuestion(id);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Admin Dashboard</h1>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'red' }}>Error: {String(error.message || error)}</div>}

      <UserList users={users} onDelete={(id) => handleDelete('user', id)} />
      <QuizList
        quizzes={quizzes}
        onDeleteQuiz={(id) => handleDelete('quiz', id)}
        onDeleteQuestion={(id) => handleDelete('question', id)}
        onImported={() => window.location.reload()}
      />
    </div>
  );
};

export default Admin;