from flask import Blueprint, jsonify, request
from ..models.quiz import Quiz

quiz_bp = Blueprint('quiz', __name__, url_prefix='/api/quiz')

# READ a list of all quizzes
@quiz_bp.get('/')
def list_quizzes():
    quizzes = Quiz.all()
    return jsonify(quizzes)

# READ a specific quiz by id
@quiz_bp.get('/<int:quiz_id>')
def get_quiz(quiz_id):
    quiz = Quiz.get(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    return jsonify(quiz)

# CREATE a new quiz
@quiz_bp.post('/')
def create_quiz():
    data = request.get_json(silent=True) or {}
    if not data.get('title'):
        return jsonify({'error': 'title required'}), 400
    quiz = Quiz.create(data)
    if not quiz:
        return jsonify({'error': 'Failed to create quiz'}), 500
    return jsonify(quiz), 201

# UPDATE an existing quiz by id
@quiz_bp.put('/<int:quiz_id>')
def update_quiz(quiz_id):
    data = request.get_json(silent=True) or {}
    quiz = Quiz.update(quiz_id, data)
    if not quiz:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(quiz)

# DELETE a quiz by id
@quiz_bp.delete('/<int:quiz_id>')
def delete_quiz(quiz_id):
    if not Quiz.delete(quiz_id):
        return jsonify({'error': 'Not found'}), 404
    return ('', 204)
