# E-integración · TFG

Aplicación web para gestión de legajos de integración escolar.

Incluye:
- Backend en Flask + SQLAlchemy + MariaDB
- Frontend en React (Vite)
- Carga de alumnos, contenidos adaptados, informes, visitas y foto de alumno
- Asignación de alumnos a maestros integradores

---

## Requisitos

- Linux / macOS / Windows con WSL recomendado
- Python 3.10+
- Node.js 18+
- Docker

---

## Estructura del proyecto

```text
TFG/
├── backend/
│   ├── create_school_mariadb.sh
│   ├── manual_seed.py
│   ├── run.py
│   └── app/
├── frontend/
│   ├── package.json
│   └── src/
└── README.md
```

---

## 1) Levantar base de datos (MariaDB en Docker)

Desde `backend/`:

```bash
chmod +x create_school_mariadb.sh
./create_school_mariadb.sh
```

Este script:
- levanta el contenedor `school-mariadb`
- expone MariaDB en el puerto `3307`
- crea la base `school_integration_db`
- recrea tablas (`users`, `students`, `student_assignments`, `adapted_contents`, `reports`, `visits`)

> Nota: el script elimina/recrea tablas, pensado para entorno local de desarrollo.

---

## 2) Backend

Desde `backend/`:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 manual_seed.py
python3 run.py
```

Backend disponible en:
- `http://localhost:5000`

### Configuración de DB usada por backend

Definida en `backend/app/config.py`:
- Host: `localhost`
- Puerto: `3307`
- DB: `school_integration_db`
- User: `school_user`
- Password: `school_pass`

---

## 3) Frontend

Desde `frontend/`:

```bash
npm install
npm run dev
```

Frontend disponible en:
- `http://localhost:5173`

El frontend consume API en `http://localhost:5000/api`.

---

## Datos de prueba (manual_seed)

`manual_seed.py` crea:
- 4 usuarios
- 10 alumnos (`ALU-001` a `ALU-010`)
- asignaciones: 5 alumnos para `integrador1` y 5 para `integrador2`
- contenidos adaptados, informes y visitas de ejemplo

### Credenciales iniciales

- `admin@eintegracion.com` / `Admin123!`
- `integrador1@eintegracion.com` / `Admin123!`
- `integrador2@eintegracion.com` / `Admin123!`
- `docente@eintegracion.com` / `Admin123!`

---

## Roles y permisos (resumen)

- `admin`
	- acceso total
	- puede borrar alumnos
- `maestro_integrador`
	- puede crear alumnos
	- puede editar alumnos asignados
- `maestro_grado`
	- acceso según asignación

El control de acceso se aplica por cabecera `X-USER-ID` en el backend.

---

## Endpoints principales

### Auth
- `POST /api/register`
- `POST /api/login`

### Alumnos
- `GET /api/students`
- `POST /api/students`
- `GET /api/students/:id`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`

### Foto de alumno
- `POST /api/students/:id/photo`
- `DELETE /api/students/:id/photo`
- `GET /api/students/:id/photo/view`

### Contenidos adaptados
- `GET /api/students/:id/contents`
- `POST /api/students/:id/contents`
- `PUT /api/students/:id/contents/:contentId`
- `DELETE /api/students/:id/contents/:contentId`

### Informes
- `GET /api/students/:id/reports`
- `POST /api/students/:id/reports`
- `PUT /api/students/:id/reports/:reportId`
- `DELETE /api/students/:id/reports/:reportId`
- `GET /api/students/:id/reports/:reportId/download`

### Visitas
- `GET /api/students/:id/visits`
- `POST /api/students/:id/visits`
- `PUT /api/students/:id/visits/:visitId`
- `DELETE /api/students/:id/visits/:visitId`

---

## Archivos y uploads

Se guardan en:
- `backend/uploads/students/` (fotos)
- `backend/uploads/reports/` (adjuntos)

Límite máximo por request:
- `16 MB`

---

## Problemas comunes

### Error 401 en endpoints protegidos
Verificar que el request incluya cabecera `X-USER-ID` con un usuario válido.

### MariaDB no levanta
- Revisar que Docker esté activo
- Verificar que el puerto `3307` no esté ocupado

### `manual_seed.py` no inserta
Si ya existe algún usuario, el seed no vuelve a insertar datos.

---

## Comandos rápidos

Backend (terminal 1):

```bash
cd backend
source .venv/bin/activate
python3 run.py
```

Frontend (terminal 2):

```bash
cd frontend
npm run dev
```

---

## Estado actual

Proyecto en desarrollo académico (TFG), con flujo completo de:
- autenticación
- gestión de legajos
- carga de foto
- carga/descarga de adjuntos de informes
- dashboard con métricas y alertas
- calendario y seguimiento de visitas