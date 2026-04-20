import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

/**
 * Página para crear un nuevo alumno.
 *
 * Responsabilidades:
 * - Mostrar formulario de alta
 * - Validar campos obligatorios básicos
 * - Enviar datos al backend
 * - Redirigir al listado al crear correctamente
 */
export default function CreateStudent() {
  const navigate = useNavigate();

  // Estado del formulario
  const [form, setForm] = useState({
    legajo: "",
    nombre: "",
    apellido: "",
    escuela: "",
    grado: "",
    diagnostico: "",
    maestro_integrador: "",
    maestro_grado: "",
    direccion: ""
  });

  // Estados de interfaz
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Actualiza el estado del formulario al escribir
   */
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  /**
   * Envía el formulario al backend para crear el alumno
   */
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await apiRequest("/students", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setSuccess("Alumno creado correctamente. Redirigiendo al listado...");

      setTimeout(() => {
        navigate("/students");
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>Nuevo alumno</h1>
          <p>Alta de legajo de alumno</p>
        </div>

        <div className="topbar-actions">
          <Link to="/dashboard" className="topbar-link">
            Dashboard
          </Link>
          <Link to="/students">Volver</Link>
        </div>
      </header>

      <section className="card form-card">
        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-grid">
            <div>
              <label>Legajo</label>
              <input
                type="text"
                name="legajo"
                value={form.legajo}
                onChange={handleChange}
                placeholder="Ej: ALU-003"
              />
            </div>

            <div>
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
              />
            </div>

            <div>
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Apellido"
              />
            </div>

            <div>
              <label>Escuela</label>
              <input
                type="text"
                name="escuela"
                value={form.escuela}
                onChange={handleChange}
                placeholder="Escuela"
              />
            </div>

            <div>
              <label>Grado</label>
              <input
                type="text"
                name="grado"
                value={form.grado}
                onChange={handleChange}
                placeholder="Ej: 3° A"
              />
            </div>

            <div>
              <label>Diagnóstico</label>
              <input
                type="text"
                name="diagnostico"
                value={form.diagnostico}
                onChange={handleChange}
                placeholder="Diagnóstico"
              />
            </div>

            <div>
              <label>Maestro integrador</label>
              <input
                type="text"
                name="maestro_integrador"
                value={form.maestro_integrador}
                onChange={handleChange}
                placeholder="Maestro integrador"
              />
            </div>

            <div>
              <label>Maestro de grado</label>
              <input
                type="text"
                name="maestro_grado"
                value={form.maestro_grado}
                onChange={handleChange}
                placeholder="Maestro de grado"
              />
            </div>

            <div className="full-width">
              <label>Dirección</label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear alumno"}
            </button>
          </div>
        </form>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </section>
    </div>
  );
}