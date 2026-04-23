from datetime import datetime
from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    assignments = db.relationship(
        "StudentAssignment",
        backref="user",
        cascade="all, delete-orphan",
        lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "created_at": self.created_at.isoformat()
        }


class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    legajo = db.Column(db.String(50), unique=True, nullable=False, index=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    escuela = db.Column(db.String(150), nullable=False)
    grado = db.Column(db.String(50), nullable=True)
    diagnostico = db.Column(db.String(200), nullable=True)
    maestro_integrador = db.Column(db.String(120), nullable=True)
    maestro_grado = db.Column(db.String(120), nullable=True)
    direccion = db.Column(db.String(200), nullable=True)

    photo_original_name = db.Column(db.String(255), nullable=True)
    photo_saved_name = db.Column(db.String(255), nullable=True)
    photo_path = db.Column(db.String(500), nullable=True)
    photo_mime_type = db.Column(db.String(150), nullable=True)
    photo_size = db.Column(db.BigInteger, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    contents = db.relationship(
        "AdaptedContent",
        backref="student",
        cascade="all, delete-orphan",
        lazy=True
    )
    reports = db.relationship(
        "Report",
        backref="student",
        cascade="all, delete-orphan",
        lazy=True
    )
    visits = db.relationship(
        "Visit",
        backref="student",
        cascade="all, delete-orphan",
        lazy=True
    )
    assignments = db.relationship(
        "StudentAssignment",
        backref="student",
        cascade="all, delete-orphan",
        lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "legajo": self.legajo,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "escuela": self.escuela,
            "grado": self.grado,
            "diagnostico": self.diagnostico,
            "maestro_integrador": self.maestro_integrador,
            "maestro_grado": self.maestro_grado,
            "direccion": self.direccion,
            "photo_original_name": self.photo_original_name,
            "photo_saved_name": self.photo_saved_name,
            "photo_path": self.photo_path,
            "photo_mime_type": self.photo_mime_type,
            "photo_size": self.photo_size,
            "has_photo": bool(self.photo_saved_name),
            "created_at": self.created_at.isoformat()
        }


class StudentAssignment(db.Model):
    __tablename__ = "student_assignments"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    assignment_type = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "user_id": self.user_id,
            "assignment_type": self.assignment_type,
            "created_at": self.created_at.isoformat()
        }


class AdaptedContent(db.Model):
    __tablename__ = "adapted_contents"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False, index=True)
    materia = db.Column(db.String(100), nullable=False)
    titulo = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    progreso = db.Column(db.Integer, default=0, nullable=False)

    attachments = db.relationship(
        "ContentAttachment",
        backref="content",
        cascade="all, delete-orphan",
        lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "materia": self.materia,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "progreso": self.progreso,
            "attachments": [attachment.to_dict() for attachment in self.attachments],
            "has_attachments": len(self.attachments) > 0
        }


class ContentAttachment(db.Model):
    __tablename__ = "content_attachments"

    id = db.Column(db.Integer, primary_key=True)
    content_id = db.Column(db.Integer, db.ForeignKey("adapted_contents.id"), nullable=False, index=True)

    original_name = db.Column(db.String(255), nullable=False)
    saved_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    mime_type = db.Column(db.String(150), nullable=True)
    file_size = db.Column(db.BigInteger, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "content_id": self.content_id,
            "original_name": self.original_name,
            "saved_name": self.saved_name,
            "file_path": self.file_path,
            "mime_type": self.mime_type,
            "file_size": self.file_size
        }


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False, index=True)
    autor = db.Column(db.String(120), nullable=False)
    tipo = db.Column(db.String(120), nullable=False)
    fecha = db.Column(db.String(20), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)

    attachment_original_name = db.Column(db.String(255), nullable=True)
    attachment_saved_name = db.Column(db.String(255), nullable=True)
    attachment_path = db.Column(db.String(500), nullable=True)
    attachment_mime_type = db.Column(db.String(150), nullable=True)
    attachment_size = db.Column(db.BigInteger, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "autor": self.autor,
            "tipo": self.tipo,
            "fecha": self.fecha,
            "descripcion": self.descripcion,
            "attachment_original_name": self.attachment_original_name,
            "attachment_saved_name": self.attachment_saved_name,
            "attachment_path": self.attachment_path,
            "attachment_mime_type": self.attachment_mime_type,
            "attachment_size": self.attachment_size,
            "has_attachment": bool(self.attachment_saved_name)
        }


class Visit(db.Model):
    __tablename__ = "visits"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False, index=True)
    fecha = db.Column(db.String(20), nullable=False)
    profesional = db.Column(db.String(120), nullable=False)
    observaciones = db.Column(db.Text, nullable=True)

    def _compute_calendar_status(self):
        try:
            visit_date = datetime.strptime(self.fecha, "%Y-%m-%d").date()
            today = datetime.now().date()

            if visit_date < today:
                return "efectuada", "Efectuada"

            if visit_date > today:
                return "programada", "Programada"

            return "hoy", "Hoy"
        except ValueError:
            return "sin_fecha", "Sin fecha válida"

    def to_dict(self):
        estado_calendario, estado_calendario_label = self._compute_calendar_status()

        return {
            "id": self.id,
            "student_id": self.student_id,
            "fecha": self.fecha,
            "profesional": self.profesional,
            "observaciones": self.observaciones,
            "estado_calendario": estado_calendario,
            "estado_calendario_label": estado_calendario_label
        }