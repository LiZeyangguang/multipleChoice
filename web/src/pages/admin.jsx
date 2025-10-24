import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersData = await api.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }

    try {
      const quizzesData = await api.getQuizzes();
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete?')) {
      try {
        await fetch(`/api/admin/${type}/${id}`, {
          method: 'DELETE'
        });
        fetchData(); // Refresh data
        navigate(0); // reload to ensure UI updates
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };






  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Admin Dashboard</h1>

      {/* User Management */}
      <div style={{
        background: 'white',
        padding: '20px',
        marginBottom: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '20px' }}>
          User Management ({users.length} users)
        </h2>
        {users.map(user => (
          <div key={user.user_id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            padding: '10px',
            background: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{user.email}</div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                {user.is_admin ? 'Administrator' : 'Regular User'}
              </div>
            </div>
            <button
              style={{
                background: user.is_admin ? '#ccc' : '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: user.is_admin ? 'not-allowed' : 'pointer',
                opacity: user.is_admin ? 0.6 : 1
              }}
              onClick={() => handleDelete('user', user.user_id)}
              disabled={user.is_admin}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Quiz Management */}
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
                onClick={() => handleDelete('quiz', quiz.quiz_id)}
              >
                Delete Quiz
              </button>
            </div>

            <div style={{ color: '#666', marginBottom: '15px' }}>
              Questions: {quiz.questions?.length || 0} | Time Limit: {quiz.time_limit} minutes
            </div>

            {/* Questions List */}
            {quiz.questions?.map(question => (
              <div key={question.question_id} style={{
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
                    onClick={() => handleDelete('question', question.question_id)}
                  >
                    Delete Question
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;