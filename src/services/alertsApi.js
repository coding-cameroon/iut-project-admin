import api from "./api";

export const alertsApi = {
  getAll: (params = {}) => api.get("/alerts", { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  getByUser: (userId) => api.get(`/alerts/user/${userId}`),
  getStats: (params = {}) => api.get("/alerts/stats/summary", { params }),
  create: (formData) =>
    api.post("/alerts", formData, { headers: { "Content-Type": undefined } }),
  update: (id, data) => api.put(`/alerts/${id}`, data),
  delete: (id) => api.delete(`/alerts/${id}`),
  assign: (id, data) => api.post(`/alerts/${id}/assign`, data),
};
