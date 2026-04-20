/**
 * URL base del backend.
 */
const API_BASE_URL = "http://localhost:5000/api";

/**
 * Función genérica para realizar llamadas al backend.
 *
 * Soporta:
 * - JSON
 * - FormData
 *
 * Si el body es FormData, no fuerza Content-Type,
 * dejando que el navegador construya multipart/form-data correctamente.
 */
export async function apiRequest(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (typeof data === "object" && data !== null && data.error) {
      throw new Error(data.error);
    }

    throw new Error("Error en la petición");
  }

  return data;
}