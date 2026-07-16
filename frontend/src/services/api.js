const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads")) return `http://localhost:5000${path}`;
  if (path.startsWith("uploads/")) return `http://localhost:5000/${path}`;
  return `http://localhost:5000/uploads/products/${path}`;
}

export async function apiRequest(endpoint, options = {}) {
  const token =
    sessionStorage.getItem("tryon_token") ||
    localStorage.getItem("tryon_token");

  // Si le body est un FormData (upload de fichier), on NE force PAS le
  // Content-Type : le navigateur doit poser lui-même le boundary multipart.
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
res = await fetch(`${BASE_URL}${endpoint}`, {
  ...options,
  headers,
  credentials: "include",
});
  } catch (networkError) {
    throw new Error(
      "Impossible de joindre le serveur. Vérifiez votre connexion internet."
    );
  }

  // Certaines réponses n'ont pas de corps JSON
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: text };
    }
  }

  // ── Mode maintenance : rediriger le client ──
  if (res.status === 503 && data?.redirect) {
    const error = new Error("maintenance_redirect");
    error.redirect = data.redirect;
    throw error;
  }

  // ── Token invalide : déconnecter proprement ──
  if (res.status === 401 && endpoint !== '/auth/login') {
    localStorage.removeItem('tryon_token');
    localStorage.removeItem('tryon_user');
    sessionStorage.removeItem('tryon_token');
    sessionStorage.removeItem('tryon_user');
  }

  if (!res.ok || (data && data.success === false)) {
    const message =
      (data && data.message) ||
      `Erreur ${res.status}${res.statusText ? " — " + res.statusText : ""}`;
    const error = new Error(message);
    error.status = res.status;
    error.redirect = data?.redirect;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint) => apiRequest(endpoint),

  post: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "PATCH",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: "DELETE",
    }),

  upload: (endpoint, formData) =>
    apiRequest(endpoint, {
      method: "POST",
      body: formData,
    }),
};

export default api;