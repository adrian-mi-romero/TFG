from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models import User
from app.utils.auth import hash_password, verify_password

# Definición del blueprint para agrupar rutas relacionadas a autenticación
auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api")

# Lista de roles válidos definidos según el modelo del sistema
VALID_ROLES = {
    "admin",
    "padre_tutor",
    "maestro_grado",
    "maestro_integrador",
    "profesional_terapeutico"
}


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Endpoint para registrar un nuevo usuario.

    Valida:
    - Campos obligatorios
    - Rol válido
    - Longitud mínima de contraseña
    - Email único

    Retorna:
    - 201 si se crea correctamente
    - 400 si faltan datos o son inválidos
    - 409 si el usuario ya existe
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    role = data.get("role", "").strip()

    # Validación de campos obligatorios
    if not full_name or not email or not password or not role:
        return jsonify({"error": "Todos los campos son obligatorios"}), 400

    # Validación de rol permitido
    if role not in VALID_ROLES:
        return jsonify({"error": "Rol inválido"}), 400

    # Validación básica de contraseña
    if len(password) < 8:
        return jsonify({"error": "La contraseña debe tener al menos 8 caracteres"}), 400

    # Verificación de existencia de usuario con el mismo email
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Ya existe un usuario con ese email"}), 409

    # Creación del usuario con password hasheado
    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        role=role
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Usuario registrado correctamente",
        "user": user.to_dict()
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Endpoint de autenticación.

    Valida:
    - Email existente
    - Contraseña correcta mediante hash

    Retorna:
    - 200 con datos del usuario si login es correcto
    - 401 si las credenciales son inválidas
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    # Búsqueda del usuario en base de datos
    user = User.query.filter_by(email=email).first()

    # Verificación de credenciales
    if not user or not verify_password(user.password_hash, password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    return jsonify({
        "message": "Login correcto",
        "user": user.to_dict()
    }), 200