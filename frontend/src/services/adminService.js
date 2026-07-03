import api from "./api";

export const adminService = {
  // Dashboard Management
  getDashboard() {
    return api.get("/admin/dashboard");
  },

  // Orders Management

  getOrders() {
    return api.get("/admin/orders");
  },

    getOrder(id) {
      return api.get(`/admin/orders/${id}`);
    },

  updateOrderStatus(id, status) {
    return api.put(`/admin/orders/${id}/status`, { status });
  },

  // Product Management

  getProducts() {
    return api.get("/products");
  },

  getProduct(id) {
    return api.get(`/products/${id}`);
  },

  createProduct(data) {
    return api.post("/products", data);
  },

  updateProduct(id, data) {
    return api.put(`/products/${id}`, data);
  },

  deleteProduct(id) {
    return api.delete(`/products/${id}`);
  },

  uploadProductImage(id, formData) {
    return api.upload(`/products/${id}/images`, formData);
  },

  getProductSizes(id) {
    return api.get(`/products/${id}/sizes`);
  },

  addProductSize(id, data) {
    return api.post(`/products/${id}/sizes`, data);
  },

  updateProductSizeStock(id, sizeId, data) {
    return api.put(`/products/${id}/sizes/${sizeId}`, data);
  },

  // Try-On Management

  getTryons() {
    return api.get("/tryons");
  },

  deleteTryon(id) {
    return api.delete(`/tryons/${id}`);
  },

  getClients() {
    return api.get("/admin/clients");
  },

  getClient(id) {
    return api.get(`/admin/clients/${id}`);
  },

  updateClient(id, data) {
    return api.put(`/admin/clients/${id}`, data);
  },

  deleteClient(id) {
    return api.delete(`/admin/clients/${id}`);
  },

  // Activity Logs Management
  getLogs() {
    return api.get("/logs");
  },

  createLog(data) {
    return api.post("/logs", data);
  },

  deleteLog(id) {
    return api.delete(`/logs/${id}`);
  },
  
  // Notifications Management
  getNotifications() {
    return api.get("/notifications");
  },

  createNotification(data) {
    return api.post("/notifications", data);
  },

  markNotificationRead(id) {
    return api.patch(`/notifications/${id}/read`);
  },

  markAllNotificationsRead() {
    return api.patch("/notifications/read-all");
  },

  deleteNotification(id) {
    return api.delete(`/notifications/${id}`);
  },

  // Support Tickets Management
  getSupportTickets() {
    return api.get("/support/tickets");
  },

  createSupportTicket(data) {
    return api.post("/support/tickets", data);
  },

  updateSupportTicket(id, data) {
    return api.put(`/support/tickets/${id}`, data);
  },

  deleteSupportTicket(id) {
    return api.delete(`/support/tickets/${id}`);
  },

  getFaqs() {
    return api.get("/support/faqs");
  },

  createFaq(data) {
    return api.post("/support/faqs", data);
  },

  updateFaq(id, data) {
    return api.put(`/support/faqs/${id}`, data);
  },

  deleteFaq(id) {
    return api.delete(`/support/faqs/${id}`);
  },
  
  // Promotions Management
  getPromotions() {
    return api.get("/promotions");
  },

  createPromotion(data) {
    return api.post("/promotions", data);
  },

  updatePromotion(id, data) {
    return api.put(`/promotions/${id}`, data);
  },

  togglePromotion(id, active) {
    return api.put(`/promotions/${id}/toggle`, { active });
  },

  deletePromotion(id) {
    return api.delete(`/promotions/${id}`);
  },

  // Reviews Management
  getReviews() {
    return api.get("/reviews");
  },

  createReview(data) {
    return api.post("/reviews", data);
  },

  updateReview(id, data) {
    return api.put(`/reviews/${id}`, data);
  },

  updateReviewStatus(id, status) {
    return api.put(`/reviews/${id}/status`, { status });
  },

  deleteReview(id) {
    return api.delete(`/reviews/${id}`);
  },

  // Settings Management
  getSettings() {
    return api.get("/settings");
  },

  saveSettings(data) {
    return api.put("/settings", data);
  },

  // Reports Management
  getReports(period = "month") {
    return api.get(`/reports/overview?period=${period}`);
  },
  
};