from app import create_app
from app.extensions import db
from app.models import User
from app.utils.auth import hash_password


def run_manual_users_seed():
    """
    Carga manual de usuarios por perfil:
    - maestro_integrador
    - maestro_grado
    - padre_tutor
    - profesional_terapeutico

    Reglas:
    - No duplica emails existentes
    - Inserta únicamente los usuarios faltantes
    """

    default_password = "Admin123!"

    users_to_seed = [
        # Maestros integradores
        {"full_name": "Lucia Perez", "email": "integrador1@eintegracion.com", "role": "maestro_integrador"},
        {"full_name": "Sofia Martinez", "email": "integrador2@eintegracion.com", "role": "maestro_integrador"},

        # Docentes (maestro_grado)
        {"full_name": "Carlos Diaz", "email": "docente1@eintegracion.com", "role": "maestro_grado"},
        {"full_name": "Mariana Lopez", "email": "docente2@eintegracion.com", "role": "maestro_grado"},
        {"full_name": "Florencia Rivas", "email": "docente3@eintegracion.com", "role": "maestro_grado"},
        {"full_name": "Daniela Ferreyra", "email": "docente4@eintegracion.com", "role": "maestro_grado"},

        # Padres / tutores
        {"full_name": "Laura Gomez", "email": "padre1@eintegracion.com", "role": "padre_tutor"},
        {"full_name": "Jorge Fernandez", "email": "padre2@eintegracion.com", "role": "padre_tutor"},
        {"full_name": "Silvia Ruiz", "email": "padre3@eintegracion.com", "role": "padre_tutor"},
        {"full_name": "Hector Sosa", "email": "padre4@eintegracion.com", "role": "padre_tutor"},
        {"full_name": "Paula Ledesma", "email": "padre5@eintegracion.com", "role": "padre_tutor"},
        {"full_name": "Natalia Quiroga", "email": "padre6@eintegracion.com", "role": "padre_tutor"},

        # Profesionales terapéuticos
        {"full_name": "Lic. Ana Torres", "email": "profesional1@eintegracion.com", "role": "profesional_terapeutico"},
        {"full_name": "Lic. Paula Rios", "email": "profesional2@eintegracion.com", "role": "profesional_terapeutico"},
        {"full_name": "Lic. Marina Salas", "email": "profesional3@eintegracion.com", "role": "profesional_terapeutico"},
        {"full_name": "Lic. Damian Ibarra", "email": "profesional4@eintegracion.com", "role": "profesional_terapeutico"},
    ]

    created = 0
    skipped = 0

    for item in users_to_seed:
        existing = User.query.filter_by(email=item["email"].lower()).first()

        if existing:
            skipped += 1
            continue

        user = User(
            full_name=item["full_name"],
            email=item["email"].lower(),
            password_hash=hash_password(default_password),
            role=item["role"]
        )

        db.session.add(user)
        created += 1

    if created > 0:
        db.session.commit()

    print("Carga de usuarios finalizada.")
    print(f"- Creados: {created}")
    print(f"- Omitidos (ya existían): {skipped}")
    print("")
    print("Credencial por defecto para los usuarios creados:")
    print(f"- Password: {default_password}")


if __name__ == "__main__":
    app = create_app()

    with app.app_context():
        run_manual_users_seed()
