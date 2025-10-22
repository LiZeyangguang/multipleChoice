from flask import Blueprint, jsonify, request
from models.question import Question

question_bp = Blueprint('question', __name__, url_prefix='/api/question')

# READ a list of all questions
@question_bp.get('/')
def list_questions():
    questions = Question.all()
    return jsonify(questions)

# READ a specific question by id
@question_bp.get('/<int:question_id>')
def get_question(question_id):
    question = Question.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    return jsonify(question)

# CREATE a new question
@question_bp.post('/')
def create_question():
    data = request.get_json(silent=True) or {}
    if not data.get('quiz_id') or not data.get('text'):
        return jsonify({'error': 'quiz_id and text required'}), 400
    question = Question.create(data)
    if not question:
        return jsonify({'error': 'Failed to create question'}), 500
    return jsonify(question), 201

# UPDATE an existing question by id
@question_bp.put('/<int:question_id>')
def update_question(question_id):
    data = request.get_json(silent=True) or {}
    question = Question.update(question_id, data)
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    return jsonify(question)

# DELETE a question by id
@question_bp.delete('/<int:question_id>')
def delete_question(question_id):
    if not Question.delete(question_id):
        return jsonify({'error': 'Question not found'}), 404
    return ('', 204)
