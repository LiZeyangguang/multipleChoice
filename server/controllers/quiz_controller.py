from flask import Blueprint, jsonify, request
from ..models.quiz import Quiz
from .user_controller import admin_required
from server.db import get_conn
from server.services import content

quiz_bp = Blueprint('quiz', __name__, url_prefix='/api/quiz')

# READ a list of all quizzes
@quiz_bp.get('/')
# @admin_required
def list_quizzes():
    quizzes = Quiz.all()
    return jsonify(quizzes)


# GET amount of questions in quiz
@quiz_bp.get('/questions_number/<int:quiz_id>')
def get_questions_amount(quiz_id):
    total = content.get_question_count(quiz_id)
    return jsonify({'amount': total})

# READ a specific quiz by id
@quiz_bp.get('/<int:quiz_id>')
def get_quiz(quiz_id):
    quiz = Quiz.get(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    return jsonify(quiz)

# home page public
@quiz_bp.get('/public')
def list_public_quizzes():
    """Public route to list quizzes for all users"""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT quiz_id, title, time_limit FROM quiz ORDER BY quiz_id"
        ).fetchall()

        quizzes = []
        for r in rows:
            qcount = conn.execute(
                "SELECT COUNT(*) AS n FROM question WHERE quiz_id = ?",
                (r["quiz_id"],)
            ).fetchone()["n"]
            quizzes.append({
                "quiz_id": r["quiz_id"],
                "title": r["title"],
                "question_count": qcount,
                "time_limit": 20  # force display to 20 mins
            })

        return jsonify(quizzes)

# CREATE a new quiz
@quiz_bp.post('/')
@admin_required
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
@admin_required
def update_quiz(quiz_id):
    data = request.get_json(silent=True) or {}
    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({'error': 'title required'}), 400

    with get_conn() as conn:
        res = conn.execute(
            "UPDATE quiz SET title = ? WHERE quiz_id = ?",
            (title, quiz_id)
        )
        if res.rowcount == 0:
            return jsonify({'error': 'Not found'}), 404

        row = conn.execute(
            "SELECT quiz_id, title FROM quiz WHERE quiz_id = ?",
            (quiz_id,)
        ).fetchone()

    return jsonify({"quiz_id": row["quiz_id"], "title": row["title"]})


# DELETE a quiz by id
@quiz_bp.delete('/<int:quiz_id>')
@admin_required
def delete_quiz(quiz_id):
    if not Quiz.delete(quiz_id):
        return jsonify({'error': 'Not found'}), 404
    return ('', 204)

# import quiz from json
@quiz_bp.post('/import')
@admin_required
def import_quiz():
    """
    Expects JSON:
    {
      "title": "Python Basics",
      "questions": [
        {
          "text": "Question text",
          "choices": [
            {"text": "A", "is_correct": false},
            {"text": "B", "is_correct": true}
          ]
        }
      ]
    }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    title = data.get("title")
    questions = data.get("questions")

    if not title or not isinstance(questions, list) or not questions:
        return jsonify({"error": "Missing 'title' or non-empty 'questions' array"}), 400

    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO quiz (title, time_limit) VALUES (?, ?)", 
            (title, 20)
        )
        quiz_id = cur.lastrowid

        for idx, q in enumerate(questions, start=1):
            qtext = q.get("text")
            choices = q.get("choices") or []
            if not qtext or not choices:
                return jsonify({"error": f"Question {idx} invalid: needs 'text' and non-empty 'choices'"}), 400

            cur.execute(
                "INSERT INTO question (quiz_id, text, q_index) VALUES (?, ?, ?)",
                (quiz_id, qtext, idx)
            )
            question_id = cur.lastrowid

            has_correct = False
            for c in choices:
                ctext = c.get("text")
                is_corr = 1 if c.get("is_correct") else 0
                if not ctext:
                    return jsonify({"error": f"Choice missing 'text' (question {idx})"}), 400
                if is_corr:
                    has_correct = True
                cur.execute(
                    "INSERT INTO choice (question_id, text, is_correct) VALUES (?, ?, ?)",
                    (question_id, ctext, is_corr)
                )

            if not has_correct:
                return jsonify({"error": f"Question {idx} has no correct choice"}), 400

        # Count questions
        qcount = conn.execute(
            "SELECT COUNT(*) AS n FROM question WHERE quiz_id = ?", (quiz_id,)
        ).fetchone()["n"]

    return jsonify({
        "quiz_id": quiz_id,
        "title": title,
        "question_count": qcount,
    }), 201

