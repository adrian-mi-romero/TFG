import os


class Config:
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

    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    REPORTS_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, "reports")
    STUDENTS_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, "students")

    # 16 MB máximo por request
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024