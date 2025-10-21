import { nanoid } from 'nanoid';
export function useSessionId() {
const key = 'quiz-session-id';
let id = localStorage.getItem(key);
if (!id) {
id = nanoid(12);
localStorage.setItem(key, id);
}
return id;
}