import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

/**
 * Página de detalle de alumno (legajo).
 *
 * Responsabilidades:
 * - Obtener datos del alumno
 * - Gestionar foto del alumno
 * - Editar datos generales del alumno
 * - Borrar alumno con confirmación
 * - Obtener contenidos, informes y visitas
 * - Mostrar información en pestañas
 * - Crear, editar y eliminar contenidos adaptados
 * - Crear, editar y eliminar informes
 * - Adjuntar archivo en informes
 * - Crear, editar y eliminar visitas
 */
export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados principales
  const [student, setStudent] = useState(null);
  const [contents, setContents] = useState([]);
  const [reports, setReports] = useState([]);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState("datos");

  // Estados para edición de datos del alumno
  const [editingStudent, setEditingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
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
  const [studentError, setStudentError] = useState("");
  const [studentSuccess, setStudentSuccess] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);

  // Estados para foto del alumno
  const [studentPhotoFile, setStudentPhotoFile] = useState(null);
  const [studentPhotoUrl, setStudentPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoSuccess, setPhotoSuccess] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  // Estados para crear contenido
  const [showContentForm, setShowContentForm] = useState(false);
  const [contentForm, setContentForm] = useState({
    materia: "",
    titulo: "",
    descripcion: "",
    progreso: 0
  });

  // Estados para editar contenido
  const [editingContentId, setEditingContentId] = useState(null);
  const [editContentForm, setEditContentForm] = useState({
    materia: "",
    titulo: "",
    descripcion: "",
    progreso: 0
  });

  // Estados para informes
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    autor: "",
    tipo: "",
    fecha: "",
    descripcion: "",
    attachment: null
  });
  const [editingReportId, setEditingReportId] = useState(null);
  const [editReportForm, setEditReportForm] = useState({
    autor: "",
    tipo: "",
    fecha: "",
    descripcion: "",
    attachment: null,
    remove_attachment: false
  });

  // Estados para visitas
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitForm, setVisitForm] = useState({
    fecha: "",
    profesional: "",
    observaciones: ""
  });
  const [editingVisitId, setEditingVisitId] = useState(null);
  const [editVisitForm, setEditVisitForm] = useState({
    fecha: "",
    profesional: "",
    observaciones: ""
  });

  // Estados de mensajes y carga
  const [contentError, setContentError] = useState("");
  const [contentSuccess, setContentSuccess] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [editingLoading, setEditingLoading] = useState(false);
  const [deletingContentId, setDeletingContentId] = useState(null);

  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [editingReportLoading, setEditingReportLoading] = useState(false);
  const [deletingReportId, setDeletingReportId] = useState(null);

  const [visitError, setVisitError] = useState("");
  const [visitSuccess, setVisitSuccess] = useState("");
  const [visitLoading, setVisitLoading] = useState(false);
  const [editingVisitLoading, setEditingVisitLoading] = useState(false);
  const [deletingVisitId, setDeletingVisitId] = useState(null);

  /**
   * Verifica sesión y carga datos
   */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      navigate("/");
      return;
    }

    fetchStudentData();
  }, [id]);

  /**
   * Sincroniza formulario editable cuando cambian los datos del alumno
   */
  useEffect(() => {
    if (!student) {
      return;
    }

    setStudentForm({
      legajo: student.legajo || "",
      nombre: student.nombre || "",
      apellido: student.apellido || "",
      escuela: student.escuela || "",
      grado: student.grado || "",
      diagnostico: student.diagnostico || "",
      maestro_integrador: student.maestro_integrador || "",
      maestro_grado: student.maestro_grado || "",
      direccion: student.direccion || ""
    });
  }, [student]);

  /**
   * Carga la foto del alumno usando fetch autenticado y genera una URL temporal.
   */
  useEffect(() => {
    let objectUrl = null;
    let canceled = false;

    async function loadStudentPhoto() {
      if (!student?.has_photo) {
        setStudentPhotoUrl("");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "null");

      try {
        const response = await fetch(`http://localhost:5000/api/students/${id}/photo/view`, {
          headers: {
            ...(user?.id ? { "X-USER-ID": String(user.id) } : {})
          }
        });

        if (!response.ok) {
          setStudentPhotoUrl("");
          return;
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (!canceled) {
          setStudentPhotoUrl(objectUrl);
        }
      } catch (error) {
        if (!canceled) {
          setStudentPhotoUrl("");
        }
      }
    }

    loadStudentPhoto();

    return () => {
      canceled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id, student]);

  /**
   * Obtiene toda la información del alumno en paralelo
   */
  async function fetchStudentData() {
    try {
      const [
        studentData,
        contentsData,
        reportsData,
        visitsData
      ] = await Promise.all([
        apiRequest(`/students/${id}`),
        apiRequest(`/students/${id}/contents`),
        apiRequest(`/students/${id}/reports`),
        apiRequest(`/students/${id}/visits`)
      ]);

      setStudent(studentData);
      setContents(contentsData);
      setReports(reportsData);
      setVisits(visitsData);
    } catch (error) {
      console.error("Error cargando detalle del alumno:", error);
    }
  }

  /**
   * Refresca solo los datos del alumno
   */
  async function refreshStudent() {
    const refreshedStudent = await apiRequest(`/students/${id}`);
    setStudent(refreshedStudent);
  }

  /**
   * Obtiene nuevamente los contenidos del alumno
   */
  async function refreshContents() {
    const refreshedContents = await apiRequest(`/students/${id}/contents`);
    setContents(refreshedContents);
  }

  /**
   * Obtiene nuevamente los informes del alumno
   */
  async function refreshReports() {
    const refreshedReports = await apiRequest(`/students/${id}/reports`);
    setReports(refreshedReports);
  }

  /**
   * Obtiene nuevamente las visitas del alumno
   */
  async function refreshVisits() {
    const refreshedVisits = await apiRequest(`/students/${id}/visits`);
    setVisits(refreshedVisits);
  }

  /**
   * Maneja cambios en el formulario de datos del alumno
   */
  function handleStudentFormChange(e) {
    setStudentForm({
      ...studentForm,
      [e.target.name]: e.target.value
    });
  }

  /**
   * Activa edición de datos del alumno
   */
  function handleStartEditStudent() {
    setStudentError("");
    setStudentSuccess("");
    setEditingStudent(true);
  }

  /**
   * Cancela edición de datos del alumno
   */
  function handleCancelEditStudent() {
    if (student) {
      setStudentForm({
        legajo: student.legajo || "",
        nombre: student.nombre || "",
        apellido: student.apellido || "",
        escuela: student.escuela || "",
        grado: student.grado || "",
        diagnostico: student.diagnostico || "",
        maestro_integrador: student.maestro_integrador || "",
        maestro_grado: student.maestro_grado || "",
        direccion: student.direccion || ""
      });
    }

    setStudentError("");
    setStudentSuccess("");
    setEditingStudent(false);
  }

  /**
   * Guarda cambios en los datos del alumno
   */
  async function handleSaveStudentData() {
    setStudentError("");
    setStudentSuccess("");
    setStudentLoading(true);

    try {
      await apiRequest(`/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(studentForm)
      });

      await refreshStudent();
      setStudentSuccess("Datos del alumno actualizados correctamente.");
      setEditingStudent(false);
    } catch (err) {
      setStudentError(err.message);
    } finally {
      setStudentLoading(false);
    }
  }

  /**
   * Elimina el alumno completo con confirmación
   */
  async function handleDeleteStudent() {
    if (!student) {
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar a ${student.nombre} ${student.apellido}? Esta acción borrará también contenidos, informes, visitas, foto y archivos adjuntos.`
    );

    if (!confirmed) {
      return;
    }

    setStudentError("");
    setStudentSuccess("");
    setDeletingStudent(true);

    try {
      await apiRequest(`/students/${id}`, {
        method: "DELETE"
      });

      navigate("/students");
    } catch (err) {
      setStudentError(err.message);
    } finally {
      setDeletingStudent(false);
    }
  }

  /**
   * Maneja selección de archivo de foto
   */
  function handleStudentPhotoChange(e) {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setStudentPhotoFile(file);
  }

  /**
   * Sube o reemplaza la foto del alumno
   */
  async function handleUploadStudentPhoto() {
    if (!studentPhotoFile) {
      setPhotoError("Debes seleccionar una foto.");
      setPhotoSuccess("");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "null");

    setPhotoError("");
    setPhotoSuccess("");
    setPhotoLoading(true);

    try {
      const formData = new FormData();
      formData.append("photo", studentPhotoFile);

      const response = await fetch(`http://localhost:5000/api/students/${id}/photo`, {
        method: "POST",
        headers: {
          ...(user?.id ? { "X-USER-ID": String(user.id) } : {})
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al subir foto");
      }

      setStudentPhotoFile(null);
      setPhotoSuccess("Foto subida correctamente.");
      await refreshStudent();
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setPhotoLoading(false);
    }
  }

  /**
   * Elimina la foto del alumno
   */
  async function handleDeleteStudentPhoto() {
    const confirmed = window.confirm("¿Seguro que quieres eliminar la foto del alumno?");

    if (!confirmed) {
      return;
    }

    setPhotoError("");
    setPhotoSuccess("");
    setDeletingPhoto(true);

    try {
      await apiRequest(`/students/${id}/photo`, {
        method: "DELETE"
      });

      setStudentPhotoFile(null);
      setPhotoSuccess("Foto eliminada correctamente.");
      await refreshStudent();
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setDeletingPhoto(false);
    }
  }

  /**
   * Actualiza campos del formulario de creación de contenido
   */
  function handleContentChange(e) {
    setContentForm({
      ...contentForm,
      [e.target.name]: e.target.value
    });
  }

  /**
   * Reinicia el formulario de creación de contenido
   */
  function resetContentForm() {
    setContentForm({
      materia: "",
      titulo: "",
      descripcion: "",
      progreso: 0
    });
  }

  /**
   * Envía el formulario para crear un nuevo contenido adaptado
   */
  async function handleCreateContent(e) {
    e.preventDefault();

    setContentError("");
    setContentSuccess("");
    setContentLoading(true);

    try {
      await apiRequest(`/students/${id}/contents`, {
        method: "POST",
        body: JSON.stringify({
          materia: contentForm.materia,
          titulo: contentForm.titulo,
          descripcion: contentForm.descripcion,
          progreso: Number(contentForm.progreso)
        })
      });

      resetContentForm();
      setShowContentForm(false);
      setContentSuccess("Contenido creado correctamente.");

      await refreshContents();
    } catch (err) {
      setContentError(err.message);
    } finally {
      setContentLoading(false);
    }
  }

  /**
   * Activa modo edición para un contenido
   */
  function startEditingContent(content) {
    setContentError("");
    setContentSuccess("");
    setEditingContentId(content.id);
    setEditContentForm({
      materia: content.materia,
      titulo: content.titulo,
      descripcion: content.descripcion || "",
      progreso: content.progreso
    });
  }

  /**
   * Cancela edición de contenido
   */
  function cancelEditingContent() {
    setEditingContentId(null);
    setEditContentForm({
      materia: "",
      titulo: "",
      descripcion: "",
      progreso: 0
    });
  }

  /**
   * Maneja cambios en el formulario de edición de contenido
   */
  function handleEditContentChange(e) {
    setEditContentForm({
      ...editContentForm,
      [e.target.name]: e.target.value
    });
  }

  /**
   * Guarda la edición de un contenido
   */
  async function handleSaveEditedContent(contentId) {
    setContentError("");
    setContentSuccess("");
    setEditingLoading(true);

    try {
      await apiRequest(`/students/${id}/contents/${contentId}`, {
        method: "PUT",
        body: JSON.stringify({
          materia: editContentForm.materia,
          titulo: editContentForm.titulo,
          descripcion: editContentForm.descripcion,
          progreso: Number(editContentForm.progreso)
        })
      });

      setContentSuccess("Contenido actualizado correctamente.");
      cancelEditingContent();
      await refreshContents();
    } catch (err) {
      setContentError(err.message);
    } finally {
      setEditingLoading(false);
    }
  }

  /**
   * Elimina un contenido
   */
  async function handleDeleteContent(contentId) {
    const confirmed = window.confirm("¿Seguro que quieres eliminar este contenido?");

    if (!confirmed) {
      return;
    }

    setContentError("");
    setContentSuccess("");
    setDeletingContentId(contentId);

    try {
      await apiRequest(`/students/${id}/contents/${contentId}`, {
        method: "DELETE"
      });

      if (editingContentId === contentId) {
        cancelEditingContent();
      }

      setContentSuccess("Contenido eliminado correctamente.");
      await refreshContents();
    } catch (err) {
      setContentError(err.message);
    } finally {
      setDeletingContentId(null);
    }
  }

  /**
   * Maneja cambios en formulario de creación de informe
   */
  function handleReportChange(e) {
    const { name, value, files } = e.target;

    if (name === "attachment") {
      setReportForm({
        ...reportForm,
        attachment: files && files[0] ? files[0] : null
      });
      return;
    }

    setReportForm({
      ...reportForm,
      [name]: value
    });
  }

  /**
   * Reinicia el formulario de creación de informe
   */
  function resetReportForm() {
    setReportForm({
      autor: "",
      tipo: "",
      fecha: "",
      descripcion: "",
      attachment: null
    });
  }

  /**
   * Crea un nuevo informe
   */
  async function handleCreateReport(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    setReportError("");
    setReportSuccess("");
    setReportLoading(true);

    try {
      const formData = new FormData();
      formData.append("autor", reportForm.autor);
      formData.append("tipo", reportForm.tipo);
      formData.append("fecha", reportForm.fecha);
      formData.append("descripcion", reportForm.descripcion);

      if (reportForm.attachment) {
        formData.append("attachment", reportForm.attachment);
      }

      const response = await fetch(`http://localhost:5000/api/students/${id}/reports`, {
        method: "POST",
        headers: {
          ...(user?.id ? { "X-USER-ID": String(user.id) } : {})
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear informe");
      }

      resetReportForm();
      setShowReportForm(false);
      setReportSuccess("Informe creado correctamente.");

      await refreshReports();
    } catch (err) {
      setReportError(err.message);
    } finally {
      setReportLoading(false);
    }
  }

  /**
   * Activa modo edición para un informe
   */
  function startEditingReport(report) {
    setReportError("");
    setReportSuccess("");
    setEditingReportId(report.id);
    setEditReportForm({
      autor: report.autor,
      tipo: report.tipo,
      fecha: report.fecha,
      descripcion: report.descripcion || "",
      attachment: null,
      remove_attachment: false
    });
  }

  /**
   * Cancela edición de informe
   */
  function cancelEditingReport() {
    setEditingReportId(null);
    setEditReportForm({
      autor: "",
      tipo: "",
      fecha: "",
      descripcion: "",
      attachment: null,
      remove_attachment: false
    });
  }

  /**
   * Maneja cambios en formulario de edición de informe
   */
  function handleEditReportChange(e) {
    const { name, value, files, type, checked } = e.target;

    if (name === "attachment") {
      setEditReportForm({
        ...editReportForm,
        attachment: files && files[0] ? files[0] : null
      });
      return;
    }

    if (type === "checkbox") {
      setEditReportForm({
        ...editReportForm,
        [name]: checked
      });
      return;
    }

    setEditReportForm({
      ...editReportForm,
      [name]: value
    });
  }

  /**
   * Guarda edición de informe
   */
  async function handleSaveEditedReport(reportId) {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    setReportError("");
    setReportSuccess("");
    setEditingReportLoading(true);

    try {
      const formData = new FormData();
      formData.append("autor", editReportForm.autor);
      formData.append("tipo", editReportForm.tipo);
      formData.append("fecha", editReportForm.fecha);
      formData.append("descripcion", editReportForm.descripcion);
      formData.append("remove_attachment", String(editReportForm.remove_attachment));

      if (editReportForm.attachment) {
        formData.append("attachment", editReportForm.attachment);
      }

      const response = await fetch(`http://localhost:5000/api/students/${id}/reports/${reportId}`, {
        method: "PUT",
        headers: {
          ...(user?.id ? { "X-USER-ID": String(user.id) } : {})
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar informe");
      }

      setReportSuccess("Informe actualizado correctamente.");
      cancelEditingReport();
      await refreshReports();
    } catch (err) {
      setReportError(err.message);
    } finally {
      setEditingReportLoading(false);
    }
  }

  /**
   * Elimina un informe
   */
  async function handleDeleteReport(reportId) {
    const confirmed = window.confirm("¿Seguro que quieres eliminar este informe?");

    if (!confirmed) {
      return;
    }

    setReportError("");
    setReportSuccess("");
    setDeletingReportId(reportId);

    try {
      await apiRequest(`/students/${id}/reports/${reportId}`, {
        method: "DELETE"
      });

      if (editingReportId === reportId) {
        cancelEditingReport();
      }

      setReportSuccess("Informe eliminado correctamente.");
      await refreshReports();
    } catch (err) {
      setReportError(err.message);
    } finally {
      setDeletingReportId(null);
    }
  }

  /**
   * Descarga el archivo adjunto de un informe con autenticación.
   */
  async function handleDownloadReportAttachment(report) {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    setReportError("");

    try {
      const response = await fetch(`http://localhost:5000/api/students/${id}/reports/${report.id}/download`, {
        headers: {
          ...(user?.id ? { "X-USER-ID": String(user.id) } : {})
        }
      });

      let data = null;

      if (!response.ok) {
        try {
          data = await response.json();
        } catch (error) {
          data = null;
        }

        throw new Error(data?.error || "Error al descargar el adjunto");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = report.attachment_original_name || `informe_${report.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setReportError(err.message);
    }
  }

  /**
   * Maneja cambios en formulario de creación de visita
   */
  function handleVisitChange(e) {
    setVisitForm({
      ...visitForm,
      [e.target.name]: e.target.value
    });
  }

  /**
   * Reinicia formulario de visita
   */
  function resetVisitForm() {
    setVisitForm({
      fecha: "",
      profesional: "",
      observaciones: ""
    });
  }

  /**
   * Crea una nueva visita
   */
  async function handleCreateVisit(e) {
    e.preventDefault();

    setVisitError("");
    setVisitSuccess("");
    setVisitLoading(true);

    try {
      await apiRequest(`/students/${id}/visits`, {
        method: "POST",
        body: JSON.stringify({
          fecha: visitForm.fecha,
          profesional: visitForm.profesional,
          observaciones: visitForm.observaciones
        })
      });

      resetVisitForm();
      setShowVisitForm(false);
      setVisitSuccess("Visita creada correctamente.");

      await refreshVisits();
    } catch (err) {
      setVisitError(err.message);
    } finally {
      setVisitLoading(false);
    }
  }

  /**
   * Activa modo edición para una visita
   */
  function startEditingVisit(visit) {
    setVisitError("");
    setVisitSuccess("");
    setEditingVisitId(visit.id);
    setEditVisitForm({
      fecha: visit.fecha,
      profesional: visit.profesional,
      observaciones: visit.observaciones || ""
    });
  }

  /**
   * Cancela edición de visita
   */
  function cancelEditingVisit() {
    setEditingVisitId(null);
    setEditVisitForm({
      fecha: "",
      profesional: "",
      observaciones: ""
    });
  }

  /**
   * Maneja cambios en formulario de edición de visita
   */
  function handleEditVisitChange(e) {
    setEditVisitForm({
      ...editVisitForm,
      [e.target.name]: e.target.value
    });
  }

  /**
   * Guarda cambios de una visita
   */
  async function handleSaveEditedVisit(visitId) {
    setVisitError("");
    setVisitSuccess("");
    setEditingVisitLoading(true);

    try {
      await apiRequest(`/students/${id}/visits/${visitId}`, {
        method: "PUT",
        body: JSON.stringify({
          fecha: editVisitForm.fecha,
          profesional: editVisitForm.profesional,
          observaciones: editVisitForm.observaciones
        })
      });

      setVisitSuccess("Visita actualizada correctamente.");
      cancelEditingVisit();
      await refreshVisits();
    } catch (err) {
      setVisitError(err.message);
    } finally {
      setEditingVisitLoading(false);
    }
  }

  /**
   * Elimina una visita
   */
  async function handleDeleteVisit(visitId) {
    const confirmed = window.confirm("¿Seguro que quieres eliminar esta visita?");

    if (!confirmed) {
      return;
    }

    setVisitError("");
    setVisitSuccess("");
    setDeletingVisitId(visitId);

    try {
      await apiRequest(`/students/${id}/visits/${visitId}`, {
        method: "DELETE"
      });

      if (editingVisitId === visitId) {
        cancelEditingVisit();
      }

      setVisitSuccess("Visita eliminada correctamente.");
      await refreshVisits();
    } catch (err) {
      setVisitError(err.message);
    } finally {
      setDeletingVisitId(null);
    }
  }

  /**
   * Estado de carga
   */
  if (!student) {
    return (
      <div className="page">
        <p>Cargando legajo...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>Legajo del alumno</h1>
          <p>
            {student.nombre} {student.apellido} - {student.legajo}
          </p>
        </div>

        <div className="topbar-actions">
          <Link to="/dashboard" className="topbar-link">
            Dashboard
          </Link>
          <Link to="/students">Volver</Link>
          <button
            type="button"
            className="danger-button"
            onClick={handleDeleteStudent}
            disabled={deletingStudent}
          >
            {deletingStudent ? "Eliminando alumno..." : "Borrar alumno"}
          </button>
        </div>
      </header>

      <div className="tabs">
        <button
          onClick={() => setActiveTab("datos")}
          className={activeTab === "datos" ? "active" : ""}
        >
          Datos
        </button>

        <button
          onClick={() => setActiveTab("contenidos")}
          className={activeTab === "contenidos" ? "active" : ""}
        >
          Contenidos
        </button>

        <button
          onClick={() => setActiveTab("informes")}
          className={activeTab === "informes" ? "active" : ""}
        >
          Informes
        </button>

        <button
          onClick={() => setActiveTab("visitas")}
          className={activeTab === "visitas" ? "active" : ""}
        >
          Visitas
        </button>
      </div>

      {activeTab === "datos" && (
        <section className="card">
          <div className="student-photo-section">
            <div className="student-photo-card">
              {student.has_photo && studentPhotoUrl ? (
                <img
                  src={studentPhotoUrl}
                  alt={`Foto de ${student.nombre} ${student.apellido}`}
                  className="student-photo-preview"
                />
              ) : (
                <div className="student-photo-placeholder">
                  <span>Sin foto cargada</span>
                </div>
              )}

              <div className="student-photo-actions">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStudentPhotoChange}
                />

                <button
                  type="button"
                  onClick={handleUploadStudentPhoto}
                  disabled={photoLoading}
                >
                  {photoLoading ? "Subiendo..." : student.has_photo ? "Reemplazar foto" : "Subir foto"}
                </button>

                {student.has_photo && (
                  <button
                    type="button"
                    className="danger-button"
                    onClick={handleDeleteStudentPhoto}
                    disabled={deletingPhoto}
                  >
                    {deletingPhoto ? "Eliminando..." : "Eliminar foto"}
                  </button>
                )}
              </div>

              {photoError && <p className="error">{photoError}</p>}
              {photoSuccess && <p className="success">{photoSuccess}</p>}
            </div>

            <div>
              <div className="section-header">
                <h2>Datos generales</h2>

                {!editingStudent ? (
                  <button type="button" onClick={handleStartEditStudent}>
                    Editar datos
                  </button>
                ) : (
                  <div className="content-actions">
                    <button
                      type="button"
                      onClick={handleSaveStudentData}
                      disabled={studentLoading}
                    >
                      {studentLoading ? "Guardando..." : "Guardar cambios"}
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleCancelEditStudent}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {studentError && <p className="error">{studentError}</p>}
              {studentSuccess && <p className="success">{studentSuccess}</p>}

              {!editingStudent ? (
                <div className="student-data-grid">
                  <p><strong>Nombre:</strong> {student.nombre} {student.apellido}</p>
                  <p><strong>Legajo:</strong> {student.legajo}</p>
                  <p><strong>Escuela:</strong> {student.escuela}</p>
                  <p><strong>Grado:</strong> {student.grado}</p>
                  <p><strong>Diagnóstico:</strong> {student.diagnostico}</p>
                  <p><strong>Maestro integrador:</strong> {student.maestro_integrador}</p>
                  <p><strong>Maestro de grado:</strong> {student.maestro_grado}</p>
                  <p><strong>Dirección:</strong> {student.direccion}</p>
                </div>
              ) : (
                <div className="embedded-form">
                  <div className="form-grid">
                    <div>
                      <label>Legajo</label>
                      <input
                        type="text"
                        name="legajo"
                        value={studentForm.legajo}
                        onChange={handleStudentFormChange}
                      />
                    </div>

                    <div>
                      <label>Nombre</label>
                      <input
                        type="text"
                        name="nombre"
                        value={studentForm.nombre}
                        onChange={handleStudentFormChange}
                      />
                    </div>

                    <div>
                      <label>Apellido</label>
                      <input
                        type="text"
                        name="apellido"
                        value={studentForm.apellido}
                        onChange={handleStudentFormChange}
                      />
                    </div>

                    <div>
                      <label>Escuela</label>
                      <input
                        type="text"
                        name="escuela"
                        value={studentForm.escuela}
                        onChange={handleStudentFormChange}
                      />
                    </div>

                    <div>
                      <label>Grado</label>
                      <input
                        type="text"
                        name="grado"
                        value={studentForm.grado}
                        onChange={handleStudentFormChange}
                      />
                    </div>

                    <div>
                      <label>Diagnóstico</label>
                      <input
                        type="text"
                        name="diagnostico"
                        value={studentForm.diagnostico}
                        onChange={handleStudentFormChange}
                      />
                    </div>

                    <div>
                      <label>Maestro integrador</label>
                      <input
                        type="text"
                        name="maestro_integrador"
                        value={studentForm.maestro_integrador}
                        onChange={handleStudentFormChange}
                      />
                    </div>

                    <div>
                      <label>Maestro de grado</label>
                      <input
                        type="text"
                        name="maestro_grado"
                        value={studentForm.maestro_grado}
                        onChange={handleStudentFormChange}
                      />
                    </div>

                    <div className="full-width">
                      <label>Dirección</label>
                      <input
                        type="text"
                        name="direccion"
                        value={studentForm.direccion}
                        onChange={handleStudentFormChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === "contenidos" && (
        <section className="card">
          <div className="section-header">
            <h2>Contenidos adaptados</h2>

            <button
              type="button"
              onClick={() => {
                setShowContentForm(!showContentForm);
                setContentError("");
                setContentSuccess("");
              }}
            >
              {showContentForm ? "Cancelar" : "Nuevo contenido"}
            </button>
          </div>

          {showContentForm && (
            <form onSubmit={handleCreateContent} className="embedded-form">
              <div className="form-grid">
                <div>
                  <label>Materia</label>
                  <input
                    type="text"
                    name="materia"
                    value={contentForm.materia}
                    onChange={handleContentChange}
                    placeholder="Ej: Matemática"
                  />
                </div>

                <div>
                  <label>Título</label>
                  <input
                    type="text"
                    name="titulo"
                    value={contentForm.titulo}
                    onChange={handleContentChange}
                    placeholder="Ej: Números hasta 100"
                  />
                </div>

                <div className="full-width">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={contentForm.descripcion}
                    onChange={handleContentChange}
                    placeholder="Descripción del contenido adaptado"
                    rows="4"
                  />
                </div>

                <div>
                  <label>Progreso inicial (%)</label>
                  <input
                    type="number"
                    name="progreso"
                    min="0"
                    max="100"
                    value={contentForm.progreso}
                    onChange={handleContentChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={contentLoading}>
                  {contentLoading ? "Guardando..." : "Guardar contenido"}
                </button>
              </div>
            </form>
          )}

          {contentError && <p className="error">{contentError}</p>}
          {contentSuccess && <p className="success">{contentSuccess}</p>}

          {contents.length === 0 ? (
            <p>No hay contenidos registrados.</p>
          ) : (
            contents.map((item) => (
              <div key={item.id} className="content-card">
                {editingContentId === item.id ? (
                  <div>
                    <div className="embedded-form">
                      <div className="form-grid">
                        <div>
                          <label>Materia</label>
                          <input
                            type="text"
                            name="materia"
                            value={editContentForm.materia}
                            onChange={handleEditContentChange}
                          />
                        </div>

                        <div>
                          <label>Título</label>
                          <input
                            type="text"
                            name="titulo"
                            value={editContentForm.titulo}
                            onChange={handleEditContentChange}
                          />
                        </div>

                        <div className="full-width">
                          <label>Descripción</label>
                          <textarea
                            name="descripcion"
                            value={editContentForm.descripcion}
                            onChange={handleEditContentChange}
                            rows="5"
                          />
                        </div>

                        <div>
                          <label>Progreso (%)</label>
                          <input
                            type="number"
                            name="progreso"
                            min="0"
                            max="100"
                            value={editContentForm.progreso}
                            onChange={handleEditContentChange}
                          />
                        </div>
                      </div>

                      <div className="form-actions form-actions-left">
                        <button
                          type="button"
                          onClick={() => handleSaveEditedContent(item.id)}
                          disabled={editingLoading}
                        >
                          {editingLoading ? "Guardando..." : "Guardar cambios"}
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={cancelEditingContent}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="content-card-header">
                      <div>
                        <p><strong>Materia:</strong> {item.materia}</p>
                        <p><strong>Título:</strong> {item.titulo}</p>
                      </div>

                      <div className="content-actions">
                        <button
                          type="button"
                          onClick={() => startEditingContent(item)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDeleteContent(item.id)}
                          disabled={deletingContentId === item.id}
                        >
                          {deletingContentId === item.id ? "Eliminando..." : "Borrar"}
                        </button>
                      </div>
                    </div>

                    <p className="content-description">{item.descripcion}</p>

                    <p className="progress-label">Progreso del contenido</p>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${item.progreso}%` }}
                      >
                        {item.progreso}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === "informes" && (
        <section className="card">
          <div className="section-header">
            <h2>Informes</h2>

            <button
              type="button"
              onClick={() => {
                setShowReportForm(!showReportForm);
                setReportError("");
                setReportSuccess("");
              }}
            >
              {showReportForm ? "Cancelar" : "Nuevo informe"}
            </button>
          </div>

          {showReportForm && (
            <form onSubmit={handleCreateReport} className="embedded-form">
              <div className="form-grid">
                <div>
                  <label>Autor</label>
                  <input
                    type="text"
                    name="autor"
                    value={reportForm.autor}
                    onChange={handleReportChange}
                    placeholder="Nombre del autor"
                  />
                </div>

                <div>
                  <label>Tipo</label>
                  <input
                    type="text"
                    name="tipo"
                    value={reportForm.tipo}
                    onChange={handleReportChange}
                    placeholder="Ej: Informe pedagógico"
                  />
                </div>

                <div>
                  <label>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={reportForm.fecha}
                    onChange={handleReportChange}
                  />
                </div>

                <div className="full-width">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={reportForm.descripcion}
                    onChange={handleReportChange}
                    placeholder="Descripción del informe"
                    rows="5"
                  />
                </div>

                <div className="full-width">
                  <label>Adjuntar archivo</label>
                  <input
                    type="file"
                    name="attachment"
                    onChange={handleReportChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={reportLoading}>
                  {reportLoading ? "Guardando..." : "Guardar informe"}
                </button>
              </div>
            </form>
          )}

          {reportError && <p className="error">{reportError}</p>}
          {reportSuccess && <p className="success">{reportSuccess}</p>}

          {reports.length === 0 ? (
            <p>No hay informes registrados.</p>
          ) : (
            reports.map((item) => (
              <div key={item.id} className="content-card">
                {editingReportId === item.id ? (
                  <div className="embedded-form">
                    <div className="form-grid">
                      <div>
                        <label>Autor</label>
                        <input
                          type="text"
                          name="autor"
                          value={editReportForm.autor}
                          onChange={handleEditReportChange}
                        />
                      </div>

                      <div>
                        <label>Tipo</label>
                        <input
                          type="text"
                          name="tipo"
                          value={editReportForm.tipo}
                          onChange={handleEditReportChange}
                        />
                      </div>

                      <div>
                        <label>Fecha</label>
                        <input
                          type="date"
                          name="fecha"
                          value={editReportForm.fecha}
                          onChange={handleEditReportChange}
                        />
                      </div>

                      <div className="full-width">
                        <label>Descripción</label>
                        <textarea
                          name="descripcion"
                          value={editReportForm.descripcion}
                          onChange={handleEditReportChange}
                          rows="5"
                        />
                      </div>

                      <div className="full-width">
                        <label>Reemplazar archivo adjunto</label>
                        <input
                          type="file"
                          name="attachment"
                          onChange={handleEditReportChange}
                        />
                      </div>

                      {item.has_attachment && (
                        <div className="full-width">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              name="remove_attachment"
                              checked={editReportForm.remove_attachment}
                              onChange={handleEditReportChange}
                            />
                            Eliminar adjunto actual
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="form-actions form-actions-left">
                      <button
                        type="button"
                        onClick={() => handleSaveEditedReport(item.id)}
                        disabled={editingReportLoading}
                      >
                        {editingReportLoading ? "Guardando..." : "Guardar cambios"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelEditingReport}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="content-card-header">
                      <div>
                        <p><strong>Autor:</strong> {item.autor}</p>
                        <p><strong>Tipo:</strong> {item.tipo}</p>
                        <p><strong>Fecha:</strong> {item.fecha}</p>
                      </div>

                      <div className="content-actions">
                        <button
                          type="button"
                          onClick={() => startEditingReport(item)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDeleteReport(item.id)}
                          disabled={deletingReportId === item.id}
                        >
                          {deletingReportId === item.id ? "Eliminando..." : "Borrar"}
                        </button>
                      </div>
                    </div>

                    <p className="content-description">{item.descripcion}</p>

                    {item.has_attachment && (
                      <p>
                        <strong>Adjunto:</strong>{" "}
                        <button
                          type="button"
                          onClick={() => handleDownloadReportAttachment(item)}
                        >
                          {item.attachment_original_name}
                        </button>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === "visitas" && (
        <section className="card">
          <div className="section-header">
            <h2>Calendario de visitas</h2>

            <button
              type="button"
              onClick={() => {
                setShowVisitForm(!showVisitForm);
                setVisitError("");
                setVisitSuccess("");
              }}
            >
              {showVisitForm ? "Cancelar" : "Nueva visita"}
            </button>
          </div>

          {showVisitForm && (
            <form onSubmit={handleCreateVisit} className="embedded-form">
              <div className="form-grid">
                <div>
                  <label>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={visitForm.fecha}
                    onChange={handleVisitChange}
                  />
                </div>

                <div>
                  <label>Profesional</label>
                  <input
                    type="text"
                    name="profesional"
                    value={visitForm.profesional}
                    onChange={handleVisitChange}
                    placeholder="Nombre del profesional"
                  />
                </div>

                <div className="full-width">
                  <label>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={visitForm.observaciones}
                    onChange={handleVisitChange}
                    placeholder="Observaciones de la visita"
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={visitLoading}>
                  {visitLoading ? "Guardando..." : "Guardar visita"}
                </button>
              </div>
            </form>
          )}

          {visitError && <p className="error">{visitError}</p>}
          {visitSuccess && <p className="success">{visitSuccess}</p>}

          {visits.length === 0 ? (
            <p>No hay visitas registradas.</p>
          ) : (
            visits.map((item) => (
              <div key={item.id} className="content-card">
                {editingVisitId === item.id ? (
                  <div className="embedded-form">
                    <div className="form-grid">
                      <div>
                        <label>Fecha</label>
                        <input
                          type="date"
                          name="fecha"
                          value={editVisitForm.fecha}
                          onChange={handleEditVisitChange}
                        />
                      </div>

                      <div>
                        <label>Profesional</label>
                        <input
                          type="text"
                          name="profesional"
                          value={editVisitForm.profesional}
                          onChange={handleEditVisitChange}
                        />
                      </div>

                      <div className="full-width">
                        <label>Observaciones</label>
                        <textarea
                          name="observaciones"
                          value={editVisitForm.observaciones}
                          onChange={handleEditVisitChange}
                          rows="5"
                        />
                      </div>
                    </div>

                    <div className="form-actions form-actions-left">
                      <button
                        type="button"
                        onClick={() => handleSaveEditedVisit(item.id)}
                        disabled={editingVisitLoading}
                      >
                        {editingVisitLoading ? "Guardando..." : "Guardar cambios"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelEditingVisit}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="content-card-header">
                      <div>
                        <p><strong>Fecha:</strong> {item.fecha}</p>
                        <p><strong>Profesional:</strong> {item.profesional}</p>
                      </div>

                      <div className="content-actions">
                        <button
                          type="button"
                          onClick={() => startEditingVisit(item)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDeleteVisit(item.id)}
                          disabled={deletingVisitId === item.id}
                        >
                          {deletingVisitId === item.id ? "Eliminando..." : "Borrar"}
                        </button>
                      </div>
                    </div>

                    <p className="content-description">{item.observaciones}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}