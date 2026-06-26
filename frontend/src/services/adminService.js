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

  getOrder(id) {
    return api.get(`/admin/orders/${id}`);
  },
};