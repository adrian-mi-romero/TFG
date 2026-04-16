from flask import Flask, jsonify, request
from flask_cors import CORS
from mock_data import users, students, contents, reports, visits

app = Flask(__name__)
CORS(app)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    for user in users:
        if user["email"].lower() == email and user["password"] == password:
            return jsonify({
                "message": "Login correcto",
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"]
                }
            }), 200

    return jsonify({"error": "Credenciales inválidas"}), 401


@app.route("/api/students", methods=["GET"])
def get_students():
    query = request.args.get("q", "").strip().lower()

    if not query:
        return jsonify(students), 200

    filtered_students = []
    for student in students:
        full_name = f"{student['nombre']} {student['apellido']}".lower()
        if (
            query in full_name
            or query in student["legajo"].lower()
            or query in student["escuela"].lower()
        ):
            filtered_students.append(student)

    return jsonify(filtered_students), 200


@app.route("/api/students/<int:student_id>", methods=["GET"])
def get_student(student_id):
    student = next((s for s in students if s["id"] == student_id), None)

    if not student:
        return jsonify({"error": "Alumno no encontrado"}), 404

    return jsonify(student), 200


@app.route("/api/students/<int:student_id>/contents", methods=["GET"])
def get_student_contents(student_id):
    return jsonify(contents.get(student_id, [])), 200


@app.route("/api/students/<int:student_id>/reports", methods=["GET"])
def get_student_reports(student_id):
    return jsonify(reports.get(student_id, [])), 200


@app.route("/api/students/<int:student_id>/visits", methods=["GET"])
def get_student_visits(student_id):
    return jsonify(visits.get(student_id, [])), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)