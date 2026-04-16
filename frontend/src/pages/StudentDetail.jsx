import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [contents, setContents] = useState([]);
  const [reports, setReports] = useState([]);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState("datos");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      navigate("/");
      return;
    }

    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      const [studentRes, contentsRes, reportsRes, visitsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/students/${id}`),
        fetch(`http://localhost:5000/api/students/${id}/contents`),
        fetch(`http://localhost:5000/api/students/${id}/reports`),
        fetch(`http://localhost:5000/api/students/${id}/visits`)
      ]);

      const studentData = await studentRes.json();
      const contentsData = await contentsRes.json();
      const reportsData = await reportsRes.json();
      const visitsData = await visitsRes.json();

      setStudent(studentData);
      setContents(contentsData);
      setReports(reportsData);
      setVisits(visitsData);
    } catch (error) {
      console.error("Error cargando detalle del alumno:", error);
    }
  };

  if (!student) {
    return <div className="page"><p>Cargando legajo...</p></div>;
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>Legajo del alumno</h1>
          <p>{student.nombre} {student.apellido} - {student.legajo}</p>
        </div>
        <Link to="/students">Volver</Link>
      </header>

      <div className="tabs">
        <button onClick={() => setActiveTab("datos")} className={activeTab === "datos" ? "active" : ""}>
          Datos
        </button>
        <button onClick={() => setActiveTab("contenidos")} className={activeTab === "contenidos" ? "active" : ""}>
          Contenidos
        </button>
        <button onClick={() => setActiveTab("informes")} className={activeTab === "informes" ? "active" : ""}>
          Informes
        </button>
        <button onClick={() => setActiveTab("visitas")} className={activeTab === "visitas" ? "active" : ""}>
          Visitas
        </button>
      </div>

      {activeTab === "datos" && (
        <section className="card">
          <h2>Datos generales</h2>
          <p><strong>Nombre:</strong> {student.nombre} {student.apellido}</p>
          <p><strong>Legajo:</strong> {student.legajo}</p>
          <p><strong>Escuela:</strong> {student.escuela}</p>
          <p><strong>Grado:</strong> {student.grado}</p>
          <p><strong>Diagnóstico:</strong> {student.diagnostico}</p>
          <p><strong>Maestro integrador:</strong> {student.maestro_integrador}</p>
          <p><strong>Maestro de grado:</strong> {student.maestro_grado}</p>
          <p><strong>Dirección:</strong> {student.direccion}</p>
        </section>
      )}

      {activeTab === "contenidos" && (
        <section className="card">
          <h2>Contenidos adaptados</h2>
          {contents.map((item) => (
            <div key={item.id} className="content-card">
              <p><strong>Materia:</strong> {item.materia}</p>
              <p><strong>Título:</strong> {item.titulo}</p>
              <p>{item.descripcion}</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${item.progreso}%` }}>
                  {item.progreso}%
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {activeTab === "informes" && (
        <section className="card">
          <h2>Informes</h2>
          {reports.map((item) => (
            <div key={item.id} className="content-card">
              <p><strong>Autor:</strong> {item.autor}</p>
              <p><strong>Tipo:</strong> {item.tipo}</p>
              <p><strong>Fecha:</strong> {item.fecha}</p>
              <p>{item.descripcion}</p>
            </div>
          ))}
        </section>
      )}

      {activeTab === "visitas" && (
        <section className="card">
          <h2>Calendario de visitas</h2>
          {visits.map((item) => (
            <div key={item.id} className="content-card">
              <p><strong>Fecha:</strong> {item.fecha}</p>
              <p><strong>Profesional:</strong> {item.profesional}</p>
              <p>{item.observaciones}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}