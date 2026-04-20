import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

/**
 * Dashboard principal de la aplicación.
 *
 * Responsabilidades:
 * - Mostrar resumen general del sistema
 * - Mostrar accesos rápidos
 * - Centralizar la navegación inicial después del login
 */
export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    students: 0,
    contents: 0,
    reports: 0,
    visits: 0
  });

  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  /**
   * Carga datos del dashboard
   */
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    loadDashboardData();
  }, []);

  /**
   * Obtiene alumnos y calcula estadísticas generales.
   *
   * Para esta versión del MVP:
   * - se consulta la lista de alumnos
   * - luego se obtienen contenidos, informes y visitas por alumno
   * - se agregan los totales
   */
  async function loadDashboardData() {
    setLoading(true);

    try {
      const students = await apiRequest("/students");
      setRecentStudents(students.slice(0, 5));

      let totalContents = 0;
      let totalReports = 0;
      let totalVisits = 0;

      const detailPromises = students.map(async (student) => {
        const [contents, reports, visits] = await Promise.all([
          apiRequest(`/students/${student.id}/contents`),
          apiRequest(`/students/${student.id}/reports`),
          apiRequest(`/students/${student.id}/visits`)
        ]);

        totalContents += contents.length;
        totalReports += reports.length;
        totalVisits += visits.length;
      });

      await Promise.all(detailPromises);

      setStats({
        students: students.length,
        contents: totalContents,
        reports: totalReports,
        visits: totalVisits
      });
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
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
          <p>Panel principal</p>
        </div>

        <div className="topbar-actions">
          <span>{user?.full_name} ({user?.role})</span>
          <button onClick={handleLogout}>Salir</button>
        </div>
      </header>

      {loading ? (
        <section className="card">
          <p>Cargando dashboard...</p>
        </section>
      ) : (
        <>
          <section className="dashboard-grid">
            <div className="dashboard-stat-card">
              <h3>Alumnos</h3>
              <p className="dashboard-stat-value">{stats.students}</p>
            </div>

            <div className="dashboard-stat-card">
              <h3>Contenidos</h3>
              <p className="dashboard-stat-value">{stats.contents}</p>
            </div>

            <div className="dashboard-stat-card">
              <h3>Informes</h3>
              <p className="dashboard-stat-value">{stats.reports}</p>
            </div>

            <div className="dashboard-stat-card">
              <h3>Visitas</h3>
              <p className="dashboard-stat-value">{stats.visits}</p>
            </div>
          </section>

          <section className="dashboard-actions-grid">
            <div className="card dashboard-card">
              <h2>Accesos rápidos</h2>
              <div className="dashboard-actions">
                <Link to="/students" className="primary-link-button">
                  Ver alumnos
                </Link>

                <Link to="/students/new" className="primary-link-button">
                  Crear alumno
                </Link>
              </div>
            </div>

            <div className="card dashboard-card">
              <h2>Últimos alumnos</h2>

              {recentStudents.length === 0 ? (
                <p>No hay alumnos cargados.</p>
              ) : (
                <div className="dashboard-list">
                  {recentStudents.map((student) => (
                    <Link
                      key={student.id}
                      to={`/students/${student.id}`}
                      className="dashboard-list-item"
                    >
                      <div>
                        <strong>{student.nombre} {student.apellido}</strong>
                        <p>{student.legajo}</p>
                      </div>
                      <span>{student.escuela}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}