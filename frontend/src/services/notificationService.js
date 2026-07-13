// frontend/src/services/notificationService.js
import api from "./api";

export const notificationService = {
  // L'API détermine automatiquement si c'est un admin ou un utilisateur
  getNotifications: () => api.get("/notifications"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};