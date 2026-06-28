import axios from "axios";

const API_BASE_URL =
  "https://iut-project-backend-production.up.railway.app/api";

// class ApiService {
//   constructor() {
//     this.baseURL = API_BASE_URL;
//     this.interceptors = {
//       request: [],
//       response: [],
//     };
//   }

//   addRequestInterceptor(interceptor) {
//     this.interceptors.request.push(interceptor);
//   }

//   addResponseInterceptor(interceptor) {
//     this.interceptors.response.push(interceptor);
//   }

//   async request(endpoint, options = {}) {
//     const token = localStorage.getItem("token");

//     // Apply request interceptors
//     let config = {
//       headers: {
//         "Content-Type": "application/json",
//         ...(token && { Authorization: `Bearer ${token}` }),
//         ...options.headers,
//       },
//       ...options,
//     };

//     for (const interceptor of this.interceptors.request) {
//       config = await interceptor(config);
//     }

//     try {
//       const response = await fetch(`${this.baseURL}${endpoint}`, config);

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         const error = new Error(
//           errorData.message || `HTTP error! status: ${response.status}`,
//         );
//         error.status = response.status;
//         error.data = errorData;
//         throw error;
//       }

//       const data = await response.json();

//       // Apply response interceptors
//       let processedData = data;
//       for (const interceptor of this.interceptors.response) {
//         processedData = await interceptor(processedData);
//       }

//       return processedData;
//     } catch (error) {
//       // Enhanced error logging for debugging
//       const errorInfo = {
//         message: error.message,
//         status: error.status,
//         data: error.data,
//         endpoint: endpoint,
//         stack: error.stack,
//       };
//       console.error("API request failed:", errorInfo);

//       // Handle specific error cases
//       if (error.status === 401) {
//         localStorage.removeItem("token");
//         window.location.href = "/login";
//       }

//       throw error;
//     }
//   }

//   // Helper methods for common HTTP methods
//   async get(endpoint, params = {}) {
//     const queryString = new URLSearchParams(params).toString();
//     const url = queryString ? `${endpoint}?${queryString}` : endpoint;
//     return this.request(url);
//   }

//   async post(endpoint, data = {}) {
//     return this.request(endpoint, {
//       method: "POST",
//       body: JSON.stringify(data),
//     });
//   }

//   async put(endpoint, data = {}) {
//     return this.request(endpoint, {
//       method: "PUT",
//       body: JSON.stringify(data),
//     });
//   }

//   async patch(endpoint, data = {}) {
//     return this.request(endpoint, {
//       method: "PATCH",
//       body: JSON.stringify(data),
//     });
//   }

//   async delete(endpoint) {
//     return this.request(endpoint, {
//       method: "DELETE",
//     });
//   }

// // Auth endpoints
// async login(credentials) {
//   return this.post("/auth/login", credentials);
// }

//   async logout() {
//     return this.post("/auth/logout");
//   }

//   async register(userData) {
//     return this.post("/auth/register", userData);
//   }

//   async getCurrentUser() {
//     return this.get("/auth/me");
//   }

//   async refreshToken() {
//     return this.post("/auth/refresh");
//   }

//   async forgotPassword(email) {
//     return this.post("/auth/forgot-password", { email });
//   }

//   // Dashboard endpoints
//   async getDashboardStats(params = {}) {
//     return this.get("/dashboard/stats", params);
//   }

//   async getMapAlerts(params = {}) {
//     return this.get("/dashboard/alerts/map", params);
//   }

//   async getAlertTimeline(params = {}) {
//     return this.get("/dashboard/alerts/timeline", params);
//   }

//   async getHeatmapData(params = {}) {
//     return this.get("/dashboard/heatmap", params);
//   }

//   async getPerformanceMetrics(params = {}) {
//     return this.get("/dashboard/performance", params);
//   }

//   async getDashboardNotifications(params = {}) {
//     return this.get("/dashboard/notifications", params);
//   }

//   // Alerts endpoints
//   async getAlerts(params = {}) {
//     return this.get("/alerts", params);
//   }

//   async getAlertById(id) {
//     return this.get(`/alerts/${id}`);
//   }

//   async createAlert(alertData, files = null) {
//     if (files) {
//       // For file uploads, we need to use FormData
//       const formData = new FormData();
//       Object.keys(alertData).forEach((key) => {
//         formData.append(key, alertData[key]);
//       });
//       if (files instanceof FileList) {
//         Array.from(files).forEach((file) => {
//           formData.append("photos", file);
//         });
//       }

//       const token = localStorage.getItem("token");
//       return this.request("/alerts", {
//         method: "POST",
//         body: formData,
//         headers: {
//           ...(token && { Authorization: `Bearer ${token}` }),
//         },
//       });
//     }
//     return this.post("/alerts", alertData);
//   }

//   async updateAlert(id, updates) {
//     return this.put(`/alerts/${id}`, updates);
//   }

//   async deleteAlert(id) {
//     return this.delete(`/alerts/${id}`);
//   }

//   async assignAlert(id, assignData) {
//     return this.post(`/alerts/${id}/assign`, assignData);
//   }

//   async getAlertStats(params = {}) {
//     return this.get("/alerts/stats/summary", params);
//   }

//   // Users endpoints
//   async getUsers(params = {}) {
//     return this.get("/users", params);
//   }

//   async getUserById(id) {
//     return this.get(`/users/${id}`);
//   }

//   async createUser(userData) {
//     return this.post("/users", userData);
//   }

//   async updateUser(id, updates) {
//     return this.put(`/users/${id}`, updates);
//   }

//   async deleteUser(id) {
//     return this.delete(`/users/${id}`);
//   }

//   async changePassword(id, passwordData) {
//     return this.put(`/users/${id}/password`, passwordData);
//   }

//   async getUserAlerts(id, params = {}) {
//     return this.get(`/users/${id}/alerts`, params);
//   }

//   // Settings endpoints
//   async getSettings() {
//     return this.get("/settings");
//   }

//   async updateSettings(settings) {
//     return this.put("/settings", settings);
//   }

//   // Utility methods
//   async uploadFile(file, endpoint = "/media") {
//     const formData = new FormData();
//     formData.append("file", file);

//     const token = localStorage.getItem("token");
//     return this.request(endpoint, {
//       method: "POST",
//       body: formData,
//       headers: {
//         ...(token && { Authorization: `Bearer ${token}` }),
//       },
//     });
//   }
// }

// export default new ApiService();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const message =
      error.response?.data?.error || error.message || "Erreur serveur";
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    error.message = message;
    return Promise.reject(error);
  },
);

api.login = (credentials) => api.post("/auth/login", credentials);
api.logout = () => api.post("/auth/logout");
api.getDashboardStats = (params = {}) =>
  api.get("/dashboard/stats", { params });
api.getSettings = () => api.get("/settings");
api.updateSettings = (settings) => api.put("/settings", settings);
api.getReports = (params = {}) => api.get("/reports", { params });
api.generateReport = (config) => api.post("/reports", config);
api.exportReport = (id, format = "pdf") =>
  api.get(`/reports/${id}/export`, {
    params: { format },
    responseType: "blob",
  });
api.getLiveStats = () => api.get("/dashboard/live/stats");
api.getLiveAlerts = () => api.get("/dashboard/live/alerts");

export default api;
