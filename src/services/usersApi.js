import api from "./api";

export const usersApi = {
  getAll: (params = {}) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  updatePassword: (id, data) => api.put(`/users/${id}/password`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getUserAlerts: (id, params) => api.get(`/users/${id}/alerts`, { params }),
};
