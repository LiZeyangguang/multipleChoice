from flask import Blueprint, jsonify, request
from ..models.quiz_attempt import QuizAttempt

quiz_attempt_bp = Blueprint('quiz_attempt', __name__, url_prefix='/api/quiz_attempt')

# READ a list of all quiz attempts
@quiz_attempt_bp.get('/')
def list_attempts():
    attempts = QuizAttempt.all()
    return jsonify(attempts)

# READ a specific quiz attempt by id
@quiz_attempt_bp.get('/<int:attempt_id>')
def get_attempt(attempt_id):
    attempt = QuizAttempt.get(attempt_id)
    if not attempt:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(attempt)

# CREATE a new quiz attempt
@quiz_attempt_bp.post('/')
def create_attempt():
    data = request.get_json(silent=True) or {}
    if not data.get('user_id') or not data.get('quiz_id'):
        return jsonify({'error': 'user_id and quiz_id required'}), 400
    attempt = QuizAttempt.create(data)
    if not attempt:
        return jsonify({'error': 'Failed to create attempt'}), 500
    return jsonify(attempt), 201

# Latest attempt per user for a quiz
@quiz_attempt_bp.get('/quiz/<int:quiz_id>/top_by_user')
def top_attempts_by_user(quiz_id):
    attempts = QuizAttempt.list_top_for_quiz(quiz_id)
    return jsonify(attempts)

# UPDATE an existing quiz attempt by id
@quiz_attempt_bp.put('/<int:attempt_id>')
def update_attempt(attempt_id):
    data = request.get_json(silent=True) or {}
    attempt = QuizAttempt.update(attempt_id, data)
    if not attempt:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(attempt)

# DELETE a quiz attempt by id
@quiz_attempt_bp.delete('/<int:attempt_id>')
def delete_attempt(attempt_id):
    if not QuizAttempt.delete(attempt_id):
        return jsonify({'error': 'Not found'}), 404
    return ('', 204)
