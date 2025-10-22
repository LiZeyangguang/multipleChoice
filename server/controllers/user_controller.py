from flask import Blueprint, jsonify, request
from ..services import content, serializers
import hashlib

user_bp = Blueprint('user', __name__, url_prefix='/api/user')


# utility to hash passwords
def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode('utf-8')).hexdigest()

# READ a list of all users
@user_bp.get('/')
def list_users():
    rows = content.get_all_users()
    return jsonify([serializers.user_row_to_dict(r) for r in rows])

# READ a specific user by id
@user_bp.get('/<int:user_id>')
def get_user_by_id(user_id):
    u = content.get_user_row(user_id)
    if not u:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(serializers.user_row_to_dict(u))

# CREATE a new user
@user_bp.post('/')
def create_user():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')
    is_admin = 1 if data.get('is_admin') else 0
    if not email or not password:
        return jsonify({'error': 'email and password required'}), 400
    pw_hash = hash_password(password)
    try:
        u = content.create_user(email, pw_hash, is_admin)
    except Exception:
        return jsonify({'error': 'email already exists'}), 400
    return jsonify(serializers.user_row_to_dict(u)), 201

# UPDATE an existing user by id
@user_bp.put('/<int:user_id>')
def update_user(user_id):
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')
    is_admin = data.get('is_admin')
    pw_hash = hash_password(password) if password else None
    u = content.update_user(user_id, email=email, password_hash=pw_hash, is_admin=is_admin)
    if not u:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(serializers.user_row_to_dict(u))

# DELETE a user by id
@user_bp.delete('/<int:user_id>')
def delete_user(user_id):
    deleted = content.delete_user(user_id)
    if deleted == 0:
        return jsonify({'error': 'User not found'}), 404
    return ('', 204)

