import sqlite3
from contextlib import contextmanager
from pathlib import Path


DB_PATH = Path(__file__).parent / 'data.sqlite'


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


‎server/controllers/quiz_attempt_controller.py‎
+48Lines changed: 48 additions & 0 deletions
Original file line number	Original file line	Diff line number	Diff line change
@@ -0,0 +1,48 @@
from flask import Blueprint, jsonify, request
from ..services import content, serializers
quiz_attempt_bp = Blueprint('quiz_attempt', __name__, url_prefix='/api/quiz_attempt')
# READ a list of all quiz attempts
@quiz_attempt_bp.get('/')
def list_attempts():
    rows = content.get_all_attempts()
    return jsonify([serializers.attempt_row_to_dict(r) for r in rows])
# READ a specific quiz attempt by id
@quiz_attempt_bp.get('/<int:attempt_id>')
def get_attempt(attempt_id):
    row = content.get_attempt_row(attempt_id)
    if not row:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(serializers.attempt_row_to_dict(row))
# CREATE a new quiz attempt
@quiz_attempt_bp.post('/')
def create_attempt():
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id')
    quiz_id = data.get('quiz_id')
    score = data.get('score', 0)
    if user_id is None or quiz_id is None:
        return jsonify({'error': 'user_id and quiz_id required'}), 400
    row = content.create_attempt(user_id, quiz_id, score)
    return jsonify(serializers.attempt_row_to_dict(row)), 201
# UPDATE an existing quiz attempt by id
@quiz_attempt_bp.put('/<int:attempt_id>')
def update_attempt(attempt_id):
    data = request.get_json(silent=True) or {}
    score = data.get('score')
    row = content.update_attempt(attempt_id, score=score)
    if not row:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(serializers.attempt_row_to_dict(row))
# DELETE a quiz attempt by id
@quiz_attempt_bp.delete('/<int:attempt_id>')
def delete_attempt(attempt_id):
    deleted = content.delete_attempt(attempt_id)
    if deleted == 0:
        return jsonify({'error': 'Not found'}), 404
    return ('', 204)
‎server/controllers/quiz_controller.py‎
+54Lines changed: 54 additions & 0 deletions
Original file line number	Original file line	Diff line number	Diff line change
@@ -0,0 +1,54 @@
from flask import Blueprint, jsonify, request
from ..services import content, serializers
quiz_bp = Blueprint('quiz', __name__, url_prefix='/api/quiz')
# READ a list of all quizzes
@quiz_bp.get('/')
def list_quizzes():
    rows = content.get_all_quizzes()
    return jsonify([serializers.quiz_row_to_dict(r) for r in rows])
# READ a specific quiz by id
@quiz_bp.get('/<int:quiz_id>')
def get_quiz(quiz_id):
    payload = content.get_quiz_with_nested(quiz_id)
    if not payload:
        return jsonify({'error': 'Quiz not found'}), 404
    # normalize nested shapes using serializers
    questions = []
    for q in payload.get('questions', []):
        choices = [serializers.choice_row_to_dict(c) for c in q.get('choices', [])]
        questions.append(serializers.question_row_to_dict({'question_id': q['question_id'], 'text': q['text'], 'q_index': q.get('index', q.get('q_index'))}, choices))
    out = serializers.quiz_row_to_dict({'quiz_id': payload['quiz_id'], 'title': payload['title'], 'time_limit': payload.get('time_limit')}, questions)
    return jsonify(out)
# CREATE a new quiz
@quiz_bp.post('/')
def create_quiz():
    data = request.get_json(silent=True) or {}
    title = data.get('title')
    time_limit = data.get('time_limit', 0)
    if not title:
        return jsonify({'error': 'title required'}), 400
    row = content.create_quiz(title, time_limit)
    return jsonify(serializers.quiz_row_to_dict(row)), 201
# UPDATE an existing quiz by id
@quiz_bp.put('/<int:quiz_id>')
def update_quiz(quiz_id):
    data = request.get_json(silent=True) or {}
    title = data.get('title')
    time_limit = data.get('time_limit')
    row = content.update_quiz(quiz_id, title=title, time_limit=time_limit)
    if not row:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(serializers.quiz_row_to_dict(row))
# DELETE a quiz by id
@quiz_bp.delete('/<int:quiz_id>')
def delete_quiz(quiz_id):
    deleted = content.delete_quiz(quiz_id)
    if deleted == 0:
        return jsonify({'error': 'Not found'}), 404
    return ('', 204)
‎server/controllers/user_controller.py‎
+62Lines changed: 62 additions & 0 deletions
Original file line number	Original file line	Diff line number	Diff line change
@@ -0,0 +1,62 @@
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



SCHEMA = """
CREATE TABLE IF NOT EXISTS quiz (
    quiz_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    time_limit INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS question (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL REFERENCES quiz(quiz_id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    q_index INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS choice (
    choice_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INT NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOL NOT NULL
);
CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(50) NOT NULL,
    is_admin BOOL NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS quiz_attempt (
    attempt_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES user(user_id) ON DELETE CASCADE,
    quiz_id INTEGER NOT NULL REFERENCES quiz(quiz_id) ON DELETE CASCADE,
    score INTEGER NOT NULL
"""


def init_db():
    with get_conn() as conn:
        conn.executescript(SCHEMA)