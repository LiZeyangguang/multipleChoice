import { useEffect, useMemo, useRef, useState } from 'react';
import useSessionId from './useSessionId';

export default function useTimer({ quizId, totalSec, onExpire } = {}) {
	const { id: sessionId } = useSessionId();

	const timerKey = useMemo(() => `timer-${sessionId}-${Number(quizId || 1)}`, [sessionId, quizId]);
	const [remaining, setRemaining] = useState(() => {
		const saved = typeof window !== 'undefined' ? localStorage.getItem(timerKey) : null;
		return saved !== null ? Number(saved) : totalSec;
	});
	const [expired, setExpired] = useState(false);

	// Refresh timer
	useEffect(() => {
		setExpired(false);
		setRemaining(totalSec);
	}, [timerKey, totalSec]);

	// Timer
	useEffect(() => {
		if (expired) return;
		if (remaining <= 0) {
			setExpired(true);
			return; // onExpire handled in a separate effect to guarantee single call
		}
		localStorage.setItem(timerKey, String(remaining));
		const id = setTimeout(() => setRemaining((s) => s - 1), 1000);
		return () => clearTimeout(id);
	}, [remaining, expired, timerKey]);

	// Call onExpire
	const calledRef = useRef(false);
	useEffect(() => {
		if (expired && !calledRef.current) {
			calledRef.current = true;
			onExpire?.();
		}
		if (!expired) {
			calledRef.current = false;
		}
	}, [expired, onExpire]);

	function reset() {
		setExpired(false);
		setRemaining(totalSec);
		if (typeof window !== 'undefined') {
			localStorage.setItem(timerKey, String(totalSec));
		}
	}

	return { remaining, expired, reset, totalSec };
}

