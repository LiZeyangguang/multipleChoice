import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { api } from '../api';
import useSessionId from './useSessionId';
import useTimer from './useTimer';

export default function useQuiz(quizId) {
  const { id: sessionId } = useSessionId();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showAnswers, setShowAnswers] = useState(false);
  const [correctMap, setCorrectMap] = useState(null);
  const [answersLoading, setAnswersLoading] = useState(false);
  const submitRef = useRef(null);

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

  const total = quiz?.questions?.length || 0;  // WHAT DOES THIS DO ???
  const answered = useMemo(() => Object.keys(answers).length, [answers]);

  const calcScore = useCallback(async () => {
    const s = await api.getScore(sessionId, quizId);
    setScore(s);
    return s;
  }, [sessionId]);

  // Timer setup (use quiz.time_limit when available, fallback 60)
  const configuredTotalSec = useMemo(() => {
    const t = Number(quiz?.time_limit ?? 0);
    return t > 0 ? t : 60;
  }, [quiz]);
  const { remaining, expired, reset, totalSec } = useTimer({
    quizId,
    totalSec: configuredTotalSec,
    onExpire: () => submitRef.current?.({ ignoreExpired: true }),
  });

  async function pick(questionId, choiceId) {
    if (expired || locked) return;
    setAnswers(prev => ({ ...prev, [String(questionId)]: choiceId }));
    try {
      await api.saveResponse(sessionId, questionId, choiceId);
    } catch (e) {
      // optional: revert on failure
    }
  }

  async function clear(questionId) {
    if (expired || locked) return;
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

  // Submit: compute score, create quiz_attempt in DB (best-effort), lock, and show answers
  const submit = useCallback(async ({ ignoreExpired = false } = {}) => {
    if ((expired && !ignoreExpired) || locked || submitting) return;
    try {
      setSubmitting(true);
      // 1) compute current score from saved responses
      const s = await calcScore();

      // 2) Best-effort DB attempt creation (don't block UI if it fails)
      try {
        const me = await api.checkAuth();
        const uid = me?.user_id ?? me?.id;
        const qid = quiz?.id ?? quizId;
        if (uid && qid) {
          await api.createQuizAttempt({ user_id: uid, quiz_id: qid, score: s?.score ?? 0 });
        }
      } catch (e) {
        // ignore DB creation failures (e.g., not logged in)
      }

      // 4) fetch and reveal correct answers
      if (!correctMap) {
        setAnswersLoading(true);
        try {
          const map = await api.getAnswers();
          setCorrectMap(map);
        } finally {
          setAnswersLoading(false);
        }
      }
      setShowAnswers(true);

      // 5) lock further edits
      setLocked(true);
    } finally {
      setSubmitting(false);
    }
  }, [expired, locked, submitting, calcScore, quiz, quizId, correctMap]);

  // Keep the latest submit in a ref for timer callback
  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  // (timer wired above to avoid TDZ on 'expired')

  // Clear transient responses when navigating away from this quiz page
  useEffect(() => {
    return () => {
      try {
        // Best-effort cleanup; do not await to avoid blocking navigation
        api.clearAll(sessionId);
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, [sessionId, quizId]);

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
    locked,
    submitting,
    submit,
  };
}