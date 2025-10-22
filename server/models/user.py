from typing import List, Optional
from server.services import content, serializers

class User:
    @classmethod
    def all(cls) -> List[dict]:
        rows = content.get_all_users()
        return [serializers.user_row_to_dict(r) for r in rows]

    @classmethod
    def get(cls, user_id: int) -> Optional[dict]:
        row = content.get_user_row(user_id)
        if not row:
            return None
        return serializers.user_row_to_dict(row)

    @classmethod
    def create(cls, data: dict) -> Optional[dict]:
        # content.create_user returns the inserted row; extract id and return full object via .get
        row = content.create_user(data.get('email'), data.get('password_hash'), data.get('is_admin', 0))
        if not row:
            return None
        return cls.get(row['user_id'])

    @classmethod
    def update(cls, user_id: int, data: dict) -> Optional[dict]:
        # use named params to match content.update_user signature
        row = content.update_user(user_id, email=data.get('email'), password_hash=data.get('password_hash'), is_admin=data.get('is_admin'))
        if not row:
            return None
        return cls.get(user_id)

    @classmethod
    def delete(cls, user_id: int) -> bool:
        deleted = content.delete_user(user_id)
        return deleted > 0
