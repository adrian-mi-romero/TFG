import os


class Config:
    """
    Configuración principal de la aplicación.

    Incluye:
    - conexión a MariaDB
    - clave secreta
    - carpeta de uploads
    - límite máximo de tamaño para archivos adjuntos
    """

    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

    SECRET_KEY = "dev-secret-key-change-later"

    DB_USER = "school_user"
    DB_PASSWORD = "school_pass"
    DB_HOST = "localhost"
    DB_PORT = 3307
    DB_NAME = "school_integration_db"

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Carpeta local donde se guardarán los archivos adjuntos de informes
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "reports")

    # Límite máximo de archivo: 10 MB
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024