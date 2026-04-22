import os
import uuid
from flask import Blueprint, jsonify, request, current_app, send_from_directory
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models import Student, StudentAssignment, AdaptedContent, Report, Visit, User

# Blueprint para agrupar todas las rutas relacionadas a alumnos
student_bp = Blueprint("student_bp", __name__, url_prefix="/api")


def get_current_user():
    """
    Obtiene el usuario actual desde el header X-USER-ID.
    """
    user_id = request.headers.get("X-USER-ID")

    if not user_id:
        return None

    try:
        return db.session.get(User, int(user_id))
    except (TypeError, ValueError):
        return None


def is_admin(user):
    """
    Indica si el usuario es administrador.
    """
    return user is not None and user.role == "admin"


def get_visible_student_ids(user):
    """
    Devuelve los ids de alumnos visibles para el usuario.
    """
    if not user:
        return []

    if is_admin(user):
        return [student.id for student in Student.query.all()]

    assignments = StudentAssignment.query.filter_by(user_id=user.id).all()
    return [assignment.student_id for assignment in assignments]


def can_access_student(user, student_id):
    """
    Verifica si el usuario puede acceder al alumno indicado.
    """
    if not user:
        return False

    if is_admin(user):
        return True

    assignment = StudentAssignment.query.filter_by(
        user_id=user.id,
        student_id=student_id
    ).first()

    return assignment is not None


def can_create_student(user):
    """
    Define quién puede crear alumnos.
    """
    if not user:
        return False

    return user.role in ["admin", "maestro_integrador"]


def can_edit_student(user, student_id):
    """
    Define quién puede editar datos generales del alumno.
    """
    if not user:
        return False

    if is_admin(user):
        return True

    if user.role == "maestro_integrador" and can_access_student(user, student_id):
        return True

    return False


def can_delete_student(user):
    """
    Define quién puede borrar alumnos.
    """
    return is_admin(user)


def save_uploaded_report_file(file_storage):
    """
    Guarda un archivo adjunto de informe en disco y retorna su metadata.
    """
    original_name = secure_filename(file_storage.filename)

    if not original_name:
        return None

    unique_name = f"{uuid.uuid4().hex}_{original_name}"
    reports_folder = current_app.config["REPORTS_UPLOAD_FOLDER"]
    full_path = os.path.join(reports_folder, unique_name)

    file_storage.save(full_path)

    size = os.path.getsize(full_path)
    mime_type = file_storage.mimetype

    return {
        "original_name": original_name,
        "saved_name": unique_name,
        "full_path": full_path,
        "mime_type": mime_type,
        "size": size
    }


def delete_report_file_if_exists(report):
    """
    Elimina del filesystem el archivo asociado a un informe si existe.
    """
    if report and report.attachment_path and os.path.exists(report.attachment_path):
        os.remove(report.attachment_path)


def save_uploaded_student_photo(file_storage):
    """
    Guarda la foto de un alumno en disco y retorna su metadata.
    """
    original_name = secure_filename(file_storage.filename)

    if not original_name:
        return None

    unique_name = f"{uuid.uuid4().hex}_{original_name}"
    students_folder = current_app.config["STUDENTS_UPLOAD_FOLDER"]
    full_path = os.path.join(students_folder, unique_name)

    file_storage.save(full_path)

    size = os.path.getsize(full_path)
    mime_type = file_storage.mimetype

    return {
        "original_name": original_name,
        "saved_name": unique_name,
        "full_path": full_path,
        "mime_type": mime_type,
        "size": size
    }


def delete_student_photo_if_exists(student):
    """
    Elimina del filesystem la foto asociada a un alumno si existe.
    """
    if student and student.photo_path and os.path.exists(student.photo_path):
        os.remove(student.photo_path)


def delete_all_student_report_files(student):
    """
    Elimina todos los archivos adjuntos de informes asociados a un alumno.
    """
    if not student:
        return

    for report in student.reports:
        delete_report_file_if_exists(report)


@student_bp.route("/health", methods=["GET"])
def health():
    """
    Endpoint de prueba para verificar que el backend está funcionando.
    """
    return jsonify({"status": "ok"}), 200


@student_bp.route("/students", methods=["GET"])
def get_students():
    """
    Obtiene la lista de alumnos visibles para el usuario actual.

    Permite filtro opcional mediante query param 'q', buscando por:
    - Nombre completo
    - Legajo
    - Escuela
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    query = request.args.get("q", "").strip().lower()

    if is_admin(user):
        students = Student.query.order_by(Student.apellido.asc(), Student.nombre.asc()).all()
    else:
        visible_ids = get_visible_student_ids(user)

        if not visible_ids:
            return jsonify([]), 200

        students = Student.query.filter(
            Student.id.in_(visible_ids)
        ).order_by(Student.apellido.asc(), Student.nombre.asc()).all()

    if query:
        filtered = []
        for student in students:
            full_name = f"{student.nombre} {student.apellido}".lower()

            if (
                query in full_name
                or query in student.legajo.lower()
                or query in (student.escuela or "").lower()
            ):
                filtered.append(student)

        students = filtered

    return jsonify([student.to_dict() for student in students]), 200


@student_bp.route("/students", methods=["POST"])
def create_student():
    """
    Crea un nuevo alumno.

    Valida:
    - usuario autenticado
    - permiso de creación
    - campos obligatorios: legajo, nombre, apellido, escuela
    - Legajo único

    Regla especial:
    - si el creador es maestro_integrador, se autoasigna al alumno creado
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    if not can_create_student(user):
        return jsonify({"error": "No tienes permisos para crear alumnos"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    required_fields = ["legajo", "nombre", "apellido", "escuela"]

    missing_fields = [
        field for field in required_fields
        if not str(data.get(field, "")).strip()
    ]

    if missing_fields:
        return jsonify({
            "error": "Faltan campos obligatorios",
            "missing_fields": missing_fields
        }), 400

    existing_student = Student.query.filter_by(
        legajo=data["legajo"].strip()
    ).first()

    if existing_student:
        return jsonify({"error": "Ya existe un alumno con ese legajo"}), 409

    student = Student(
        legajo=data["legajo"].strip(),
        nombre=data["nombre"].strip(),
        apellido=data["apellido"].strip(),
        escuela=data["escuela"].strip(),
        grado=data.get("grado", "").strip(),
        diagnostico=data.get("diagnostico", "").strip(),
        maestro_integrador=data.get("maestro_integrador", "").strip(),
        maestro_grado=data.get("maestro_grado", "").strip(),
        direccion=data.get("direccion", "").strip()
    )

    db.session.add(student)
    db.session.commit()

    # Autoasignación del maestro integrador al alumno recién creado
    if user.role == "maestro_integrador":
        assignment = StudentAssignment(
            student_id=student.id,
            user_id=user.id,
            assignment_type="maestro_integrador"
        )
        db.session.add(assignment)
        db.session.commit()

    return jsonify({
        "message": "Alumno creado correctamente",
        "student": student.to_dict()
    }), 201


@student_bp.route("/students/<int:student_id>", methods=["GET"])
def get_student(student_id):
    """
    Obtiene el detalle de un alumno por ID si el usuario tiene acceso.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    return jsonify(student.to_dict()), 200


@student_bp.route("/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):
    """
    Actualiza los datos generales de un alumno.

    Valida:
    - que el usuario esté autenticado
    - que el alumno exista
    - que el usuario tenga permiso
    - campos obligatorios: nombre, apellido, escuela
    - legajo único si se modifica
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_edit_student(user, student_id):
        return jsonify({"error": "No tienes permisos para editar este alumno"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    legajo = str(data.get("legajo", student.legajo)).strip()
    nombre = str(data.get("nombre", "")).strip()
    apellido = str(data.get("apellido", "")).strip()
    escuela = str(data.get("escuela", "")).strip()
    grado = str(data.get("grado", "")).strip()
    diagnostico = str(data.get("diagnostico", "")).strip()
    maestro_integrador = str(data.get("maestro_integrador", "")).strip()
    maestro_grado = str(data.get("maestro_grado", "")).strip()
    direccion = str(data.get("direccion", "")).strip()

    if not nombre or not apellido or not escuela:
        return jsonify({
            "error": "Los campos nombre, apellido y escuela son obligatorios"
        }), 400

    existing_student = Student.query.filter(
        Student.legajo == legajo,
        Student.id != student.id
    ).first()

    if existing_student:
        return jsonify({"error": "Ya existe otro alumno con ese legajo"}), 409

    student.legajo = legajo
    student.nombre = nombre
    student.apellido = apellido
    student.escuela = escuela
    student.grado = grado
    student.diagnostico = diagnostico
    student.maestro_integrador = maestro_integrador
    student.maestro_grado = maestro_grado
    student.direccion = direccion

    db.session.commit()

    return jsonify({
        "message": "Alumno actualizado correctamente",
        "student": student.to_dict()
    }), 200


@student_bp.route("/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    """
    Elimina un alumno y todos sus datos relacionados.

    También elimina archivos físicos asociados:
    - foto del alumno
    - adjuntos de informes

    Solo admin puede borrar alumnos.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    if not can_delete_student(user):
        return jsonify({"error": "No tienes permisos para borrar alumnos"}), 403

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    delete_student_photo_if_exists(student)
    delete_all_student_report_files(student)

    db.session.delete(student)
    db.session.commit()

    return jsonify({
        "message": "Alumno eliminado correctamente"
    }), 200


@student_bp.route("/students/<int:student_id>/photo", methods=["POST"])
def upload_student_photo(student_id):
    """
    Sube o reemplaza la foto de un alumno.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_edit_student(user, student_id):
        return jsonify({"error": "No tienes permisos para modificar la foto de este alumno"}), 403

    photo = request.files.get("photo")

    if not photo or not photo.filename:
        return jsonify({"error": "Debe adjuntar una foto"}), 400

    delete_student_photo_if_exists(student)

    saved_file = save_uploaded_student_photo(photo)

    if not saved_file:
        return jsonify({"error": "Nombre de archivo inválido"}), 400

    student.photo_original_name = saved_file["original_name"]
    student.photo_saved_name = saved_file["saved_name"]
    student.photo_path = saved_file["full_path"]
    student.photo_mime_type = saved_file["mime_type"]
    student.photo_size = saved_file["size"]

    db.session.commit()

    return jsonify({
        "message": "Foto subida correctamente",
        "student": student.to_dict()
    }), 200


@student_bp.route("/students/<int:student_id>/photo", methods=["DELETE"])
def delete_student_photo(student_id):
    """
    Elimina la foto de un alumno.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_edit_student(user, student_id):
        return jsonify({"error": "No tienes permisos para eliminar la foto de este alumno"}), 403

    delete_student_photo_if_exists(student)

    student.photo_original_name = None
    student.photo_saved_name = None
    student.photo_path = None
    student.photo_mime_type = None
    student.photo_size = None

    db.session.commit()

    return jsonify({
        "message": "Foto eliminada correctamente",
        "student": student.to_dict()
    }), 200


@student_bp.route("/students/<int:student_id>/photo/view", methods=["GET"])
def view_student_photo(student_id):
    """
    Devuelve la foto del alumno para visualizarla en frontend.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    if not student.photo_saved_name:
        return jsonify({"error": "El alumno no tiene foto"}), 404

    students_folder = current_app.config["STUDENTS_UPLOAD_FOLDER"]

    return send_from_directory(
        students_folder,
        student.photo_saved_name,
        as_attachment=False
    )


@student_bp.route("/students/<int:student_id>/contents", methods=["GET"])
def get_student_contents(student_id):
    """
    Obtiene los contenidos adaptados de un alumno.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    return jsonify([item.to_dict() for item in student.contents]), 200


@student_bp.route("/students/<int:student_id>/contents", methods=["POST"])
def create_student_content(student_id):
    """
    Crea un nuevo contenido adaptado para un alumno.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    materia = str(data.get("materia", "")).strip()
    titulo = str(data.get("titulo", "")).strip()
    descripcion = str(data.get("descripcion", "")).strip()

    if not materia or not titulo:
        return jsonify({
            "error": "Los campos materia y titulo son obligatorios"
        }), 400

    progreso_raw = data.get("progreso", 0)

    try:
        progreso = int(progreso_raw)
    except (TypeError, ValueError):
        return jsonify({"error": "El progreso debe ser un número entero"}), 400

    if progreso < 0 or progreso > 100:
        return jsonify({"error": "El progreso debe estar entre 0 y 100"}), 400

    content = AdaptedContent(
        student_id=student.id,
        materia=materia,
        titulo=titulo,
        descripcion=descripcion,
        progreso=progreso
    )

    db.session.add(content)
    db.session.commit()

    return jsonify({
        "message": "Contenido creado correctamente",
        "content": content.to_dict()
    }), 201


@student_bp.route("/students/<int:student_id>/contents/<int:content_id>", methods=["PUT"])
def update_student_content(student_id, content_id):
    """
    Actualiza un contenido adaptado existente.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    content = db.session.get(AdaptedContent, content_id)

    if not content:
        return jsonify({"error": "Contenido no encontrado"}), 404

    if content.student_id != student.id:
        return jsonify({"error": "El contenido no pertenece al alumno indicado"}), 400

    data = request.get_json()

    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    materia = str(data.get("materia", "")).strip()
    titulo = str(data.get("titulo", "")).strip()
    descripcion = str(data.get("descripcion", "")).strip()

    if not materia or not titulo:
        return jsonify({"error": "Los campos materia y titulo son obligatorios"}), 400

    progreso_raw = data.get("progreso", content.progreso)

    try:
        progreso = int(progreso_raw)
    except (TypeError, ValueError):
        return jsonify({"error": "El progreso debe ser un número entero"}), 400

    if progreso < 0 or progreso > 100:
        return jsonify({"error": "El progreso debe estar entre 0 y 100"}), 400

    content.materia = materia
    content.titulo = titulo
    content.descripcion = descripcion
    content.progreso = progreso

    db.session.commit()

    return jsonify({
        "message": "Contenido actualizado correctamente",
        "content": content.to_dict()
    }), 200


@student_bp.route("/students/<int:student_id>/contents/<int:content_id>", methods=["DELETE"])
def delete_student_content(student_id, content_id):
    """
    Elimina un contenido adaptado.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    content = db.session.get(AdaptedContent, content_id)

    if not content:
        return jsonify({"error": "Contenido no encontrado"}), 404

    if content.student_id != student.id:
        return jsonify({"error": "El contenido no pertenece al alumno indicado"}), 400

    db.session.delete(content)
    db.session.commit()

    return jsonify({
        "message": "Contenido eliminado correctamente"
    }), 200


@student_bp.route("/students/<int:student_id>/reports", methods=["GET"])
def get_student_reports(student_id):
    """
    Obtiene los informes pedagógicos o terapéuticos de un alumno.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    return jsonify([item.to_dict() for item in student.reports]), 200


@student_bp.route("/students/<int:student_id>/reports", methods=["POST"])
def create_student_report(student_id):
    """
    Crea un nuevo informe para un alumno.
    Admite archivo adjunto opcional vía multipart/form-data.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    autor = str(request.form.get("autor", "")).strip()
    tipo = str(request.form.get("tipo", "")).strip()
    fecha = str(request.form.get("fecha", "")).strip()
    descripcion = str(request.form.get("descripcion", "")).strip()

    if not autor or not tipo or not fecha:
        return jsonify({
            "error": "Los campos autor, tipo y fecha son obligatorios"
        }), 400

    report = Report(
        student_id=student.id,
        autor=autor,
        tipo=tipo,
        fecha=fecha,
        descripcion=descripcion
    )

    attachment = request.files.get("attachment")

    if attachment and attachment.filename:
        saved_file = save_uploaded_report_file(attachment)

        if saved_file:
            report.attachment_original_name = saved_file["original_name"]
            report.attachment_saved_name = saved_file["saved_name"]
            report.attachment_path = saved_file["full_path"]
            report.attachment_mime_type = saved_file["mime_type"]
            report.attachment_size = saved_file["size"]

    db.session.add(report)
    db.session.commit()

    return jsonify({
        "message": "Informe creado correctamente",
        "report": report.to_dict()
    }), 201


@student_bp.route("/students/<int:student_id>/reports/<int:report_id>", methods=["PUT"])
def update_student_report(student_id, report_id):
    """
    Actualiza un informe existente.
    Admite reemplazo opcional del archivo adjunto.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    report = db.session.get(Report, report_id)

    if not report:
        return jsonify({"error": "Informe no encontrado"}), 404

    if report.student_id != student.id:
        return jsonify({"error": "El informe no pertenece al alumno indicado"}), 400

    autor = str(request.form.get("autor", "")).strip()
    tipo = str(request.form.get("tipo", "")).strip()
    fecha = str(request.form.get("fecha", "")).strip()
    descripcion = str(request.form.get("descripcion", "")).strip()

    if not autor or not tipo or not fecha:
        return jsonify({
            "error": "Los campos autor, tipo y fecha son obligatorios"
        }), 400

    report.autor = autor
    report.tipo = tipo
    report.fecha = fecha
    report.descripcion = descripcion

    remove_attachment = str(request.form.get("remove_attachment", "false")).lower() == "true"
    attachment = request.files.get("attachment")

    if remove_attachment:
        delete_report_file_if_exists(report)
        report.attachment_original_name = None
        report.attachment_saved_name = None
        report.attachment_path = None
        report.attachment_mime_type = None
        report.attachment_size = None

    if attachment and attachment.filename:
        delete_report_file_if_exists(report)

        saved_file = save_uploaded_report_file(attachment)

        if saved_file:
            report.attachment_original_name = saved_file["original_name"]
            report.attachment_saved_name = saved_file["saved_name"]
            report.attachment_path = saved_file["full_path"]
            report.attachment_mime_type = saved_file["mime_type"]
            report.attachment_size = saved_file["size"]

    db.session.commit()

    return jsonify({
        "message": "Informe actualizado correctamente",
        "report": report.to_dict()
    }), 200


@student_bp.route("/students/<int:student_id>/reports/<int:report_id>", methods=["DELETE"])
def delete_student_report(student_id, report_id):
    """
    Elimina un informe y su archivo adjunto si existe.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    report = db.session.get(Report, report_id)

    if not report:
        return jsonify({"error": "Informe no encontrado"}), 404

    if report.student_id != student.id:
        return jsonify({"error": "El informe no pertenece al alumno indicado"}), 400

    delete_report_file_if_exists(report)

    db.session.delete(report)
    db.session.commit()

    return jsonify({
        "message": "Informe eliminado correctamente"
    }), 200


@student_bp.route("/students/<int:student_id>/reports/<int:report_id>/download", methods=["GET"])
def download_student_report_attachment(student_id, report_id):
    """
    Descarga el archivo adjunto de un informe.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    report = db.session.get(Report, report_id)

    if not report:
        return jsonify({"error": "Informe no encontrado"}), 404

    if report.student_id != student.id:
        return jsonify({"error": "El informe no pertenece al alumno indicado"}), 400

    if not report.attachment_saved_name:
        return jsonify({"error": "El informe no tiene archivo adjunto"}), 404

    reports_folder = current_app.config["REPORTS_UPLOAD_FOLDER"]

    return send_from_directory(
        reports_folder,
        report.attachment_saved_name,
        as_attachment=True,
        download_name=report.attachment_original_name
    )


@student_bp.route("/students/<int:student_id>/visits", methods=["GET"])
def get_student_visits(student_id):
    """
    Obtiene el calendario de visitas asociadas a un alumno.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    return jsonify([item.to_dict() for item in student.visits]), 200


@student_bp.route("/students/<int:student_id>/visits", methods=["POST"])
def create_student_visit(student_id):
    """
    Crea una nueva visita para un alumno.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    data = request.get_json()

    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    fecha = str(data.get("fecha", "")).strip()
    profesional = str(data.get("profesional", "")).strip()
    observaciones = str(data.get("observaciones", "")).strip()

    if not fecha or not profesional:
        return jsonify({
            "error": "Los campos fecha y profesional son obligatorios"
        }), 400

    visit = Visit(
        student_id=student.id,
        fecha=fecha,
        profesional=profesional,
        observaciones=observaciones
    )

    db.session.add(visit)
    db.session.commit()

    return jsonify({
        "message": "Visita creada correctamente",
        "visit": visit.to_dict()
    }), 201


@student_bp.route("/students/<int:student_id>/visits/<int:visit_id>", methods=["PUT"])
def update_student_visit(student_id, visit_id):
    """
    Actualiza una visita existente.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    visit = db.session.get(Visit, visit_id)

    if not visit:
        return jsonify({"error": "Visita no encontrada"}), 404

    if visit.student_id != student.id:
        return jsonify({"error": "La visita no pertenece al alumno indicado"}), 400

    data = request.get_json()

    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    fecha = str(data.get("fecha", "")).strip()
    profesional = str(data.get("profesional", "")).strip()
    observaciones = str(data.get("observaciones", "")).strip()

    if not fecha or not profesional:
        return jsonify({
            "error": "Los campos fecha y profesional son obligatorios"
        }), 400

    visit.fecha = fecha
    visit.profesional = profesional
    visit.observaciones = observaciones

    db.session.commit()

    return jsonify({
        "message": "Visita actualizada correctamente",
        "visit": visit.to_dict()
    }), 200


@student_bp.route("/students/<int:student_id>/visits/<int:visit_id>", methods=["DELETE"])
def delete_student_visit(student_id, visit_id):
    """
    Elimina una visita.
    """
    user = get_current_user()

    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    if not can_access_student(user, student_id):
        return jsonify({"error": "No tienes acceso a este alumno"}), 403

    visit = db.session.get(Visit, visit_id)

    if not visit:
        return jsonify({"error": "Visita no encontrada"}), 404

    if visit.student_id != student.id:
        return jsonify({"error": "La visita no pertenece al alumno indicado"}), 400

    db.session.delete(visit)
    db.session.commit()

    return jsonify({
        "message": "Visita eliminada correctamente"
    }), 200