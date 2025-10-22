from flask import Flask, jsonify, request, session, redirect, url_for, render_template, abort
from flask_cors import CORS
from db import get_conn, init_db
import sqlite3

from werkzeug.security import generate_password_hash, check_password_hash

from functools import wraps

app = Flask(__name__)
CORS(app)
init_db()


#-----------------------------------------------------------------------------------------------------------------------------------------
app.secret_key = 'your-super-secret-key'

# --- Routes ---
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        password_hash = generate_password_hash(password)

        try:
            with get_conn() as conn:
                conn.execute(
                    "INSERT INTO Users (email, password_hash) VALUES (?, ?)",
                    (email, password_hash)
                )
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            # Likely cause: duplicate email (due to UNIQUE constraint)
            return "Email already registered. Try logging in or use a different email.", 400

    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        with get_conn() as conn:
            cursor = conn.execute("SELECT user_id, email, password_hash, is_admin FROM Users WHERE email = ?", (email,))
            user = cursor.fetchone()
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['user_id']
            session['email'] = user['email']
            session['is_admin'] = bool(user['is_admin'])
            return redirect(url_for('main_page'))
        else:
            return "Invalid credentials", 401
    return render_template('login.html')


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id') or not session.get('is_admin'):
            abort(403)  # Forbidden
        return f(*args, **kwargs)
    return decorated_function

@app.route('/admin')
@admin_required
def admin_dashboard():
    return "Welcome, Admin!"
# -------------------------------------------------------------------------------------------------------------------------------------

@app.get('/api/quiz')
def get_quiz():
    with get_conn() as conn:
        quiz = conn.execute('SELECT id, title FROM quiz WHERE id=1').fetchone()
        qs = conn.execute('SELECT id, text, q_index FROM question WHERE quiz_id=1 ORDER BY q_index ASC').fetchall()
        def choices_for(qid):
            return [dict(id=row['id'], text=row['text']) for row in conn.execute('SELECT id, text FROM choice WHERE question_id=? ORDER BY id ASC', (qid,))]
        payload = {
            'id': quiz['id'],
            'title': quiz['title'],
            'questions': [
                {
                    'id': q['id'],
                    'text': q['text'],
                    'index': q['q_index'],
                    'choices': choices_for(q['id'])
                }
                for q in qs
            ]
        }
        return jsonify(payload)


@app.get('/api/responses/<session_id>')
def get_responses(session_id):
    with get_conn() as conn:
        rows = conn.execute('SELECT question_id, choice_id FROM response WHERE session_id=?', (session_id,)).fetchall()
        out = {str(r['question_id']): r['choice_id'] for r in rows}
        return jsonify(out)


@app.put('/api/responses/<session_id>/<int:question_id>')
def save_response(session_id, question_id):
    data = request.get_json(silent=True) or {}
    choice_id = data.get('choiceId')
    if not choice_id:
        return jsonify({'error': 'choiceId required'}), 400
    with get_conn() as conn:
        conn.execute(
            'INSERT INTO response (session_id, question_id, choice_id) VALUES (?, ?, ?) ON CONFLICT(session_id, question_id) DO UPDATE SET choice_id=excluded.choice_id',
            (session_id, question_id, choice_id)
        )
    return jsonify({'ok': True})


@app.delete('/api/responses/<session_id>/<int:question_id>')
def clear_response(session_id, question_id):
    with get_conn() as conn:
        conn.execute('DELETE FROM response WHERE session_id=? AND question_id=?', (session_id, question_id))
    return ('', 204)


@app.get('/api/score/<session_id>')
def get_score(session_id):
    with get_conn() as conn:
        rows = conn.execute(
            'SELECT r.question_id, r.choice_id, c.is_correct FROM response r JOIN choice c ON c.id=r.choice_id WHERE r.session_id=?',
            (session_id,)
        ).fetchall()
        score = sum(1 for r in rows if r['is_correct'])
        total = conn.execute('SELECT COUNT(*) AS c FROM question WHERE quiz_id=1').fetchone()['c']
        return jsonify({'total': total, 'score': score})

@app.delete('/api/responses/<session_id>')
def clear_all_responses(session_id):
    with get_conn() as conn:
        conn.execute('DELETE FROM response WHERE session_id=?', (session_id,))
    return ('', 204)

@app.get('/api/answers')
def get_answers():
    with get_conn() as conn:
        rows = conn.execute("""
            SELECT q.id AS question_id, c.id AS correct_choice_id
            FROM question q
            JOIN choice c ON c.question_id = q.id AND c.is_correct = 1
            WHERE q.quiz_id = 1
            ORDER BY q.q_index ASC
        """).fetchall()
        result = {str(r['question_id']): r['correct_choice_id'] for r in rows}
        return jsonify(result)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)