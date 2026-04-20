import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

/**
 * Página de listado de alumnos.
 *
 * Responsabilidades:
 * - Obtener alumnos desde el backend
 * - Permitir búsqueda por texto
 * - Mostrar listado en tabla
 * - Navegar a crear alumno
 * - Manejar logout
 */
export default function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  /**
   * Carga inicial de alumnos
   */
  useEffect(() => {
    fetchStudents();
  }, []);

  /**
   * Obtiene alumnos desde el backend
   */
  async function fetchStudents(query = "") {
    setLoading(true);

    try {
      const data = await apiRequest(`/students?q=${encodeURIComponent(query)}`);
      setStudents(data);
    } catch (error) {
      console.error("Error obteniendo alumnos:", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Maneja búsqueda
   */
  function handleSearch(e) {
    e.preventDefault();
    fetchStudents(search);
  }

  /**
   * Cierra sesión
   */
  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>E-integración</h1>
          <p>Buscador de alumnos</p>
        </div>

        <div className="topbar-actions">
          <Link to="/dashboard" className="topbar-link">
            Dashboard
          </Link>
          <span>{user?.full_name} ({user?.role})</span>
          <button onClick={handleLogout}>Salir</button>
        </div>
      </header>

      <section className="card">
        <div className="section-actions">
          <Link to="/students/new" className="primary-link-button">
            Nuevo alumno
          </Link>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Buscar por nombre, legajo o escuela"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>

        {loading ? (
          <p>Cargando alumnos...</p>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Legajo</th>
                <th>Colegio</th>
                <th>Maestro de grado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.nombre} {student.apellido}</td>
                  <td>{student.legajo}</td>
                  <td>{student.escuela}</td>
                  <td>{student.maestro_grado}</td>
                  <td>
                    <Link to={`/students/${student.id}`}>
                      Ver legajo
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}