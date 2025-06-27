from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from app.models import db, User

users_bp = Blueprint('users', __name__)

@users_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_password = generate_password_hash(data['password'])
    user = User(name=data['name'], email=data['email'], password=hashed_password, role=data['role'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Usuario registrado exitosamente'})
