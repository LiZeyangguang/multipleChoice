export default function useSessionId(key = 'quiz-session-id') {
  function get() {
    let id = localStorage.getItem(key);
    if (!id) {
      id = Math.random().toString(36).slice(2, 14);
      localStorage.setItem(key, id);
    }
    return id;
  }
  return { id: get() };
}