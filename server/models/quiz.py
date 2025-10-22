from typing import List, Optional
from server.services import content, serializers

class Quiz:
    @classmethod
    def all(cls) -> List[dict]:
        rows = content.get_all_quizzes()
        return [serializers.quiz_row_to_dict(r) for r in rows]

    @classmethod
    def get(cls, quiz_id: int) -> Optional[dict]:
        nested = content.get_quiz_with_nested(quiz_id)
        if not nested:
            return None
        # nested is already a dict produced by content.get_quiz_with_nested
        # ensure serializer shapes values
        nested['questions'] = [serializers.question_row_to_dict(q) for q in nested.get('questions', [])]
        for q in nested['questions']:
            q['choices'] = [serializers.choice_row_to_dict(c) for c in q.get('choices', [])]
        return nested

    @classmethod
    def create(cls, data: dict) -> Optional[dict]:
        if not data.get('title'):
            raise ValueError("'title' is required to create a quiz.")
        row = content.create_quiz(data.get('title'), data.get('time_limit', 0))
        if not row:
            return None
        return cls.get(row['quiz_id'])

    @classmethod
    def update(cls, quiz_id: int, data: dict) -> Optional[dict]:
        if not data.get('title'):
            raise ValueError("'title' is required to update a quiz.")
        row = content.update_quiz(quiz_id, title=data.get('title'), time_limit=data.get('time_limit'))
        if not row:
            return None
        return cls.get(quiz_id)

    @classmethod
    def delete(cls, quiz_id: int) -> bool:
        deleted = content.delete_quiz(quiz_id)
        return deleted > 0
