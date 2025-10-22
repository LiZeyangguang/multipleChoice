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
