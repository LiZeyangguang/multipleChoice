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
