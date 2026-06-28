export const KEYS = {
  alerts: (params) => ["alerts", "list", params],
  alertDetail: (id) => ["alerts", "detail", id],
  alertsByUser: (userId) => ["alerts", "user", userId],
  alertStats: ["alerts", "stats"],

  users: (params) => ["users", "list", params],
  userDetail: (id) => ["users", "detail", id],

  dashboardStats: (params) => ["dashboard", "stats", params],
  dashboardTimeline: (days) => ["dashboard", "timeline", days],
  dashboardMap: (params) => ["dashboard", "map", params],
  dashboardNotifs: ["dashboard", "notifications"],
};
