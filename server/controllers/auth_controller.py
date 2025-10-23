from flask import Blueprint, request, jsonify, session
from models.user import User as UserModel

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.post('/login')
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'email and password required'}), 400
    ok = UserModel.verify_password(email, password)
    if not ok:
        return jsonify({'error': 'Invalid credentials'}), 401
    user = UserModel.find_by_email(email)
    # set session user_id for future server-side checks
    try:
        # user may be None, a dict, or an object; extract the id safely
        user_id = None
        if user is None:
            user_id = None
        elif isinstance(user, dict):
            user_id = user.get('user_id') or user.get('id')
        else:
            user_id = getattr(user, 'user_id', None) or getattr(user, 'id', None)
        if user_id is not None:
            session['user_id'] = user_id
    except Exception:
        # If session backend isn't available, continue without blocking
        pass
    return jsonify(user)


# -------------------------------------------------------------
'''
CHECK WHICH USER IS CURRENTLY LOGGED ON -ARSENY
'''
# -------------------------------------------------------------
@auth_bp.get('/me')
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    user = UserModel.find_by_id(user_id)
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    # Return user info you want to expose
    return jsonify(user)
#----------------------------------------------------------------

@auth_bp.post('/logout')
def logout():
    session.pop('user_id', None)
    return ('', 204)
