const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";
const FILES_BASE_URL = BASE_URL.replace(/\/api(\/v1)?\/?$/, "");

export function getImageUrl(path) {
  if (!path) return null; // null => le composant ImageWithFallback affichera le placeholder
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${FILES_BASE_URL}${path}`;
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("tryon_token");

  // Si le body est un FormData (upload de fichier), on laisse le navigateur
  // définir lui-même le Content-Type (avec le boundary multipart).
  // Forcer "application/json" ici casserait l'upload.
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
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

  // Upload de fichier : "formData" doit être une instance de FormData.
  // Utilisé par adminService.uploadProductImage (cette méthode manquait
  // et faisait planter l'upload d'image produit depuis le dashboard).
  upload: (endpoint, formData) =>
    apiRequest(endpoint, {
      method: "POST",
      body: formData,
    }),
};

export default api;
