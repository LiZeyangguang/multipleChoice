from flask import Blueprint, jsonify, request
from ..models.choice import Choice

choice_bp = Blueprint('choice', __name__, url_prefix='/api/choice')

# READ a list of all choices
@choice_bp.get('/')
def list_choices():
    choices = Choice.all()
    return jsonify(choices)

# READ a specific choice by id
@choice_bp.get('/<int:choice_id>')
def get_choice(choice_id):
    choice = Choice.get(choice_id)
    if not choice:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(choice)

# CREATE a new choice
@choice_bp.post('/')
def create_choice():
    data = request.get_json(silent=True) or {}
    if not data.get('question_id') or not data.get('text'):
        return jsonify({'error': 'question_id and text required'}), 400
    choice = Choice.create(data)
    if not choice:
        return jsonify({'error': 'Failed to create choice'}), 500
    return jsonify(choice), 201

# UPDATE an existing choice by id
@choice_bp.put('/<int:choice_id>')
def update_choice(choice_id):
    data = request.get_json(silent=True) or {}
    choice = Choice.update(choice_id, data)
    if not choice:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(choice)

# DELETE a choice by id
@choice_bp.delete('/<int:choice_id>')
def delete_choice(choice_id):
    if not Choice.delete(choice_id):
        return jsonify({'error': 'Not found'}), 404
    return ('', 204)
