from flask import Blueprint, jsonify, request, session, g
from ..models.user import User as UserModel
from ..models.quiz import Quiz as QuizModel
from ..models.question import Question as QuestionModel
import functools

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def admin_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        user = UserModel.get(user_id)
        if not user or not user.get('is_admin'):
            return jsonify({'error': 'Admin access required'}), 403

        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.get('/dashboard')
@admin_required
def admin_dashboard():
    """Admin dashboard data"""
    users = UserModel.all()
    quizzes = QuizModel.all()

    return jsonify({
        'stats': {
            'total_users': len(users),
            'total_quizzes': len(quizzes),
        }
    })

@admin_bp.get('/quizzes')
@admin_required
def get_all_quizzes_with_questions():
    """Get all quizzes with their questions"""
    quizzes = QuizModel.all()
    result = []

    for quiz in quizzes:
        full_quiz_data = QuizModel.get(quiz['quiz_id'])
        if full_quiz_data:
            full_quiz_data['question_count'] = len(full_quiz_data.get('questions', []))
            result.append(full_quiz_data)

    return jsonify(result)

@admin_bp.delete('/quiz/<int:quiz_id>')
@admin_required
def delete_quiz(quiz_id):
    """Delete a quiz"""
    success = QuizModel.delete(quiz_id)
    if success:
        return jsonify({'message': 'Quiz deleted successfully'}), 200
    return jsonify({'error': 'Quiz not found'}), 404

@admin_bp.delete('/user/<int:user_id>')
@admin_required
def delete_user(user_id):
    """Delete a user"""
    current_user_id = session.get('user_id')
    if current_user_id == user_id:
        return jsonify({'error': 'Cannot delete your own account'}), 400

    success = UserModel.delete(user_id)
    if success:
        return jsonify({'message': 'User deleted successfully'}), 200
    return jsonify({'error': 'User not found'}), 404

@admin_bp.delete('/question/<int:question_id>')
@admin_required
def delete_question(question_id):
    """Delete a question"""
    success = QuestionModel.delete(question_id)
    if success:
        return jsonify({'message': 'Question deleted successfully'}), 200
    return jsonify({'error': 'Question not found'}), 404