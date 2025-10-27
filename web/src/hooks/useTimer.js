import { useEffect, useMemo, useRef, useState } from 'react';
import useSessionId from './useSessionId';

// Accept totalMin (minutes) and internally convert to seconds
export default function useTimer({ quizId, totalMin, onExpire } = {}) {
	const { id: sessionId } = useSessionId();

	const timerKey = useMemo(() => `timer-${sessionId}-${Number(quizId || 1)}`, [sessionId, quizId]);

	const totalSec = useMemo(() => {
		const n = Number(totalMin);
		return Number.isFinite(n) && n > 0 ? Math.floor(n * 60) : 0;
	}, [totalMin]);

	const [remaining, setRemaining] = useState(() => {
		const saved = typeof window !== 'undefined' ? localStorage.getItem(timerKey) : null;
		const savedNum = saved !== null ? Number(saved) : NaN;
		return Number.isFinite(savedNum) && savedNum >= 0 ? savedNum : totalSec;
	});
	const [expired, setExpired] = useState(false);

	// Refresh timer when key or duration changes
	useEffect(() => {
		setExpired(false);
		setRemaining(totalSec);
	}, [timerKey, totalSec]);

	// Ticking timer in seconds
	useEffect(() => {
		if (expired) return;
		if (!Number.isFinite(remaining)) {
			setRemaining(totalSec);
			if (typeof window !== 'undefined') localStorage.setItem(timerKey, String(totalSec));
			return;
		}
		if (remaining <= 0) {
			setExpired(true);
			return; // onExpire handled in a separate effect to guarantee single call
		}
		if (typeof window !== 'undefined') localStorage.setItem(timerKey, String(remaining));
		const id = setTimeout(() => setRemaining((s) => s - 1), 1000);
		return () => clearTimeout(id);
	}, [remaining, expired, timerKey, totalSec]);

	// Call onExpire once
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

