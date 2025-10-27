# from pathlib import Path
# import sys

# # Ensure repository root is on sys.path so imports like `server.services` work
# ROOT = Path(__file__).resolve().parent.parent
# if str(ROOT) not in sys.path:
#     sys.path.insert(0, str(ROOT))

# from db import init_db
# from models.quiz import Quiz
# from models.question import Question
# from models.choice import Choice
# from models.user import User as UserModel  # New import


# def seed():
#     """Seed the database using model APIs (Quiz.create, Question.create, Choice.create).

#     This keeps seeding logic at the model layer instead of issuing raw SQL here.
#     """
#     init_db()

#     # 1. First, create Admin user and test user
#     print('Creating admin user...')
#     admin_user = UserModel.create(
#         email='admin@mail.com',
#         password='admin123',
#         is_admin=1  # Set as admin
#     )
#     if admin_user:
#         print(f'Admin user created: admin@mail.com / admin123')
#     else:
#         print('Admin user may already exist')

#     # Create a test regular user
#     test_user = UserModel.create(
#         email='user@mail.com',
#         password='user123',
#         is_admin=0  # Regular user
#     )
#     if test_user:
#         print(f'Test user created: user@mail.com / user123')
#     else:
#         print('Test user may already exist')

#     # Remove any existing quizzes so we can re-seed cleanly.
#     # Use model layer to delete by id if present; simplest is to attempt to delete quiz id 1.
#     print('Clearing existing data (attempting to delete quiz id=1 if present)...')
#     try:
#         Quiz.delete(1)
#     except Exception:
#         # If delete fails for any reason, ignore and continue — init_db ensures schema exists
#         pass
#     print('Existing data cleared (best-effort).')

#     # Create quiz via model
#     print('Creating quiz...')
#     quiz = Quiz.create({'title': 'JavaScript Basics — 20 MCQs', 'time_limit': 0})
#     if not quiz:
#         print('Failed to create quiz via model; aborting seed.')
#         return
#     quiz_id = quiz.get('quiz_id')
#     print(f'Quiz created with id={quiz_id}.')

#     qs = [
#         ('Which keyword declares a constant?', ['var', 'let', 'const', 'static'], 2),
#         ('typeof null returns…', ['"object"', '"null"', '"undefined"', '"number"'], 0),
#         ('Array.isArray([]) equals…', ['false', 'true', 'null', '0'], 1),
#         ('Which is NOT a primitive?', ['string', 'object', 'number', 'boolean'], 1),
#         ('Strict equality operator is…', ['==', '===', '!=', '!=='], 1),
#         ('Default value of uninitialized let variable?', ['null', 'undefined', 'NaN', '0'], 1),
#         ('Which creates a promise?', ['new Promise()', 'Promise()', 'createPromise()', 'await Promise'], 0),
#         ('Array push returns…', ['new array', 'length', 'last element', 'boolean'], 1),
#         ('JSON.parse("{}") gives…', ['[]', '{}', 'null', 'undefined'], 1),
#         ('DOM stands for…', ['Data Object Model', 'Document Object Model', 'Document Oriented Markup', 'Desktop Object Model'], 1),
#         ('Which loops over keys?', ['for...of', 'for', 'for...in', 'while'], 2),
#         ('Which is falsy?', ['"0"', '[]', '{}', '0'], 3),
#         ('Number.isNaN("NaN")?', ['true', 'false', 'throws', 'undefined'], 1),
#         ('Spread syntax is…', ['...', '->', '=>', '::'], 0),
#         ('Which adds to start?', ['push', 'pop', 'shift', 'unshift'], 3),
#         ('Map vs Object key types?', ['both only strings', 'Map any value', 'Object any value', 'neither'], 1),
#         ('setTimeout delay unit?', ['seconds', 'ms', 'frames', 'ticks'], 1),
#         ('Which clones array?', ['a', 'a.slice()', 'a.pop()', 'a.sort()'], 1),
#         ('const x = {a:1}; x.a=2 ?', ['error', 'ok', 'undefined', 'NaN'], 1),
#         ('Promise.all rejects when…', ['all reject', 'any rejects', 'none', 'timeout'], 1),
#     ]

#     for idx, (text, answers, correct_idx) in enumerate(qs, start=1):
#         print(f'Creating question {idx}: {text}')
#         q = Question.create({'quiz_id': quiz_id, 'text': text, 'q_index': idx,})
#         if not q:
#             print(f'Failed to create question `{text}`')
#             continue
#         qid = q.get('question_id')
#         for i, a in enumerate(answers):
#             print(f'  Creating choice for question {idx}: {a}')
#             Choice.create({'question_id': qid, 'text': a, 'is_correct': 1 if i == correct_idx else 0})

#     print(f'Seeded {len(qs)} questions.')


# if __name__ == '__main__':
#     seed()


from pathlib import Path
import sys
import json

# Ensure repository root is on sys.path so imports like `server.services` work
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from db import init_db
from models.quiz import Quiz
from models.question import Question
from models.choice import Choice
from models.user import User as UserModel


def seed():
    """Seed the database using model APIs (Quiz.create, Question.create, Choice.create).

    This keeps seeding logic at the model layer instead of issuing raw SQL here.
    """
    init_db()
    # 1. Create Admin user and test user with existence checks
    print('Creating admin user...')
    admin_email = 'admin@mail.com'
    admin_password = 'admin123'

    # Check if admin user already exists
    existing_admin = UserModel.find_by_email(admin_email)
    if existing_admin:
        print(f'Admin user already exists: {admin_email} / {admin_password}')
    else:
        admin_user = UserModel.create(
            email=admin_email,
            password=admin_password,
            is_admin=1  # Set as admin
        )
        if admin_user:
            print(f'Admin user created: {admin_email} / {admin_password}')
        else:
            print('Failed to create admin user')

    # Create a test regular user WITH EXISTENCE CHECK
    print('Creating test user...')
    test_email = 'user@mail.com'
    test_password = 'user123'

    # Check if test user already exists
    existing_test_user = UserModel.find_by_email(test_email)
    if existing_test_user:
        print(f'Test user already exists: {test_email} / {test_password}')
    else:
        test_user = UserModel.create(
            email=test_email,
            password=test_password,
            is_admin=0  # Regular user
        )
        if test_user:
            print(f'Test user created: {test_email} / {test_password}')
        else:
            print('Failed to create test user')

    # -------- Clear existing quizzes (optional: best-effort) ----
    # Remove any existing quizzes so we can re-seed cleanly.
    # Use model layer to delete by id if present; simplest is to attempt to delete quiz id 1.
    print("Clearing existing quizzes (best-effort)...")
    try:
        Quiz.delete(1)
        Quiz.delete(2)
        Quiz.delete(3)
        Quiz.delete(4)
    except Exception:
        pass

    # === 3. Seed quizzes from JSON files ===
    quiz_dir = ROOT / "QuizQuestions"
    if not quiz_dir.exists() or not quiz_dir.is_dir():
        print(f"QuizQuestions directory not found at {quiz_dir}")
        return

<<<<<<< HEAD
    json_files = list(quiz_dir.glob("*.json"))
    if not json_files:
        print("No JSON files found in QuizQuestions directory.")
        return

    # Sort files: make PracticeQuiz.json first
    json_files.sort(key=lambda f: (f.stem != "PracticeQuiz", f.stem))

    for file_path in json_files:
        quiz_title = file_path.stem  # filename without .json
        print(f"\nSeeding quiz: {quiz_title}")

        # Create quiz with 20 min time limit (1200 seconds)
        quiz = Quiz.create({
            "title": quiz_title,
            "time_limit": 20 * 60
        })
        if not quiz:
            print(f"Failed to create quiz {quiz_title}, skipping.")
=======
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
        ('DOM stands for…',
         ['Data Object Model', 'Document Object Model', 'Document Oriented Markup', 'Desktop Object Model'], 1),
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
        print(f'Creating question {idx}: {text}')
        q = Question.create({'quiz_id': quiz_id, 'text': text, 'q_index': idx, })
        if not q:
            print(f'Failed to create question `{text}`')
>>>>>>> a066ee844334d9d8cde0970d03adc626d990ae69
            continue

        quiz_id = quiz.get("quiz_id")
        print(f"Created quiz with id={quiz_id}")

        # Load questions
        with open(file_path, "r", encoding="utf-8") as f:
            questions_data = json.load(f)

        for idx, item in enumerate(questions_data, start=1):
            q_text = item.get("question")
            options = item.get("options", {})
            correct_key = item.get("answer")

            if not q_text or not options or not correct_key:
                print(f"Skipping invalid question at index {idx} in {file_path.name}")
                continue

            q = Question.create({
                "quiz_id": quiz_id,
                "text": q_text,
                "q_index": idx,
            })
            if not q:
                print(f"Failed to create question `{q_text}`")
                continue

            qid = q.get("question_id")

            for key, text in options.items():
                is_correct = 1 if key == correct_key else 0
                Choice.create({
                    "question_id": qid,
                    "text": text,
                    "is_correct": is_correct,
                })
                print(f"   → Choice added: {text} ({'correct' if is_correct else 'wrong'})")

        print(f"Finished seeding quiz: {quiz_title}, {len(questions_data)} questions added.")




if __name__ == "__main__":
    seed()
