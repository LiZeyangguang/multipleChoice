import sys
from pathlib import Path

# Ensure the parent directory of `server` is in the Python path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from flask import Flask
from flask_cors import CORS
from server.db import init_db

# Import blueprints
from server.controllers.choice_controller import choice_bp
from server.controllers.question_controller import question_bp
from server.controllers.quiz_controller import quiz_bp
from server.controllers.quiz_attempt_controller import quiz_attempt_bp
from server.controllers.user_controller import user_bp
from server.controllers.responses_controller import responses_bp
from server.controllers.auth_controller import auth_bp
from server.controllers.admin_controller import admin_bp # <--- admin

app = Flask(__name__)
CORS(app)
init_db()

# Secret key for session management
app.secret_key = 'your-super-secret-key'

# Register blueprints
app.register_blueprint(choice_bp)
app.register_blueprint(question_bp)
app.register_blueprint(quiz_bp)
app.register_blueprint(quiz_attempt_bp)
app.register_blueprint(user_bp)
app.register_blueprint(responses_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp) # <--- admin

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)