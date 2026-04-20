import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

/**
 * Página de Login.
 *
 * Responsabilidades:
 * - Capturar email y contraseña
 * - Llamar al backend (/login)
 * - Guardar usuario en localStorage
 * - Redirigir a /students si login es correcto
 */
export default function Login() {
  const navigate = useNavigate();

  // Estado del formulario
  const [form, setForm] = useState({
    email: "admin@eintegracion.com",
    password: "Admin123!"
  });

  // Estado de UI
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Maneja cambios en inputs
   */
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  /**
   * Envía datos al backend para autenticación
   */
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify(form)
      });

      // Se guarda el usuario en localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirección al listado de alumnos
      navigate("/students");

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
        <h2>Bienvenido</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Usuario"
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Login"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <p className="helper-text">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}