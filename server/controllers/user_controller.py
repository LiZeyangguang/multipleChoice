from flask import Blueprint, jsonify, request, session, g
from functools import wraps
from ..models.user import User as UserModel

user_bp = Blueprint('user', __name__, url_prefix='/api/user')


# Admin permission check decorator - NEW ADMIN FEATURE
def admin_required(f):
    """Decorator to check if current user has admin privileges"""

    @wraps(f)
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


# Get all users - NOW ADMIN ONLY
@user_bp.get('/')
@admin_required
def list_users():
    """Get all users (Admin only)"""
    users = UserModel.all()
    return jsonify(users)


# Get user by ID
@user_bp.get('/<int:user_id>')
def get_user_by_id(user_id):
    """Get user by ID (User can see own profile, admin can see any)"""
    current_user_id = session.get('user_id')
    if not current_user_id:
        return jsonify({'error': 'Authentication required'}), 401

    current_user = UserModel.get(current_user_id)
    # Deny access if not admin and not viewing own profile
    if not current_user.get('is_admin') and current_user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403

    user = UserModel.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user)


# Create new user
@user_bp.post('/')
def create_user():
    """Create new user (Admin required for creating admin accounts)"""
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')
    is_admin = 1 if data.get('is_admin') else 0

    # Check if creating admin account - requires existing admin privileges
    if is_admin:
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'error': 'Authentication required to create admin account'}), 401

        current_user = UserModel.get(current_user_id)
        if not current_user or not current_user.get('is_admin'):
            return jsonify({'error': 'Admin access required to create admin account'}), 403

    if not email or not password:
        return jsonify({'error': 'email and password required'}), 400

    created = UserModel.create(email, password, is_admin)
    if not created:
        return jsonify({'error': 'email already exists'}), 400
    return jsonify(created), 201


# Update user
@user_bp.put('/<int:user_id>')
def update_user(user_id):
    """Update user information (User can update own profile, admin can update any)"""
    data = request.get_json(silent=True) or {}
    current_user_id = session.get('user_id')

    if not current_user_id:
        return jsonify({'error': 'Authentication required'}), 401

    current_user = UserModel.get(current_user_id)
    target_user = UserModel.get(user_id)

    if not target_user:
        return jsonify({'error': 'User not found'}), 404

    # Permission check: user can only update own profile, admin can update any user
    if not current_user.get('is_admin') and current_user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403

    update_data = {}

    # Check if modifying admin status - requires admin privileges
    if 'is_admin' in data:
        if not current_user.get('is_admin'):
            return jsonify({'error': 'Admin access required to change admin status'}), 403
        update_data['is_admin'] = 1 if data['is_admin'] else 0

    # Both regular users and admins can update email and password
    if 'email' in data:
        update_data['email'] = data['email']
    if 'password' in data:
        update_data['password'] = data['password']

    updated = UserModel.update(user_id, update_data)
    if not updated:
        return jsonify({'error': 'User update failed'}), 400
    return jsonify(updated)


# Delete user - NOW ADMIN ONLY
@user_bp.delete('/<int:user_id>')
@admin_required
def delete_user(user_id):
    """Delete user (Admin only) - NEW ADMIN FEATURE"""
    current_user_id = session.get('user_id')

    # Prevent admin from deleting their own account
    if current_user_id == user_id:
        return jsonify({'error': 'Cannot delete your own account'}), 400

    ok = UserModel.delete(user_id)
    if not ok:
        return jsonify({'error': 'User not found'}), 404
    return ('', 204)


# Get current user information - NEW FEATURE
@user_bp.get('/me')
def get_current_user():
    """Get current authenticated user's information - NEW FEATURE"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401

    user = UserModel.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user)


# Admin statistics endpoint - NEW ADMIN FEATURE
@user_bp.get('/admin/stats')
@admin_required
def admin_stats():
    """Get user statistics (Admin only) - NEW ADMIN FEATURE"""
    users = UserModel.all()
    return jsonify({
        'total_users': len(users),
        'admin_users': len([u for u in users if u.get('is_admin')]),
        'regular_users': len([u for u in users if not u.get('is_admin')])
    })
    

@user_bp.get('/admin/')
def admin_get_all_users():
    """Get all users (Admin only)"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = UserModel.get(user_id)
    if not user or not user.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    users = UserModel.all()
    return jsonify(users)