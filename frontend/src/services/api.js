export async function apiRequest(endpoint, options = {}) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const defaultHeaders = {
    "Content-Type": "application/json"
  };

  if (user?.id) {
    defaultHeaders["X-USER-ID"] = String(user.id);
  }

  const response = await fetch(`http://localhost:5000${endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  });

  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Respuesta inválida del servidor");
  }

  if (!response.ok) {
    throw new Error(data.error || "Error API");
  }

  return data;
}