import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    fetchStudents();
  }, []);

  const fetchStudents = async (query = "") => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/students?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error obteniendo alumnos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(search);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>E-integración</h1>
          <p>Buscador de alumnos</p>
        </div>

        <div className="topbar-actions">
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Salir</button>
        </div>
      </header>

      <section className="card">
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
                    <Link to={`/students/${student.id}`}>Ver legajo</Link>
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