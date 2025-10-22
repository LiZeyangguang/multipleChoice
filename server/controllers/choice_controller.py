from flask import Blueprint, jsonify, request
from ..services import content, serializers

choice_bp = Blueprint('choice', __name__, url_prefix='/api/choice')

# READ a list of all choices
@choice_bp.get('/')
def list_choices():
    rows = content.get_all_choices()
    return jsonify([serializers.choice_row_to_dict(r) for r in rows])

# READ a specific choice by id
@choice_bp.get('/<int:choice_id>')
def get_choice(choice_id):
    c = content.get_choice_row(choice_id)
    if not c:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(serializers.choice_row_to_dict(c))

# CREATE a new choice
@choice_bp.post('/')
def create_choice():
    data = request.get_json(silent=True) or {}
    question_id = data.get('question_id')
    text = data.get('text')
    is_correct = 1 if data.get('is_correct') else 0
    if not question_id or not text:
        return jsonify({'error': 'question_id and text required'}), 400
    c = content.create_choice(question_id, text, is_correct)
    return jsonify(serializers.choice_row_to_dict(c)), 201

# UPDATE an existing choice by id
@choice_bp.put('/<int:choice_id>')
def update_choice(choice_id):
    data = request.get_json(silent=True) or {}
    text = data.get('text')
    is_correct = data.get('is_correct')
    c = content.update_choice(choice_id, text=text, is_correct=is_correct)
    if not c:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(serializers.choice_row_to_dict(c))

# DELETE a choice by id
@choice_bp.delete('/<int:choice_id>')
def delete_choice(choice_id):
    deleted = content.delete_choice(choice_id)
    if deleted == 0:
        return jsonify({'error': 'Not found'}), 404
    return ('', 204)
