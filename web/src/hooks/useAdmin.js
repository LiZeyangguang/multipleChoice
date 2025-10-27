import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

export default function useAdmin() {
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [questionCount, setQuestionCount] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, quizzesData] = await Promise.all([
        api.getUsers(),
        api.getQuizzes(),
      ]);
      setUsers(usersData || []);
      setQuizzes(quizzesData || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refresh();
    })();
    return () => { mounted = false; };
  }, [refresh]);

  const deleteUser = useCallback(async (userId) => {
    await api.deleteUser(userId);
    await refresh();
  }, [refresh]);

  const deleteQuiz = useCallback(async (quizId) => {
    await api.deleteQuiz(quizId);
    await refresh();
  }, [refresh]);

  const deleteQuestion = useCallback(async (questionId) => {
    await api.deleteQuestion(questionId);
    await refresh();
  }, [refresh]);

  const getQuizQuestionAmount = useCallback(async () => {
    const s = await api.getQuizQuestionAmount(quiz_id)
    setQuestionCount(s);
  });

  return {
    users,
    quizzes,
    loading,
    error,
    refresh,
    deleteUser,
    deleteQuiz,
    deleteQuestion,
  };
}
