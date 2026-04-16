users = [
    {
        "id": 1,
        "name": "Adrian Romero",
        "email": "admin@eintegracion.com",
        "password": "Admin123!",
        "role": "admin"
    },
    {
        "id": 2,
        "name": "Lucia Perez",
        "email": "maestra@eintegracion.com",
        "password": "Maestra123!",
        "role": "maestro_integrador"
    }
]

students = [
    {
        "id": 1,
        "legajo": "ALU-001",
        "nombre": "Tomás",
        "apellido": "Gómez",
        "escuela": "Escuela Primaria N° 15",
        "grado": "3° A",
        "diagnostico": "TEA",
        "maestro_integrador": "Lucia Perez",
        "maestro_grado": "Mariana Lopez",
        "direccion": "Av. Siempre Viva 123"
    },
    {
        "id": 2,
        "legajo": "ALU-002",
        "nombre": "Valentina",
        "apellido": "Fernandez",
        "escuela": "Colegio San Martín",
        "grado": "2° B",
        "diagnostico": "Trastorno del lenguaje",
        "maestro_integrador": "Lucia Perez",
        "maestro_grado": "Carlos Diaz",
        "direccion": "Mitre 456"
    }
]

contents = {
    1: [
        {
            "id": 1,
            "materia": "Matemática",
            "titulo": "Números hasta 100",
            "descripcion": "Actividades adaptadas de conteo y sumas simples.",
            "progreso": 60
        },
        {
            "id": 2,
            "materia": "Lengua",
            "titulo": "Comprensión lectora",
            "descripcion": "Lectura de textos breves con apoyo visual.",
            "progreso": 40
        }
    ],
    2: [
        {
            "id": 3,
            "materia": "Lengua",
            "titulo": "Pronunciación y vocabulario",
            "descripcion": "Ejercicios de palabras simples y asociación visual.",
            "progreso": 75
        }
    ]
}

reports = {
    1: [
        {
            "id": 1,
            "autor": "Lic. Ana Torres",
            "tipo": "Informe terapéutico",
            "fecha": "2026-04-01",
            "descripcion": "Se observa buena respuesta a consignas estructuradas."
        }
    ],
    2: [
        {
            "id": 2,
            "autor": "Prof. Carlos Diaz",
            "tipo": "Informe pedagógico",
            "fecha": "2026-04-03",
            "descripcion": "Presenta avances en participación oral."
        }
    ]
}

visits = {
    1: [
        {
            "id": 1,
            "fecha": "2026-04-10",
            "profesional": "Lucia Perez",
            "observaciones": "Visita programada con familia y escuela."
        }
    ],
    2: [
        {
            "id": 2,
            "fecha": "2026-04-12",
            "profesional": "Lucia Perez",
            "observaciones": "Seguimiento de adaptación en aula."
        }
    ]
}