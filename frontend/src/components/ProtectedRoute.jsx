import { Navigate } from "react-router-dom";

/**
 * Componente para proteger rutas privadas.
 *
 * Responsabilidades:
 * - Verificar si existe un usuario en localStorage
 * - Si NO hay usuario → redirige al login (/)
 * - Si hay usuario → renderiza el componente hijo
 *
 * Uso:
 * <ProtectedRoute>
 *    <ComponentePrivado />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  // Se obtiene el usuario guardado en localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Si no hay usuario, redirige al login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si hay usuario, permite acceso a la ruta
  return children;
}