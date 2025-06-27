from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from app.models import db, User
from app.utils.auth import generate_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        token = generate_token(user)
        return jsonify({'token': token})
    return jsonify({'error': 'Credenciales inválidas'}), 401
