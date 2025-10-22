import sqlite3
from contextlib import contextmanager
from pathlib import Path


DB_PATH = Path(__file__).parent / 'data.sqlite'


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

SCHEMA = """
CREATE TABLE IF NOT EXISTS quiz (
    quiz_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    time_limit INTEGER NOT NULL DEFAULT 60
);
CREATE TABLE IF NOT EXISTS question (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL REFERENCES quiz(quiz_id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    q_index INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS choice (
    choice_id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INT NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOL NOT NULL
);
CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(50) NOT NULL,
    is_admin BOOL NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS quiz_attempt (
    attempt_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES user(user_id) ON DELETE CASCADE,
    quiz_id INTEGER NOT NULL REFERENCES quiz(quiz_id) ON DELETE CASCADE,
    score INTEGER NOT NULL
);"""


def init_db():
    with get_conn() as conn:
        conn.executescript(SCHEMA)