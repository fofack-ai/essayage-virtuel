const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";
const FILES_BASE_URL = BASE_URL.replace(/\/api(\/v1)?\/?$/, "");

export function getImageUrl(path) {
  if (!path) return "/product-placeholder.jpg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${FILES_BASE_URL}${path}`;
}

export async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("tryon_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Erreur API");
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

  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: "DELETE",
    }),
};

export default api;