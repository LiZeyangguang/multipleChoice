from ..db import get_conn


# Quiz functions
def get_all_quizzes():
    with get_conn() as conn:
        return conn.execute('SELECT quiz_id, title, time_limit FROM quiz').fetchall()

def get_quiz_row(quiz_id):
    with get_conn() as conn:
        return conn.execute('SELECT quiz_id, title, time_limit FROM quiz WHERE quiz_id=?', (quiz_id,)).fetchone()

def get_questions_for_quiz(quiz_id):
    with get_conn() as conn:
        return conn.execute('SELECT question_id, text, q_index FROM question WHERE quiz_id=? ORDER BY q_index', (quiz_id,)).fetchall()

def get_quiz_with_nested(quiz_id):
    with get_conn() as conn:
        quiz = conn.execute('SELECT quiz_id, title, time_limit FROM quiz WHERE quiz_id=?', (quiz_id,)).fetchone()
        if not quiz:
            return None
        qs = conn.execute('SELECT question_id, text, q_index FROM question WHERE quiz_id=? ORDER BY q_index', (quiz_id,)).fetchall()
        out = dict(quiz)
        out['questions'] = []
        for q in qs:
            choices = conn.execute('SELECT choice_id, text, is_correct FROM choice WHERE question_id=? ORDER BY choice_id', (q['question_id'],)).fetchall()
            out['questions'].append({
                'question_id': q['question_id'],
                'text': q['text'],
                'index': q['q_index'],
                'choices': [dict(c) for c in choices]
            })
        return out

def create_quiz(title, time_limit=0):
    with get_conn() as conn:
        cur = conn.execute('INSERT INTO quiz (title, time_limit) VALUES (?, ?)', (title, time_limit))
        qid = cur.lastrowid
        return conn.execute('SELECT quiz_id, title, time_limit FROM quiz WHERE quiz_id=?', (qid,)).fetchone()

def update_quiz(quiz_id, title=None, time_limit=None):
    with get_conn() as conn:
        conn.execute('UPDATE quiz SET title=COALESCE(?, title), time_limit=COALESCE(?, time_limit) WHERE quiz_id=?', (title, time_limit, quiz_id))
        return conn.execute('SELECT quiz_id, title, time_limit FROM quiz WHERE quiz_id=?', (quiz_id,)).fetchone()

def delete_quiz(quiz_id):
    with get_conn() as conn:
        cur = conn.execute('DELETE FROM quiz WHERE quiz_id=?', (quiz_id,))
        return cur.rowcount
    
    
# Question functions
def get_choices_for_question(question_id):
    with get_conn() as conn:
        return conn.execute('SELECT choice_id, text, is_correct FROM choice WHERE question_id=? ORDER BY choice_id', (question_id,)).fetchall()
    
def get_all_questions():
    with get_conn() as conn:
        return conn.execute('SELECT question_id, quiz_id, text, q_index FROM question ORDER BY quiz_id, q_index').fetchall()

def get_question_row(question_id):
    with get_conn() as conn:
        return conn.execute('SELECT question_id, quiz_id, text, q_index FROM question WHERE question_id=?', (question_id,)).fetchone()

def create_question(quiz_id, text, q_index=0):
    with get_conn() as conn:
        cur = conn.execute('INSERT INTO question (quiz_id, text, q_index) VALUES (?, ?, ?)', (quiz_id, text, q_index))
        qid = cur.lastrowid
        return conn.execute('SELECT question_id, quiz_id, text, q_index FROM question WHERE question_id=?', (qid,)).fetchone()

def update_question(question_id, text=None, q_index=None):
    with get_conn() as conn:
        conn.execute('UPDATE question SET text=COALESCE(?, text), q_index=COALESCE(?, q_index) WHERE question_id=?', (text, q_index, question_id))
        return conn.execute('SELECT question_id, quiz_id, text, q_index FROM question WHERE question_id=?', (question_id,)).fetchone()

def delete_question(question_id):
    with get_conn() as conn:
        cur = conn.execute('DELETE FROM question WHERE question_id=?', (question_id,))
        return cur.rowcount


# Choice functions
def get_all_choices():
    with get_conn() as conn:
        return conn.execute('SELECT choice_id, question_id, text, is_correct FROM choice ORDER BY question_id, choice_id').fetchall()

def get_choice_row(choice_id):
    with get_conn() as conn:
        return conn.execute('SELECT choice_id, question_id, text, is_correct FROM choice WHERE choice_id=?', (choice_id,)).fetchone()

def create_choice(question_id, text, is_correct=0):
    with get_conn() as conn:
        cur = conn.execute('INSERT INTO choice (question_id, text, is_correct) VALUES (?, ?, ?)', (question_id, text, is_correct))
        cid = cur.lastrowid
        return conn.execute('SELECT choice_id, question_id, text, is_correct FROM choice WHERE choice_id=?', (cid,)).fetchone()

def update_choice(choice_id, text=None, is_correct=None):
    with get_conn() as conn:
        conn.execute('UPDATE choice SET text=COALESCE(?, text), is_correct=COALESCE(?, is_correct) WHERE choice_id=?', (text, is_correct, choice_id))
        return conn.execute('SELECT choice_id, question_id, text, is_correct FROM choice WHERE choice_id=?', (choice_id,)).fetchone()

def delete_choice(choice_id):
    with get_conn() as conn:
        cur = conn.execute('DELETE FROM choice WHERE choice_id=?', (choice_id,))
        return cur.rowcount


# User functions
def get_all_users():
    with get_conn() as conn:
        return conn.execute('SELECT user_id, email, is_admin FROM user').fetchall()

def get_user_row(user_id):
    with get_conn() as conn:
        return conn.execute('SELECT user_id, email, is_admin FROM user WHERE user_id=?', (user_id,)).fetchone()

def create_user(email, password_hash, is_admin=0):
    with get_conn() as conn:
        cur = conn.execute('INSERT INTO user (email, password_hash, is_admin) VALUES (?, ?, ?)', (email, password_hash, is_admin))
        uid = cur.lastrowid
        return conn.execute('SELECT user_id, email, is_admin FROM user WHERE user_id=?', (uid,)).fetchone()

def update_user(user_id, email=None, password_hash=None, is_admin=None):
    with get_conn() as conn:
        conn.execute('UPDATE user SET email=COALESCE(?, email), password_hash=COALESCE(?, password_hash), is_admin=COALESCE(?, is_admin) WHERE user_id=?', (email, password_hash, is_admin, user_id))
        return conn.execute('SELECT user_id, email, is_admin FROM user WHERE user_id=?', (user_id,)).fetchone()

def delete_user(user_id):
    with get_conn() as conn:
        cur = conn.execute('DELETE FROM user WHERE user_id=?', (user_id,))
        return cur.rowcount


# Quiz Attempt functions
def get_all_attempts():
    with get_conn() as conn:
        return conn.execute('SELECT attempt_id, user_id, quiz_id, score FROM quiz_attempt').fetchall()

def get_attempt_row(attempt_id):
    with get_conn() as conn:
        return conn.execute('SELECT attempt_id, user_id, quiz_id, score FROM quiz_attempt WHERE attempt_id=?', (attempt_id,)).fetchone()

def create_attempt(user_id, quiz_id, score=0):
    with get_conn() as conn:
        cur = conn.execute('INSERT INTO quiz_attempt (user_id, quiz_id, score) VALUES (?, ?, ?)', (user_id, quiz_id, score))
        aid = cur.lastrowid
        return conn.execute('SELECT attempt_id, user_id, quiz_id, score FROM quiz_attempt WHERE attempt_id=?', (aid,)).fetchone()

def update_attempt(attempt_id, score=None):
    with get_conn() as conn:
        conn.execute('UPDATE quiz_attempt SET score=COALESCE(?, score) WHERE attempt_id=?', (score, attempt_id))
        return conn.execute('SELECT attempt_id, user_id, quiz_id, score FROM quiz_attempt WHERE attempt_id=?', (attempt_id,)).fetchone()

def delete_attempt(attempt_id):
    with get_conn() as conn:
        cur = conn.execute('DELETE FROM quiz_attempt WHERE attempt_id=?', (attempt_id,))
        return cur.rowcount
