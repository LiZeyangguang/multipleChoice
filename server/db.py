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
    id INTEGER PRIMARY KEY CHECK (id=1),
    title TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS question (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    q_index INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS choice (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS response (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    question_id INTEGER NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    choice_id INTEGER NULL REFERENCES choice(id) ON DELETE SET NULL,
    UNIQUE(session_id, question_id)
);
"""


def init_db():
    with get_conn() as conn:
        conn.executescript(SCHEMA)