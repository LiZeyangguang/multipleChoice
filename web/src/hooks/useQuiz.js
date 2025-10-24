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
        const [q, resp] = await Promise.all([
          api.getQuiz(quizId),
          api.getResponses(sessionId),
        ]);
        if (!mounted) return;
        setQuiz(q);
        const ids = new Set((q?.questions || []).map((x) => String(x.id || x.question_id || x.qid)));
        const filtered = {};
        Object.entries(resp || {}).forEach(([qid, choiceId]) => {
          if (ids.has(String(qid))) filtered[String(qid)] = choiceId;
        });
        setAnswers(filtered);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [quizId, sessionId]);

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

  async function pick(questionId, choiceId) {
    if (expired) return;
    setAnswers(prev => ({ ...prev, [String(questionId)]: choiceId }));
    try {
      await api.saveResponse(sessionId, questionId, choiceId);
    } catch (e) {
      // optional: revert on failure
    }
  }

  async function clear(questionId) {
    if (expired) return;
    setAnswers(prev => {
      const { [String(questionId)]: _removed, ...rest } = prev;
      return rest;
    });
    try {
      await api.clearResponse(sessionId, questionId);
    } catch (e) {
      // ignore for now
    }
  }

  async function clearAll() {
    if (!window.confirm('Clear ALL your saved answers?')) return;
    setAnswers({});
    setScore(null);
    try { await api.clearAll(sessionId); } catch (e) {}
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