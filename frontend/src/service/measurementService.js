import { api } from './api';

export const measurementService = {
  save: (data) => api.post('/measurements', data).then(r => r.data),
  getLatest: () => api.get('/measurements/latest').then(r => r.data),
  recommend: (payload) => api.post('/measurements/recommend', payload).then(r => r.data),
};