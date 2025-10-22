from flask import Blueprint, jsonify, request
from server.services import content

responses_bp = Blueprint('responses', __name__, url_prefix='/api')

# For simplicity this app stores transient session responses in-memory.
# In a production app you'd persist these to a DB. We'll keep a module-level
# dict keyed by sessionId mapping question_id -> choice_id
_sessions = {}


@responses_bp.get('/responses/<session_id>')
def get_responses(session_id):
    data = _sessions.get(session_id, {})
    # normalize keys to strings
    return jsonify({str(k): v for k, v in data.items()})


@responses_bp.put('/responses/<session_id>/<int:question_id>')
def save_response(session_id, question_id):
    body = request.get_json(silent=True) or {}
    choice_id = body.get('choiceId') or body.get('choice_id') or body.get('choice')
    if choice_id is None:
        return jsonify({'error': 'choiceId required'}), 400
    sess = _sessions.setdefault(session_id, {})
    sess[str(question_id)] = choice_id
    return ('', 204)


@responses_bp.delete('/responses/<session_id>/<int:question_id>')
def clear_response(session_id, question_id):
    sess = _sessions.get(session_id, {})
    sess.pop(str(question_id), None)
    return ('', 204)


@responses_bp.delete('/responses/<session_id>')
def clear_all(session_id):
    _sessions.pop(session_id, None)
    return ('', 204)


@responses_bp.get('/answers')
def get_answers():
    # Return the canonical answers for quizzes: map of question_id -> correct choice id
    # We'll pull choices and questions from content service
    out = {}
    # naive approach: iterate questions and find correct choice
    qs = content.get_all_questions()
    for q in qs:
        qid = q['question_id']
        choices = content.get_choices_for_question(qid)
        for c in choices:
            if c['is_correct']:
                out[str(qid)] = c['choice_id']
                break
    return jsonify(out)


@responses_bp.get('/score/<session_id>')
def get_score(session_id):
    # Compare session answers to correct answers
    sess = _sessions.get(session_id, {})
    answers = get_answers().get_json()
    total = len(answers)
    correct = 0
    for qid_str, correct_choice in answers.items():
        chosen = sess.get(qid_str)
        if chosen is not None and str(chosen) == str(correct_choice):
            correct += 1
    return jsonify({'score': correct, 'total': total})
