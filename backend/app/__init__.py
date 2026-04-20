import os
from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db
from app.routes.auth_routes import auth_bp
from app.routes.student_routes import student_bp
from app.seed import seed_database


def create_app():
    """
    Factory principal de la aplicación Flask.

    Responsabilidades:
    - Crear instancia de Flask
    - Cargar configuración
    - Inicializar extensiones
    - Registrar blueprints
    - Crear tablas si no existen
    - Crear carpeta de uploads
    - Insertar datos iniciales
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Habilita CORS para permitir requests desde el frontend
    CORS(app)

    # Inicializa SQLAlchemy
    db.init_app(app)

    # Registro de blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)

    with app.app_context():
      # Crea las tablas que no existan
        db.create_all()

        # Asegura la existencia de la carpeta de uploads
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

        # Inserta datos iniciales si la DB está vacía
        seed_database()

    return app