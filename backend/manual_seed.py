from app import create_app
from app.extensions import db
from app.models import User, Student, StudentAssignment, AdaptedContent, Report, Visit
from app.utils.auth import hash_password


def run_manual_seed():
    """
    Crea usuarios, alumnos, contenidos, informes y visitas de ejemplo.

    Reglas:
    - Si ya existe cualquier usuario, no inserta nada.
    - Está pensado para ejecutarse manualmente después de crear la DB.
    """

    if User.query.first():
        print("La tabla users ya contiene datos. No se insertó información nueva.")
        return

    print("Creando usuarios iniciales...")

    admin = User(
        full_name="Adrian Romero",
        email="admin@eintegracion.com",
        phone="+34 912 345 678",
        password_hash=hash_password("Admin123!"),
        role="admin"
    )

    integrador_1 = User(
        full_name="Lucia Perez",
        email="integrador1@eintegracion.com",
        phone="+34 913 456 789",
        password_hash=hash_password("Admin123!"),
        role="maestro_integrador"
    )

    integrador_2 = User(
        full_name="Sofia Martinez",
        email="integrador2@eintegracion.com",
        phone="+34 914 567 890",
        password_hash=hash_password("Admin123!"),
        role="maestro_integrador"
    )

    docente = User(
        full_name="Carlos Diaz",
        email="docente@eintegracion.com",
        phone="+34 915 678 901",
        password_hash=hash_password("Admin123!"),
        role="maestro_grado"
    )

    db.session.add_all([admin, integrador_1, integrador_2, docente])
    db.session.commit()

    print("Usuarios creados correctamente.")

    print("Creando alumnos de ejemplo...")

    students_data = [
        {
            "legajo": "ALU-001",
            "nombre": "Tomás",
            "apellido": "Gómez",
            "escuela": "Escuela Primaria N° 15",
            "grado": "3° A",
            "diagnostico": "TEA",
            "maestro_integrador": integrador_1.full_name,
            "maestro_grado": "Mariana Lopez",
            "direccion": "Av. Siempre Viva 123"
        },
        {
            "legajo": "ALU-002",
            "nombre": "Valentina",
            "apellido": "Fernandez",
            "escuela": "Colegio San Martín",
            "grado": "2° B",
            "diagnostico": "Trastorno del lenguaje",
            "maestro_integrador": integrador_1.full_name,
            "maestro_grado": "Carlos Diaz",
            "direccion": "Mitre 456"
        },
        {
            "legajo": "ALU-003",
            "nombre": "Mateo",
            "apellido": "Ruiz",
            "escuela": "Escuela N° 8 José Hernández",
            "grado": "4° A",
            "diagnostico": "TDAH",
            "maestro_integrador": integrador_1.full_name,
            "maestro_grado": "Florencia Rivas",
            "direccion": "Belgrano 742"
        },
        {
            "legajo": "ALU-004",
            "nombre": "Camila",
            "apellido": "Sosa",
            "escuela": "Instituto Del Valle",
            "grado": "1° B",
            "diagnostico": "Trastorno específico del lenguaje",
            "maestro_integrador": integrador_1.full_name,
            "maestro_grado": "Daniela Ferreyra",
            "direccion": "San Martín 1180"
        },
        {
            "legajo": "ALU-005",
            "nombre": "Joaquín",
            "apellido": "Ledesma",
            "escuela": "Escuela Primaria N° 27",
            "grado": "5° C",
            "diagnostico": "Discapacidad intelectual leve",
            "maestro_integrador": integrador_1.full_name,
            "maestro_grado": "Paula Acosta",
            "direccion": "Sarmiento 509"
        },
        {
            "legajo": "ALU-006",
            "nombre": "Martina",
            "apellido": "Quiroga",
            "escuela": "Colegio Manuel Belgrano",
            "grado": "3° B",
            "diagnostico": "TEA",
            "maestro_integrador": integrador_2.full_name,
            "maestro_grado": "Roberto Ibarra",
            "direccion": "Lavalle 902"
        },
        {
            "legajo": "ALU-007",
            "nombre": "Benicio",
            "apellido": "Molina",
            "escuela": "Escuela N° 12 Domingo Faustino Sarmiento",
            "grado": "2° A",
            "diagnostico": "Retraso madurativo",
            "maestro_integrador": integrador_2.full_name,
            "maestro_grado": "Verónica Torres",
            "direccion": "Rivadavia 333"
        },
        {
            "legajo": "ALU-008",
            "nombre": "Abril",
            "apellido": "Navarro",
            "escuela": "Escuela Modelo del Sur",
            "grado": "4° C",
            "diagnostico": "Trastorno del aprendizaje",
            "maestro_integrador": integrador_2.full_name,
            "maestro_grado": "Natalia Gómez",
            "direccion": "French 1288"
        },
        {
            "legajo": "ALU-009",
            "nombre": "Thiago",
            "apellido": "Castro",
            "escuela": "Instituto San José",
            "grado": "6° A",
            "diagnostico": "Dislexia",
            "maestro_integrador": integrador_2.full_name,
            "maestro_grado": "Lorena Vega",
            "direccion": "9 de Julio 654"
        },
        {
            "legajo": "ALU-010",
            "nombre": "Emma",
            "apellido": "Peralta",
            "escuela": "Escuela Primaria N° 42",
            "grado": "1° A",
            "diagnostico": "Trastorno de la comunicación social",
            "maestro_integrador": integrador_2.full_name,
            "maestro_grado": "Julieta Romero",
            "direccion": "Urquiza 147"
        }
    ]

    students = [Student(**student_data) for student_data in students_data]

    db.session.add_all(students)
    db.session.commit()

    assignments = []

    for student in students[:5]:
        assignments.append(
            StudentAssignment(
                student_id=student.id,
                user_id=integrador_1.id,
                assignment_type="maestro_integrador"
            )
        )

    for student in students[5:]:
        assignments.append(
            StudentAssignment(
                student_id=student.id,
                user_id=integrador_2.id,
                assignment_type="maestro_integrador"
            )
        )

    db.session.add_all(assignments)
    db.session.commit()

    print("Alumnos creados correctamente.")
    print("Asignaciones creadas correctamente: 5 alumnos para integrador1 y 5 alumnos para integrador2.")

    print("Creando contenidos adaptados...")

    contents = [
        AdaptedContent(
            student_id=students[0].id,
            materia="Matemática",
            titulo="Números hasta 100",
            descripcion="Actividades adaptadas de conteo y sumas simples.",
            progreso=60
        ),
        AdaptedContent(
            student_id=students[1].id,
            materia="Lengua",
            titulo="Comprensión de consignas",
            descripcion="Lectura guiada con apoyo visual y pictogramas.",
            progreso=55
        ),
        AdaptedContent(
            student_id=students[2].id,
            materia="Ciencias Sociales",
            titulo="Mi comunidad",
            descripcion="Secuencia con mapas simples, imágenes y preguntas breves.",
            progreso=70
        ),
        AdaptedContent(
            student_id=students[3].id,
            materia="Lengua",
            titulo="Vocabulario cotidiano",
            descripcion="Asociación de palabras con imágenes y producción oral breve.",
            progreso=45
        ),
        AdaptedContent(
            student_id=students[4].id,
            materia="Matemática",
            titulo="Sumas y restas concretas",
            descripcion="Uso de material manipulativo para resolver operaciones básicas.",
            progreso=50
        ),
        AdaptedContent(
            student_id=students[5].id,
            materia="Prácticas del Lenguaje",
            titulo="Secuencias narrativas",
            descripcion="Ordenamiento de imágenes para anticipar y relatar hechos.",
            progreso=65
        ),
        AdaptedContent(
            student_id=students[6].id,
            materia="Ciencias Naturales",
            titulo="Los seres vivos",
            descripcion="Clasificación simple con fichas visuales y ejemplos concretos.",
            progreso=35
        ),
        AdaptedContent(
            student_id=students[7].id,
            materia="Matemática",
            titulo="Tablas de multiplicar iniciales",
            descripcion="Ejercicios graduados con apoyos visuales y juegos.",
            progreso=40
        ),
        AdaptedContent(
            student_id=students[8].id,
            materia="Lengua",
            titulo="Conciencia fonológica",
            descripcion="Actividades de segmentación silábica y lectura acompañada.",
            progreso=58
        ),
        AdaptedContent(
            student_id=students[9].id,
            materia="Matemática",
            titulo="Conteo y seriación",
            descripcion="Rutinas cortas de clasificación, conteo y reconocimiento numérico.",
            progreso=62
        )
    ]

    db.session.add_all(contents)
    db.session.commit()

    print("Contenidos creados correctamente.")

    print("Creando informes...")

    reports = [
        Report(
            student_id=students[0].id,
            autor="Lic. Ana Torres",
            tipo="Informe terapéutico",
            fecha="2026-04-01",
            descripcion="Se observa buena respuesta a consignas estructuradas y apoyo visual."
        ),
        Report(
            student_id=students[1].id,
            autor="Prof. Carlos Diaz",
            tipo="Informe pedagógico",
            fecha="2026-04-03",
            descripcion="Presenta avances en participación oral y seguimiento de rutinas."
        ),
        Report(
            student_id=students[4].id,
            autor="Lic. Paula Rios",
            tipo="Informe interdisciplinario",
            fecha="2026-04-07",
            descripcion="Se recomienda sostener consignas breves y apoyos concretos en matemática."
        ),
        Report(
            student_id=students[7].id,
            autor="Lic. Marina Salas",
            tipo="Informe pedagógico",
            fecha="2026-04-09",
            descripcion="La alumna responde favorablemente a secuencias escalonadas y trabajo individual."
        )
    ]

    db.session.add_all(reports)
    db.session.commit()

    print("Informes creados correctamente.")

    print("Creando visitas...")

    visits = [
        Visit(
            student_id=students[0].id,
            fecha="2026-04-10",
            profesional=integrador_1.full_name,
            observaciones="Visita programada con familia y escuela para revisar adaptaciones vigentes."
        ),
        Visit(
            student_id=students[1].id,
            fecha="2026-04-11",
            profesional=integrador_1.full_name,
            observaciones="Entrevista con docente para revisar avances en lenguaje y participación oral."
        ),
        Visit(
            student_id=students[2].id,
            fecha="2026-04-12",
            profesional=integrador_1.full_name,
            observaciones="Seguimiento en aula sobre tiempos atencionales y ubicación en el espacio."
        ),
        Visit(
            student_id=students[3].id,
            fecha="2026-04-13",
            profesional=integrador_1.full_name,
            observaciones="Observación de interacción con pares y comprensión de consignas breves."
        ),
        Visit(
            student_id=students[4].id,
            fecha="2026-04-14",
            profesional=integrador_1.full_name,
            observaciones="Revisión de adaptaciones en matemática junto al equipo docente."
        ),
        Visit(
            student_id=students[5].id,
            fecha="2026-04-15",
            profesional=integrador_2.full_name,
            observaciones="Observación de interacción social y comprensión de consignas grupales."
        ),
        Visit(
            student_id=students[6].id,
            fecha="2026-04-16",
            profesional=integrador_2.full_name,
            observaciones="Seguimiento de rutinas, anticipación visual y permanencia en tarea."
        ),
        Visit(
            student_id=students[7].id,
            fecha="2026-04-17",
            profesional=integrador_2.full_name,
            observaciones="Encuentro con familia para compartir estrategias de estudio y organización."
        ),
        Visit(
            student_id=students[8].id,
            fecha="2026-04-18",
            profesional=integrador_2.full_name,
            observaciones="Reunión con equipo docente para ajustar apoyos de lectura y escritura."
        ),
        Visit(
            student_id=students[9].id,
            fecha="2026-04-19",
            profesional=integrador_2.full_name,
            observaciones="Observación inicial de adaptación áulica y respuesta a consignas individuales."
        )
    ]

    db.session.add_all(visits)
    db.session.commit()

    print("Visitas creadas correctamente.")
    print("Carga manual finalizada con éxito.")
    print("")
    print("Usuarios disponibles:")
    print("  admin@eintegracion.com / Admin123!")
    print("  integrador1@eintegracion.com / Admin123!")
    print("  integrador2@eintegracion.com / Admin123!")
    print("  docente@eintegracion.com / Admin123!")


if __name__ == "__main__":
    app = create_app()

    with app.app_context():
        run_manual_seed()