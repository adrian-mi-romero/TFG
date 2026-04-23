import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../services/api";

/**
 * Página de Perfil.
 *
 * Responsabilidades:
 * - Mostrar datos del usuario autenticado
 * - Permitir editar email, nombre completo y teléfono
 * - Guardar cambios en el backend
 * - Manejar errores y estados de carga
 */
export default function Profile() {
  const navigate = useNavigate();

  // Datos del usuario actual
  const [user, setUser] = useState(null);

  // Estado del formulario de edición
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: ""
  });

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Cargar datos del perfil al montar el componente
   */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("user"));

        if (!currentUser) {
          navigate("/");
          return;
        }

        const response = await apiRequest("/profile", {
          method: "GET"
        });

        const userData = response.user;
        setUser(userData);
        setFormData({
          full_name: userData.full_name || "",
          email: userData.email || "",
          phone: userData.phone || ""
        });
      } catch (err) {
        setError(err.message || "Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  /**
   * Maneja cambios en los inputs del formulario
   */
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  /**
   * Envía cambios al backend
   */
  async function handleSave(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify(formData)
      });

      const updatedUser = response.user;
      setUser(updatedUser);

      // Actualizar el usuario en localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("Perfil actualizado correctamente");
      setIsEditing(false);

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  }

  /**
   * Cancela la edición y restaura los datos originales
   */
  function handleCancel() {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
    setIsEditing(false);
    setError("");
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <div className="card">
          <p>Usuario no encontrado</p>
          <Link to="/dashboard">Volver al panel principal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <header className="topbar">
          <div>
            <h1>E-integración</h1>
            <p>Mi perfil</p>
          </div>

          <div className="topbar-actions">
            <span>
              {user.full_name} ({user.role})
            </span>
            <Link to="/dashboard">Panel principal</Link>
          </div>
        </header>

        <div className="card-content">
          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          {!isEditing ? (
            <div className="profile-view">
              <div className="profile-section">
                <h2>Información personal</h2>

                <div className="profile-field">
                  <label>Nombre completo</label>
                  <p>{user.full_name}</p>
                </div>

                <div className="profile-field">
                  <label>Correo electrónico</label>
                  <p>{user.email}</p>
                </div>

                <div className="profile-field">
                  <label>Teléfono</label>
                  <p>{user.phone || "No especificado"}</p>
                </div>

                <div className="profile-field">
                  <label>Tipo de perfil</label>
                  <p>{user.role}</p>
                </div>

                <div className="profile-field">
                  <label>Miembro desde</label>
                  <p>
                    {new Date(user.created_at).toLocaleDateString("es-AR")}
                  </p>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setIsEditing(true)}
                >
                  Editar información
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-section">
                <h2>Editar información</h2>

                <div className="form-group">
                  <label htmlFor="full_name">Nombre completo</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Nombre completo"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Teléfono (opcional)"
                  />
                </div>
              </div>

              <div className="profile-actions">
                <button
                  type="submit"
                  disabled={saving}
                  className="primary-button"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="secondary-button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
