#!/bin/bash

# Requisito local para algunas compilaciones Python:
# sudo apt install libmariadb-dev

set -e

# Variables
CONTAINER_NAME="school-mariadb"
DB_ROOT_PASSWORD="verysecure"
DB_NAME="school_integration_db"
DB_USER="school_user"
DB_USER_PASSWORD="school_pass"
DB_VOLUME_PATH="/tmp/school-mariadb"
TIMEZONE="Europe/Madrid"

echo "Pulling the latest MariaDB image..."
docker pull mariadb:latest

# Si ya existe un contenedor con ese nombre, lo elimina
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "Stopping and removing existing container: $CONTAINER_NAME..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
fi

# Asegura que exista el volumen local
mkdir -p "$DB_VOLUME_PATH"

echo "Starting the MariaDB container..."
docker run --name $CONTAINER_NAME \
  -e MARIADB_ROOT_PASSWORD=$DB_ROOT_PASSWORD \
  -e MARIADB_DATABASE=$DB_NAME \
  -e MARIADB_USER=$DB_USER \
  -e MARIADB_PASSWORD=$DB_USER_PASSWORD \
  -e TZ=$TIMEZONE \
  -p 3307:3306 \
  -v $DB_VOLUME_PATH:/var/lib/mysql \
  -d mariadb:latest

echo "Waiting for the database to initialize..."
sleep 15

echo "Creating database structure..."
docker exec -i $CONTAINER_NAME mariadb -u root -p$DB_ROOT_PASSWORD $DB_NAME <<EOF
DROP TABLE IF EXISTS student_assignments;
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS content_attachments;
DROP TABLE IF EXISTS adapted_contents;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    legajo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    escuela VARCHAR(150) NOT NULL,
    grado VARCHAR(50) DEFAULT NULL,
    diagnostico VARCHAR(200) DEFAULT NULL,
    maestro_integrador VARCHAR(120) DEFAULT NULL,
    maestro_grado VARCHAR(120) DEFAULT NULL,
    direccion VARCHAR(200) DEFAULT NULL,
    photo_original_name VARCHAR(255) DEFAULT NULL,
    photo_saved_name VARCHAR(255) DEFAULT NULL,
    photo_path VARCHAR(500) DEFAULT NULL,
    photo_mime_type VARCHAR(150) DEFAULT NULL,
    photo_size BIGINT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_students_legajo (legajo),
    INDEX idx_students_apellido_nombre (apellido, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    user_id INT NOT NULL,
    assignment_type VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_assignments_student_id (student_id),
    INDEX idx_student_assignments_user_id (user_id),
    INDEX idx_student_assignments_type (assignment_type),
    UNIQUE KEY uq_student_user_type (student_id, user_id, assignment_type),
    CONSTRAINT fk_student_assignments_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_student_assignments_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS adapted_contents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    materia VARCHAR(100) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    progreso INT NOT NULL DEFAULT 0,
    INDEX idx_adapted_contents_student_id (student_id),
    CONSTRAINT fk_adapted_contents_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS content_attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content_id INT NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        saved_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        mime_type VARCHAR(150) DEFAULT NULL,
        file_size BIGINT DEFAULT NULL,
        INDEX idx_content_attachments_content_id (content_id),
        CONSTRAINT fk_content_attachments_content
        FOREIGN KEY (content_id) REFERENCES adapted_contents(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    autor VARCHAR(120) NOT NULL,
    tipo VARCHAR(120) NOT NULL,
    fecha VARCHAR(20) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    attachment_original_name VARCHAR(255) DEFAULT NULL,
    attachment_saved_name VARCHAR(255) DEFAULT NULL,
    attachment_path VARCHAR(500) DEFAULT NULL,
    attachment_mime_type VARCHAR(150) DEFAULT NULL,
    attachment_size BIGINT DEFAULT NULL,
    INDEX idx_reports_student_id (student_id),
    CONSTRAINT fk_reports_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    fecha VARCHAR(20) NOT NULL,
    profesional VARCHAR(120) NOT NULL,
    observaciones TEXT DEFAULT NULL,
    INDEX idx_visits_student_id (student_id),
    CONSTRAINT fk_visits_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
EOF

echo "MariaDB setup is complete."
echo "Container: $CONTAINER_NAME"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Port: 3307"