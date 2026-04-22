from app.extensions import db
from app.models import User, Student, AdaptedContent, Report, Visit
from app.utils.auth import hash_password


def seed_database():
    """
    Inicializa la base de datos con datos de ejemplo.

    Este método:
    - Evita duplicar datos si ya existen usuarios
    - Crea usuarios iniciales
    - Crea alumnos de ejemplo
    - Crea contenidos, informes y visitas asociados

    Se ejecuta automáticamente al levantar la app.
    """

    # Si ya existen usuarios, se asume que la base ya está inicializada
    if User.query.first():
        return

    # -----------------------------
    # Creación de usuarios
    # -----------------------------
    admin = User(
        full_name="Adrian Romero",
        email="admin@eintegracion.com",
        password_hash=hash_password("Admin123!"),
        role="admin"
    )

    integrador = User(
        full_name="Lucia Perez",
        email="integrador@eintegracion.com",
        password_hash=hash_password("Admin123!"),
        role="integrador"
    )

    docente = User(
        full_name="Carlos Diaz",
        email="docente@eintegracion.com",
        password_hash=hash_password("Admin123!"),
        role="docente"
    )

    db.session.add_all([admin, integrador, docente])
    db.session.commit()

    # -----------------------------
    # Creación de alumnos
    # -----------------------------
    student_1 = Student(
        legajo="ALU-001",
        nombre="Tomás",
        apellido="Gómez",
        escuela="Escuela Primaria N° 15",
        grado="3° A",
        diagnostico="TEA",
        maestro_integrador="Lucia Perez",
        maestro_grado="Mariana Lopez",
        direccion="Av. Siempre Viva 123"
    )

    student_2 = Student(
        legajo="ALU-002",
        nombre="Valentina",
        apellido="Fernandez",
        escuela="Colegio San Martín",
        grado="2° B",
        diagnostico="Trastorno del lenguaje",
        maestro_integrador="Lucia Perez",
        maestro_grado="Carlos Diaz",
        direccion="Mitre 456"
    )

    db.session.add_all([student_1, student_2])
    db.session.commit()

    # -----------------------------
    # Creación de contenidos adaptados
    # -----------------------------
    content_1 = AdaptedContent(
        student_id=student_1.id,
        materia="Matemática",
        titulo="Números hasta 100",
        descripcion="Actividades adaptadas de conteo y sumas simples.",
        progreso=60
    )

    content_2 = AdaptedContent(
        student_id=student_1.id,
        materia="Lengua",
        titulo="Comprensión lectora",
        descripcion="Lectura de textos breves con apoyo visual.",
        progreso=40
    )

    content_3 = AdaptedContent(
        student_id=student_2.id,
        materia="Lengua",
        titulo="Pronunciación y vocabulario",
        descripcion="Ejercicios de palabras simples y asociación visual.",
        progreso=75
    )

    db.session.add_all([content_1, content_2, content_3])
    db.session.commit()

    # -----------------------------
    # Creación de informes
    # -----------------------------
    report_1 = Report(
        student_id=student_1.id,
        autor="Lic. Ana Torres",
        tipo="Informe terapéutico",
        fecha="2026-04-01",
        descripcion="Se observa buena respuesta a consignas estructuradas."
    )

    report_2 = Report(
        student_id=student_2.id,
        autor="Prof. Carlos Diaz",
        tipo="Informe pedagógico",
        fecha="2026-04-03",
        descripcion="Presenta avances en participación oral."
    )

    db.session.add_all([report_1, report_2])
    db.session.commit()

    # -----------------------------
    # Creación de visitas
    # -----------------------------
    visit_1 = Visit(
        student_id=student_1.id,
        fecha="2026-04-10",
        profesional="Lucia Perez",
        observaciones="Visita programada con familia y escuela."
    )

    visit_2 = Visit(
        student_id=student_2.id,
        fecha="2026-04-12",
        profesional="Lucia Perez",
        observaciones="Seguimiento de adaptación en aula."
    )

    db.session.add_all([visit_1, visit_2])
    db.session.commit()