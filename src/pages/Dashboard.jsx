import { useState } from "react";
import { useDashboardStats } from "../hooks/useDashboard";
import { useRealtime } from "../hooks/useRealtime";

const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
  <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-md hover:ring-slate-300/80">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-2xl font-semibold text-slate-800 mt-1.5">
          {value ?? "—"}
        </p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        {trend != null && (
          <div className="flex items-center gap-1 mt-2">
            <svg
              className={`w-3.5 h-3.5 ${trend >= 0 ? "text-emerald-500" : "text-rose-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  trend >= 0
                    ? "M5 10l7-7m0 0l7 7m-7-7v18"
                    : "M19 14l-7 7m0 0l-7-7m7 7V3"
                }
              />
            </svg>
            <span
              className={`text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}
            >
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      <div
        className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 ml-3 shadow-sm group-hover:scale-105 transition-transform duration-200`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const getPriorityStyle = (priority) => {
  switch (priority) {
    case "HIGH":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "MEDIUM":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "LOW":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "IN_PROGRESS":
      return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";
    case "RESOLVED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }
};

const formatDate = (d) =>
  new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("24h");

  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboardStats({ startDate: timeRange });

  const { liveStats, connected } = useRealtime();

  // backend: { summary, breakdown, recentAlerts }
  const summary = liveStats || data?.summary || {};
  const recentAlerts = data?.recentAlerts || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm ring-1 ring-slate-200">
          <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-slate-800 font-semibold text-lg mb-1">
            Erreur de chargement
          </p>
          <p className="text-slate-500 text-sm mb-4">{error?.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            Tableau de bord
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Vue d'ensemble des alertes et métriques
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ring-1 ${
              connected
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-rose-50 text-rose-700 ring-rose-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
            />
            {connected ? "Live" : "Hors ligne"}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200 disabled:opacity-60"
          >
            <svg
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      {/* Time range */}
      <div className="flex flex-wrap gap-2">
        {["24h", "7d", "30d"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              timeRange === range
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                : "bg-white/70 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {range === "24h"
              ? "24 heures"
              : range === "7d"
                ? "7 jours"
                : "30 jours"}
          </button>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Alertes totales"
          value={summary.totalAlerts}
          color="bg-indigo-500"
          subtitle={`Période: ${timeRange}`}
          icon={
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="En attente"
          value={summary.pendingAlerts}
          color="bg-amber-500"
          icon={
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="En cours"
          value={summary.inProgressAlerts}
          color="bg-sky-500"
          icon={
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
        />
        <StatCard
          title="Résolues"
          value={summary.resolvedAlerts}
          color="bg-emerald-500"
          subtitle={`Taux: ${summary.resolutionRate ?? 0}%`}
          trend={summary.resolutionRate}
          icon={
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Recent alerts table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Alertes récentes
          </h2>
          <span className="text-xs text-slate-400">
            {recentAlerts.length} entrées
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                {["Titre", "Priorité", "Statut", "Localisation", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === "Localisation" ? "hidden sm:table-cell" : ""}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAlerts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    Aucune alerte récente
                  </td>
                </tr>
              ) : (
                recentAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-slate-50/50 transition"
                  >
                    <td className="px-5 py-3">
                      <div className="max-w-[200px]">
                        <div className="text-sm font-medium text-slate-800 truncate">
                          {alert.title}
                        </div>
                        <div className="text-xs text-slate-500 truncate sm:hidden mt-1">
                          {alert.city} · {formatDate(alert.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityStyle(alert.priority)}`}
                      >
                        {alert.priority === "HIGH"
                          ? "Haute"
                          : alert.priority === "MEDIUM"
                            ? "Moyenne"
                            : "Basse"}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(alert.status)}`}
                      >
                        {alert.status === "PENDING"
                          ? "En attente"
                          : alert.status === "IN_PROGRESS"
                            ? "En cours"
                            : "Résolu"}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-5 py-3 whitespace-nowrap text-sm text-slate-600">
                      {alert.city || alert.address || "—"}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500">
                      {formatDate(alert.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[
          {
            title: "Évolution des alertes",
            icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z",
          },
          {
            title: "Répartition par priorité",
            icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z",
          },
        ].map(({ title, icon }) => (
          <div
            key={title}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/60"
          >
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
              {title}
            </h3>
            <div className="h-64 flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="text-center">
                <svg
                  className="w-10 h-10 text-slate-300 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d={icon}
                  />
                </svg>
                <p className="text-sm text-slate-400">{title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
