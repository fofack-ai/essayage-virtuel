import api from './api';

export const measurementService = {
  // --- Public (aucun compte requis) ---

  /** Estime les tours à partir de taille + poids + morphologie */
  estimate: (payload) =>
    api.post('/measurements/estimate', payload).then((r) => r.data),

  /** Taille recommandée à partir de mensurations */
  recommend: (payload) =>
    api.post('/measurements/recommend', payload).then((r) => r.data),

  /**
   * Verdict d'ajustement pour TOUTES les tailles (XS -> XXL).
   * Accepte { heightCm, weightKg, morphology, productId }
   * ou      { chestCm, waistCm, hipCm, productId }
   */
  fit: (payload) =>
    api.post('/measurements/fit', payload).then((r) => r.data),

  // --- Nécessite un compte ---

  save: (data) => api.post('/measurements', data).then((r) => r.data),
  getLatest: () => api.get('/measurements/latest').then((r) => r.data),
};

export default measurementService;