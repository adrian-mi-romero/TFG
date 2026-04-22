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
    visits: 0,
    withPhoto: 0,
    avgProgress: 0
  });

  const [recentStudents, setRecentStudents] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [studentsWithoutReports, setStudentsWithoutReports] = useState([]);
  const [studentsWithoutVisits, setStudentsWithoutVisits] = useState([]);
  const [studentsByIntegrator, setStudentsByIntegrator] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const canCreateStudents = user?.role === "admin" || user?.role === "maestro_integrador";

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
    setError("");

    try {
      const students = await apiRequest("/students");
      const detailPromises = students.map(async (student) => {
        const [contents, reports, visits] = await Promise.all([
          apiRequest(`/students/${student.id}/contents`),
          apiRequest(`/students/${student.id}/reports`),
          apiRequest(`/students/${student.id}/visits`)
        ]);

        return {
          student,
          contents,
          reports,
          visits
        };
      });

      const details = await Promise.all(detailPromises);

      const totalContents = details.reduce((total, item) => total + item.contents.length, 0);
      const totalReports = details.reduce((total, item) => total + item.reports.length, 0);
      const totalVisits = details.reduce((total, item) => total + item.visits.length, 0);
      const studentsWithPhoto = students.filter((student) => student.has_photo).length;

      const allContents = details.flatMap((item) => item.contents);
      const averageProgress = allContents.length === 0
        ? 0
        : Math.round(
            allContents.reduce((total, content) => total + Number(content.progreso || 0), 0) / allContents.length
          );

      const sortedRecentStudents = [...students]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      const sortedRecentReports = details
        .flatMap((item) =>
          item.reports.map((report) => ({
            ...report,
            studentId: item.student.id,
            studentName: `${item.student.nombre} ${item.student.apellido}`,
            studentLegajo: item.student.legajo
          }))
        )
        .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
        .slice(0, 5);

      const sortedRecentVisits = details
        .flatMap((item) =>
          item.visits.map((visit) => ({
            ...visit,
            studentId: item.student.id,
            studentName: `${item.student.nombre} ${item.student.apellido}`,
            studentLegajo: item.student.legajo
          }))
        )
        .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
        .slice(0, 5);

      const missingReports = details
        .filter((item) => item.reports.length === 0)
        .map((item) => item.student)
        .slice(0, 5);

      const missingVisits = details
        .filter((item) => item.visits.length === 0)
        .map((item) => item.student)
        .slice(0, 5);

      const integratorMap = students.reduce((accumulator, student) => {
        const integratorName = student.maestro_integrador || "Sin asignar";
        accumulator[integratorName] = (accumulator[integratorName] || 0) + 1;
        return accumulator;
      }, {});

      const integratorDistribution = Object.entries(integratorMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

      setStats({
        students: students.length,
        contents: totalContents,
        reports: totalReports,
        visits: totalVisits,
        withPhoto: studentsWithPhoto,
        avgProgress: averageProgress
      });
      setRecentStudents(sortedRecentStudents);
      setRecentReports(sortedRecentReports);
      setRecentVisits(sortedRecentVisits);
      setStudentsWithoutReports(missingReports);
      setStudentsWithoutVisits(missingVisits);
      setStudentsByIntegrator(integratorDistribution);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      setError(error.message || "No se pudo cargar el dashboard.");
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
          {error && (
            <section className="card dashboard-card dashboard-card-alert">
              <p className="error">{error}</p>
            </section>
          )}

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

            <div className="dashboard-stat-card">
              <h3>Con foto</h3>
              <p className="dashboard-stat-value">{stats.withPhoto}</p>
              <p className="dashboard-stat-help">{stats.students - stats.withPhoto} pendientes</p>
            </div>

            <div className="dashboard-stat-card">
              <h3>Progreso promedio</h3>
              <p className="dashboard-stat-value">{stats.avgProgress}%</p>
              <p className="dashboard-stat-help">sobre contenidos adaptados</p>
            </div>
          </section>

          <section className="dashboard-layout">
            <div className="dashboard-main-column">
              <div className="card dashboard-card">
                <h2>Accesos rápidos</h2>
                <div className="dashboard-actions">
                  <Link to="/students" className="primary-link-button">
                    Ver alumnos
                  </Link>

                  {canCreateStudents && (
                    <Link to="/students/new" className="primary-link-button">
                      Crear alumno
                    </Link>
                  )}
                </div>
              </div>

              <div className="dashboard-compact-grid dashboard-section-spacing">
                <div className="card dashboard-card">
                  <h2>Últimos alumnos</h2>

                  {recentStudents.length === 0 ? (
                    <p>No hay alumnos cargados.</p>
                  ) : (
                    <div className="dashboard-list dashboard-list-compact">
                      {recentStudents.slice(0, 4).map((student) => (
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

                <div className="card dashboard-card">
                  <h2>Últimos informes</h2>

                  {recentReports.length === 0 ? (
                    <p>No hay informes cargados.</p>
                  ) : (
                    <div className="dashboard-list dashboard-list-compact">
                      {recentReports.slice(0, 4).map((report) => (
                        <Link
                          key={`report-${report.id}`}
                          to={`/students/${report.studentId}`}
                          className="dashboard-list-item"
                        >
                          <div>
                            <strong>{report.tipo}</strong>
                            <p>{report.studentName} · {report.studentLegajo}</p>
                          </div>
                          <span>{report.fecha}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card dashboard-card">
                  <h2>Últimas visitas</h2>

                  {recentVisits.length === 0 ? (
                    <p>No hay visitas registradas.</p>
                  ) : (
                    <div className="dashboard-list dashboard-list-compact">
                      {recentVisits.slice(0, 4).map((visit) => (
                        <Link
                          key={`visit-${visit.id}`}
                          to={`/students/${visit.studentId}`}
                          className="dashboard-list-item"
                        >
                          <div>
                            <strong>{visit.profesional}</strong>
                            <p>{visit.studentName} · {visit.studentLegajo}</p>
                          </div>
                          <span>{visit.fecha}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="dashboard-side-column">
              <div className="card dashboard-card">
                <h2>Alertas</h2>

                <div className="dashboard-alert-block">
                  <h3>Sin informes</h3>
                  {studentsWithoutReports.length === 0 ? (
                    <p>Todos los alumnos tienen informe.</p>
                  ) : (
                    <div className="dashboard-list dashboard-list-compact">
                      {studentsWithoutReports.slice(0, 4).map((student) => (
                        <Link
                          key={`missing-report-${student.id}`}
                          to={`/students/${student.id}`}
                          className="dashboard-list-item"
                        >
                          <div>
                            <strong>{student.nombre} {student.apellido}</strong>
                            <p>{student.legajo}</p>
                          </div>
                          <span>Falta</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="dashboard-alert-block">
                  <h3>Sin visitas</h3>
                  {studentsWithoutVisits.length === 0 ? (
                    <p>Todos los alumnos tienen visitas.</p>
                  ) : (
                    <div className="dashboard-list dashboard-list-compact">
                      {studentsWithoutVisits.slice(0, 4).map((student) => (
                        <Link
                          key={`missing-visit-${student.id}`}
                          to={`/students/${student.id}`}
                          className="dashboard-list-item"
                        >
                          <div>
                            <strong>{student.nombre} {student.apellido}</strong>
                            <p>{student.legajo}</p>
                          </div>
                          <span>Falta</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card dashboard-card dashboard-section-spacing">
                <h2>Por integrador</h2>

                {studentsByIntegrator.length === 0 ? (
                  <p>No hay datos disponibles.</p>
                ) : (
                  <div className="dashboard-list dashboard-list-compact">
                    {studentsByIntegrator.map((item) => (
                      <div key={item.name} className="dashboard-list-item">
                        <div>
                          <strong>{item.name}</strong>
                          <p>Alumnos asignados</p>
                        </div>
                        <span className="dashboard-badge">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </section>
        </>
      )}
    </div>
  );
}