import { useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '../api';
import useSessionId from './useSessionId';
import useTimer from './useTimer';

export default function useQuiz(quizId) {
  const { id: sessionId } = useSessionId();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAnswers, setShowAnswers] = useState(false);
  const [correctMap, setCorrectMap] = useState(null);
  const [answersLoading, setAnswersLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const q = await api.getQuiz(quizId);
        if (mounted) setQuiz(q);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [quizId]);

  const total = quiz?.questions?.length || 0;
  const answered = useMemo(() => Object.keys(answers).length, [answers]);

  const calcScore = useCallback(async () => {
    const s = await api.getScore(sessionId);
    setScore(s);
  }, [sessionId]);

  // 60s default
  const { remaining, expired, reset, totalSec } = useTimer({
    quizId,
    totalSec: 60,
    onExpire: calcScore,
  });

  function pick(questionId, choiceId) {
    if (expired) return;
    setAnswers(prev => ({ ...prev, [String(questionId)]: choiceId }));
  }

  function clear(questionId) {
    if (expired) return;
    setAnswers(prev => {
      const { [String(questionId)]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function clearAll() {
    if (!window.confirm('Clear ALL your saved answers?')) return;
    setAnswers({});
    setScore(null);
  }

  async function toggleAnswerSheet() {
    if (!showAnswers && !correctMap) {
      try {
        setAnswersLoading(true);
        const map = await api.getAnswers();
        setCorrectMap(map);
      } finally {
        setAnswersLoading(false);
      }
    }
    setShowAnswers(v => !v);
  }

  return {
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
    remaining,
    expired,
    reset,
    totalSec,
  };
}