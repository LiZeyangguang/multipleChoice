from typing import List, Optional
from server.services import content, serializers

class QuizAttempt:
    @classmethod
    def all(cls) -> List[dict]:
        rows = content.get_all_attempts()
        return [serializers.attempt_row_to_dict(r) for r in rows]

    @classmethod
    def get(cls, attempt_id: int) -> Optional[dict]:
        row = content.get_attempt_row(attempt_id)
        if not row:
            return None
        return serializers.attempt_row_to_dict(row)

    @classmethod
    def create(cls, data: dict) -> Optional[dict]:
        if not data.get('user_id') or not data.get('quiz_id'):
            raise ValueError("'user_id' and 'quiz_id' are required to create a quiz attempt.")
        row = content.create_attempt(data.get('user_id'), data.get('quiz_id'), data.get('score', 0))
        if not row:
            return None
        return cls.get(row['attempt_id'])

    @classmethod
    def list_top_for_quiz(cls, quiz_id: int) -> List[dict]:
        rows = content.get_top_attempts_for_quiz(quiz_id)
        return [serializers.attempt_row_to_dict(r) for r in rows]

    @classmethod
    def update(cls, attempt_id: int, data: dict) -> Optional[dict]:
        if data.get('score') is None:
            raise ValueError("'score' is required to update a quiz attempt.")
        row = content.update_attempt(attempt_id, score=data.get('score'))
        if not row:
            return None
        return cls.get(attempt_id)

    @classmethod
    def delete(cls, attempt_id: int) -> bool:
        deleted = content.delete_attempt(attempt_id)
        return deleted > 0
