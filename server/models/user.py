from typing import List, Optional
from werkzeug.security import generate_password_hash, check_password_hash
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
    def find_by_email(cls, email: str) -> Optional[dict]:
        row = content.get_user_row_by_email(email)
        if not row:
            return None
        # return a dict without password_hash for safety
        out = serializers.user_row_to_dict(row)
        return out

    @classmethod
    def create(cls, email: str, password: str, is_admin: int = 0) -> Optional[dict]:
        # hash the password here and delegate to content
        pw_hash = generate_password_hash(password)
        row = content.create_user(email, pw_hash, is_admin)
        if not row:
            return None
        return cls.get(row['user_id'])

    @classmethod
    def verify_password(cls, email: str, password: str) -> bool:
        row = content.get_user_row_by_email(email)
        if not row:
            return False
        return check_password_hash(row['password_hash'], password)

    @classmethod
    def update(cls, user_id: int, data: dict) -> Optional[dict]:
        # if password provided in data, hash it before passing to content
        pw_hash = None
        if 'password' in data and data.get('password'):
            pw_hash = generate_password_hash(data.get('password'))
        row = content.update_user(user_id, email=data.get('email'), password_hash=pw_hash, is_admin=data.get('is_admin'))
        if not row:
            return None
        return cls.get(user_id)

    @classmethod
    def delete(cls, user_id: int) -> bool:
        deleted = content.delete_user(user_id)
        return deleted > 0
