from flask import Blueprint, jsonify, request
from ..services import content, serializers

question_bp = Blueprint('question', __name__, url_prefix='/api/question')

# READ a list of all questions
@question_bp.get('/')
def list_questions():
    rows = content.get_all_questions()
    return jsonify([serializers.question_row_to_dict(r) for r in rows])

# READ a specific question by id
@question_bp.get('/<int:question_id>')
def get_question(question_id):
    q = content.get_question_row(question_id)
    if not q:
        return jsonify({'error': 'Question not found'}), 404
    choices = content.get_choices_for_question(question_id)
    return jsonify(serializers.question_row_to_dict(q, [serializers.choice_row_to_dict(c) for c in choices]))

# CREATE a new question
@question_bp.post('/')
def create_question():
    data = request.get_json(silent=True) or {}
    quiz_id = data.get('quiz_id')
    text = data.get('text')
    q_index = data.get('q_index', 0)
    if not quiz_id or not text:
        return jsonify({'error': 'quiz_id and text required'}), 400
    q = content.create_question(quiz_id, text, q_index)
    return jsonify(serializers.question_row_to_dict(q)), 201

# UPDATE an existing question by id
@question_bp.put('/<int:question_id>')
def update_question(question_id):
    data = request.get_json(silent=True) or {}
    text = data.get('text')
    q_index = data.get('q_index')
    q = content.update_question(question_id, text=text, q_index=q_index)
    if not q:
        return jsonify({'error': 'Question not found'}), 404
    return jsonify(serializers.question_row_to_dict(q))

# DELETE a question by id
@question_bp.delete('/<int:question_id>')
def delete_question(question_id):
    deleted = content.delete_question(question_id)
    if deleted == 0:
        return jsonify({'error': 'Question not found'}), 404
    return ('', 204)
