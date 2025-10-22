from typing import List, Optional
from server.services import content, serializers

class Question:
    @classmethod
    def all(cls) -> List[dict]:
        rows = content.get_all_questions()
        return [serializers.question_row_to_dict(r) for r in rows]

    @classmethod
    def get(cls, question_id: int) -> Optional[dict]:
        row = content.get_question_row(question_id)
        if not row:
            return None
        q = serializers.question_row_to_dict(row)
        choices = content.get_choices_for_question(question_id)
        q['choices'] = [serializers.choice_row_to_dict(c) for c in choices]
        return q

    @classmethod
    def create(cls, data: dict) -> Optional[dict]:
        if not data.get('quiz_id') or not data.get('text'):
            raise ValueError("'quiz_id' and 'text' are required to create a question.")
        row = content.create_question(data.get('quiz_id'), data.get('text'), data.get('q_index', 0))
        if not row:
            return None
        return cls.get(row['question_id'])

    @classmethod
    def update(cls, question_id: int, data: dict) -> Optional[dict]:
        if not data.get('text'):
            raise ValueError("'text' is required to update a question.")
        row = content.update_question(question_id, text=data.get('text'), q_index=data.get('q_index'))
        if not row:
            return None
        return cls.get(question_id)

    @classmethod
    def delete(cls, question_id: int) -> bool:
        deleted = content.delete_question(question_id)
        return deleted > 0
