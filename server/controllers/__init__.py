
from .choice_controller import choice_bp
from .question_controller import question_bp
from .quiz_controller import quiz_bp
from .user_controller import user_bp
from .quiz_attempt_controller import quiz_attempt_bp

__all__ = [
	'choice_bp',
	'question_bp',
	'quiz_bp',
	'user_bp',
	'quiz_attempt_bp',
	'blueprints',
	'register_blueprints'
]

blueprints = [
	choice_bp,
	question_bp,
	quiz_bp,
	user_bp,
	quiz_attempt_bp,
]


def register_blueprints(app):
	for bp in blueprints:
		app.register_blueprint(bp)
