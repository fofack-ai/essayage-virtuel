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

  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Réponse serveur invalide');
  }

  // ── Mode maintenance : rediriger le client ──
  if (res.status === 503 && data.redirect) {
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

  if (!res.ok || data.success === false) {
    const error = new Error(data.message || "Erreur API");
    error.status = res.status;
    error.redirect = data.redirect;
    throw error;
  }

  return data;
}

export const api = {
  get:    (endpoint)        => apiRequest(endpoint),
  post:   (endpoint, data)  => apiRequest(endpoint, { method: "POST",   body: JSON.stringify(data) }),
  put:    (endpoint, data)  => apiRequest(endpoint, { method: "PUT",    body: JSON.stringify(data) }),
  patch:  (endpoint, data)  => apiRequest(endpoint, { method: "PATCH",  body: JSON.stringify(data) }),
  delete: (endpoint)        => apiRequest(endpoint, { method: "DELETE" }),
  upload: (endpoint, form)  => apiRequest(endpoint, { method: "POST",   body: form }),
};

export default api;