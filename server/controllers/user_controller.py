from functools import wraps
from flask import Blueprint, jsonify, request, session
from models.user import User as UserModel
import sqlite3

user_bp = Blueprint('user', __name__, url_prefix='/api/user')

def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        return fn(*args, **kwargs)
    return wrapper

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        user = UserModel.get(user_id)
        if not user or not user.get('is_admin'):
            return jsonify({'error': 'Forbidden'}), 403
        return fn(*args, **kwargs)
    return wrapper

@user_bp.get('/')
@admin_required
def list_users():
    users = UserModel.all()
    return jsonify(users)

@user_bp.get('/<int:user_id>')
def get_user_by_id(user_id):
    user = UserModel.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user)

@user_bp.post('/')
def create_user():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')
    is_admin = 1 if data.get('is_admin') else 0
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    try:
        created = UserModel.create(email, password, is_admin)
    except sqlite3.IntegrityError:
        # This means email already exists
        return jsonify({'error': 'Email already exists'}), 400
    except Exception as e:
        # Other unexpected errors
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

    return jsonify(created), 201

@user_bp.put('/<int:user_id>')
def update_user(user_id):
    data = request.get_json(silent=True) or {}
    update_data = {}
    # pass plain password to model (model will hash it)
    if 'email' in data:
        update_data['email'] = data['email']
    if 'password' in data:
        update_data['password'] = data['password']
    if 'is_admin' in data:
        update_data['is_admin'] = 1 if data['is_admin'] else 0
    updated = UserModel.update(user_id, update_data)
    if not updated:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(updated)

@user_bp.delete('/<int:user_id>')
@admin_required
def delete_user(user_id):
    ok = UserModel.delete(user_id)
    if not ok:
        return jsonify({'error': 'User not found'}), 404
    return ('', 204)

