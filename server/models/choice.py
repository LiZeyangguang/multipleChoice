from typing import List, Optional
from server.services import content, serializers

class Choice:
    @classmethod
    def all(cls) -> List[dict]:
        rows = content.get_all_choices()
        return [serializers.choice_row_to_dict(r) for r in rows]

    @classmethod
    def get(cls, choice_id: int) -> Optional[dict]:
        row = content.get_choice_row(choice_id)
        if not row:
            return None
        return serializers.choice_row_to_dict(row)

    @classmethod
    def create(cls, data: dict) -> Optional[dict]:
        if not data.get('question_id') or not data.get('text'):
            raise ValueError("'question_id' and 'text' are required to create a choice.")
        row = content.create_choice(data.get('question_id'), data.get('text'), data.get('is_correct', 0))
        if not row:
            return None
        return cls.get(row['choice_id'])

    @classmethod
    def update(cls, choice_id: int, data: dict) -> Optional[dict]:
        if not data.get('text'):
            raise ValueError("'text' is required to update a choice.")
        row = content.update_choice(choice_id, text=data.get('text'), is_correct=data.get('is_correct'))
        if not row:
            return None
        return cls.get(choice_id)

    @classmethod
    def delete(cls, choice_id: int) -> bool:
        deleted = content.delete_choice(choice_id)
        return deleted > 0
