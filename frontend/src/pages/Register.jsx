import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

/**
 * Opciones de roles disponibles en el sistema.
 * Deben coincidir con los definidos en el backend.
 */
const roleOptions = [
  { value: "padre_tutor", label: "Padre / Tutor" },
  { value: "maestro_grado", label: "Docente" },
  { value: "maestro_integrador", label: "Maestro/a integrador/a" },
  { value: "profesional_terapeutico", label: "Profesional terapéutico" }
];

/**
 * Página de Registro.
 *
 * Responsabilidades:
 * - Capturar datos del usuario
 * - Enviar al backend (/register)
 * - Mostrar errores o confirmación
 * - Redirigir al login
 */
export default function Register() {
  const navigate = useNavigate();

  // Estado del formulario
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "padre_tutor"
  });

  // Estados de UI
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Maneja cambios en inputs y select
   */
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  /**
   * Envía datos al backend para registrar usuario
   */
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify(form)
      });

      // Mensaje de éxito
      setSuccess("Usuario registrado correctamente. Redirigiendo...");

      // Redirige al login luego de 1 segundo
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page center-page">
      <div className="card login-card">
        <h1 className="brand">E-integración</h1>
        <h2>Registro</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="full_name"
            placeholder="Nombre completo"
            value={form.full_name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Teléfono"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
          />

          <p className="form-field-label">Tipo de perfil de usuario</p>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="select-input"
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarte"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <p className="helper-text">
          ¿Ya tienes cuenta? <Link to="/">Volver al login</Link>
        </p>
      </div>
    </div>
  );
}