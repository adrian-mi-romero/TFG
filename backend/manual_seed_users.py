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
        {"full_name": "Lucia Perez", "email": "integrador1@eintegracion.com", "phone": "+34 913 456 789", "role": "maestro_integrador"},
        {"full_name": "Sofia Martinez", "email": "integrador2@eintegracion.com", "phone": "+34 914 567 890", "role": "maestro_integrador"},

        # Docentes (maestro_grado)
        {"full_name": "Carlos Diaz", "email": "docente1@eintegracion.com", "phone": "+34 915 678 901", "role": "maestro_grado"},
        {"full_name": "Mariana Lopez", "email": "docente2@eintegracion.com", "phone": "+34 916 789 012", "role": "maestro_grado"},
        {"full_name": "Florencia Rivas", "email": "docente3@eintegracion.com", "phone": "+34 917 890 123", "role": "maestro_grado"},
        {"full_name": "Daniela Ferreyra", "email": "docente4@eintegracion.com", "phone": "+34 918 901 234", "role": "maestro_grado"},

        # Padres / tutores
        {"full_name": "Laura Gomez", "email": "padre1@eintegracion.com", "phone": "+34 919 012 345", "role": "padre_tutor"},
        {"full_name": "Jorge Fernandez", "email": "padre2@eintegracion.com", "phone": "+34 920 123 456", "role": "padre_tutor"},
        {"full_name": "Silvia Ruiz", "email": "padre3@eintegracion.com", "phone": "+34 921 234 567", "role": "padre_tutor"},
        {"full_name": "Hector Sosa", "email": "padre4@eintegracion.com", "phone": "+34 922 345 678", "role": "padre_tutor"},
        {"full_name": "Paula Ledesma", "email": "padre5@eintegracion.com", "phone": "+34 923 456 789", "role": "padre_tutor"},
        {"full_name": "Natalia Quiroga", "email": "padre6@eintegracion.com", "phone": "+34 924 567 890", "role": "padre_tutor"},

        # Profesionales terapéuticos
        {"full_name": "Lic. Ana Torres", "email": "profesional1@eintegracion.com", "phone": "+34 925 678 901", "role": "profesional_terapeutico"},
        {"full_name": "Lic. Paula Rios", "email": "profesional2@eintegracion.com", "phone": "+34 926 789 012", "role": "profesional_terapeutico"},
        {"full_name": "Lic. Marina Salas", "email": "profesional3@eintegracion.com", "phone": "+34 927 890 123", "role": "profesional_terapeutico"},
        {"full_name": "Lic. Damian Ibarra", "email": "profesional4@eintegracion.com", "phone": "+34 928 901 234", "role": "profesional_terapeutico"},
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
            phone=item.get("phone"),
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
