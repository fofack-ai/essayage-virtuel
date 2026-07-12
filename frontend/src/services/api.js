const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";
const FILES_BASE_URL = BASE_URL.replace(/\/api(\/v1)?\/?$/, "");

export function getImageUrl(path) {
  if (!path) return null; // null => le composant ImageWithFallback affichera le placeholder
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${FILES_BASE_URL}${path}`;
}

export async function apiRequest(endpoint, options = {}) {
  const token =
    sessionStorage.getItem("tryon_token") ||
    localStorage.getItem("tryon_token");

  // Si le body est un FormData (upload de fichier), on NE force PAS le
  // Content-Type : le navigateur doit poser lui-même le boundary multipart.
  // Forcer "application/json" ici casserait tout upload (photo essayage,
  // image produit, etc.).
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
    });
  } catch (networkError) {
    // Coupure réseau / serveur injoignable : message clair au lieu d'un
    // "Failed to fetch" cryptique.
    throw new Error(
      "Impossible de joindre le serveur. Vérifiez votre connexion internet."
    );
  }

  // Certaines réponses n'ont pas de corps JSON (204 No Content, erreur proxy…).
  // On parse défensivement pour ne jamais planter sur res.json().
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: text };
    }
  }

  if (!res.ok || (data && data.success === false)) {
    const message =
      (data && data.message) ||
      `Erreur ${res.status}${res.statusText ? " — " + res.statusText : ""}`;
    throw new Error(message);
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

  // PATCH manquait : les appels api.patch(...) (marquer une notification lue,
  // "tout marquer comme lu") plantaient avec "api.patch is not a function".
  patch: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "PATCH",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: "DELETE",
    }),

  // Upload de fichier : "formData" doit être une instance de FormData.
  // Cette méthode manquait dans ce fichier : l'upload de la photo d'essayage
  // (TryOn.jsx) ET l'upload d'image produit (dashboard admin) plantaient avec
  // "api.upload is not a function".
  upload: (endpoint, formData) =>
    apiRequest(endpoint, {
      method: "POST",
      body: formData,
    }),
};

export default api;
