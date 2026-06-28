import api from "./api";

export const dashboardApi = {
  getStats: (params = {}) => api.get("/dashboard/stats", { params }),
  getMapAlerts: (params = {}) => api.get("/dashboard/alerts/map", { params }),
  getTimeline: (params = {}) =>
    api.get("/dashboard/alerts/timeline", { params }),
  getHeatmap: (params = {}) => api.get("/dashboard/heatmap", { params }),
  getPerformance: (params = {}) =>
    api.get("/dashboard/performance", { params }),
  getNotifications: (params = {}) =>
    api.get("/dashboard/notifications", { params }),
};
