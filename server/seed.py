from db import get_conn, init_db


def seed():
    init_db()
    with get_conn() as conn:
        # Clear existing data
        print('Clearing existing data...')
        conn.execute('DELETE FROM choice')
        conn.execute('DELETE FROM question')
        conn.execute('DELETE FROM quiz')
        print('Existing data cleared.')

        # Insert quiz data
        print('Inserting quiz...')
        # provide time_limit (required by schema) when inserting
        conn.execute('INSERT OR REPLACE INTO quiz (quiz_id, title, time_limit) VALUES (?, ?, ?)', (
            1, 'JavaScript Basics — 20 MCQs', 0,
        ))
        print('Quiz inserted.')

        # Insert questions and choices
        qs = [
            ('Which keyword declares a constant?', ['var', 'let', 'const', 'static'], 2),
            ('typeof null returns…', ['"object"', '"null"', '"undefined"', '"number"'], 0),
            ('Array.isArray([]) equals…', ['false', 'true', 'null', '0'], 1),
            ('Which is NOT a primitive?', ['string', 'object', 'number', 'boolean'], 1),
            ('Strict equality operator is…', ['==', '===', '!=', '!=='], 1),
            ('Default value of uninitialized let variable?', ['null', 'undefined', 'NaN', '0'], 1),
            ('Which creates a promise?', ['new Promise()', 'Promise()', 'createPromise()', 'await Promise'], 0),
            ('Array push returns…', ['new array', 'length', 'last element', 'boolean'], 1),
            ('JSON.parse("{}") gives…', ['[]', '{}', 'null', 'undefined'], 1),
            ('DOM stands for…', ['Data Object Model', 'Document Object Model', 'Document Oriented Markup', 'Desktop Object Model'], 1),
            ('Which loops over keys?', ['for...of', 'for', 'for...in', 'while'], 2),
            ('Which is falsy?', ['"0"', '[]', '{}', '0'], 3),
            ('Number.isNaN("NaN")?', ['true', 'false', 'throws', 'undefined'], 1),
            ('Spread syntax is…', ['...', '->', '=>', '::'], 0),
            ('Which adds to start?', ['push', 'pop', 'shift', 'unshift'], 3),
            ('Map vs Object key types?', ['both only strings', 'Map any value', 'Object any value', 'neither'], 1),
            ('setTimeout delay unit?', ['seconds', 'ms', 'frames', 'ticks'], 1),
            ('Which clones array?', ['a', 'a.slice()', 'a.pop()', 'a.sort()'], 1),
            ('const x = {a:1}; x.a=2 ?', ['error', 'ok', 'undefined', 'NaN'], 1),
            ('Promise.all rejects when…', ['all reject', 'any rejects', 'none', 'timeout'], 1),
        ]

        for idx, (text, answers, correct_idx) in enumerate(qs, start=1):
            print(f'Inserting question {idx}: {text}')
            cur = conn.execute('INSERT INTO question (quiz_id, text, q_index) VALUES (?, ?, ?)', (1, text, idx))
            qid = cur.lastrowid
            for i, a in enumerate(answers):
                print(f'Inserting choice for question {idx}: {a}')
                conn.execute('INSERT INTO choice (question_id, text, is_correct) VALUES (?, ?, ?)', (qid, a, 1 if i == correct_idx else 0))

        print('Seeded 20 questions.')


if __name__ == '__main__':
    seed()