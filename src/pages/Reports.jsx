import { useState } from "react";
import { useDashboardStats } from "../hooks/useDashboard";
import { useAlerts } from "../hooks/useAlerts";
import RightSidebar from "../components/RightSidebar";

const getTypeStyle = (type) => {
  switch (type) {
    case "alerts":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "users":
      return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";
    case "performance":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [reportType, setReportType] = useState("all");
  const [exportFormat, setExportFormat] = useState("csv");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const statsQuery = useDashboardStats();
  const alertsQuery = useAlerts({ limit: 100 });

  const isLoading = statsQuery.isLoading || alertsQuery.isLoading;
  const isError = statsQuery.isError || alertsQuery.isError;
  const error = statsQuery.error || alertsQuery.error;

  const summary = statsQuery.data?.summary ?? {};
  const alerts = alertsQuery.data?.alerts ?? [];

  // Build synthetic report rows from real data
  const reports = [
    {
      id: "alerts-summary",
      title: "Rapport des alertes",
      type: "alerts",
      date: new Date().toISOString(),
      status: "completed",
      records: summary.totalAlerts ?? 0,
      size: `${Math.round((summary.totalAlerts ?? 0) * 0.4)} KB`,
    },
    {
      id: "alerts-pending",
      title: "Alertes en attente",
      type: "alerts",
      date: new Date().toISOString(),
      status: summary.pendingAlerts > 0 ? "pending" : "completed",
      records: summary.pendingAlerts ?? 0,
      size: `${Math.round((summary.pendingAlerts ?? 0) * 0.3)} KB`,
    },
    {
      id: "alerts-resolved",
      title: "Alertes résolues",
      type: "performance",
      date: new Date().toISOString(),
      status: "completed",
      records: summary.resolvedAlerts ?? 0,
      size: `${Math.round((summary.resolvedAlerts ?? 0) * 0.3)} KB`,
    },
    {
      id: "users-active",
      title: "Utilisateurs actifs",
      type: "users",
      date: new Date().toISOString(),
      status: "completed",
      records: summary.activeUsers ?? 0,
      size: `${Math.round((summary.activeUsers ?? 0) * 0.2)} KB`,
    },
  ];

  const filtered = reports.filter(
    (r) => reportType === "all" || r.type === reportType,
  );

  const exportReport = (format, reportId) => {
    if (format === "csv") {
      const rows = [
        ["ID", "Titre", "Type", "Statut", "Enregistrements", "Date"],
        ...alerts.map((a) => [
          a.id,
          a.title,
          a.type,
          a.status,
          1,
          formatDate(a.createdAt),
        ]),
      ]
        .map((r) => r.join(","))
        .join("\n");
      const blob = new Blob([rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport_${reportId}_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "json") {
      const blob = new Blob([JSON.stringify({ summary, alerts }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport_${reportId}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

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
          <p className="text-slate-800 font-semibold text-lg mb-1">
            Erreur de chargement
          </p>
          <p className="text-slate-500 text-sm mb-4">{error?.message}</p>
          <button
            onClick={() => {
              statsQuery.refetch();
              alertsQuery.refetch();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
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
            Rapports & analyses
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Générez et consultez les rapports du système
          </p>
        </div>
        <button
          onClick={() => {
            statsQuery.refetch();
            alertsQuery.refetch();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
        >
          <svg
            className="w-4 h-4"
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

      {/* Config */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/60">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
          Configuration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tous</option>
              <option value="alerts">Alertes</option>
              <option value="users">Utilisateurs</option>
              <option value="performance">Performance</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Date début
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((d) => ({ ...d, start: e.target.value }))
              }
              className="w-full px-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Date fin
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((d) => ({ ...d, end: e.target.value }))
              }
              className="w-full px-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Format export
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowPreview(true)}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            Générer le rapport
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total alertes",
            value: summary.totalAlerts ?? 0,
            color: "indigo",
          },
          {
            label: "En attente",
            value: summary.pendingAlerts ?? 0,
            color: "amber",
          },
          {
            label: "En cours",
            value: summary.inProgressAlerts ?? 0,
            color: "sky",
          },
          {
            label: "Résolues",
            value: summary.resolvedAlerts ?? 0,
            color: "emerald",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/60"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {label}
            </p>
            <p className={`text-2xl font-semibold mt-1 text-${color}-600`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Rapports disponibles
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                {[
                  "Titre",
                  "Type",
                  "Statut",
                  "Enregistrements",
                  "Date",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 5 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    Aucun rapport
                  </td>
                </tr>
              ) : (
                filtered.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/50 transition"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-slate-800">
                      {report.title}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeStyle(report.type)}`}
                      >
                        {report.type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : report.status === "pending"
                              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                              : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                        }`}
                      >
                        {report.status === "completed"
                          ? "Complété"
                          : "En attente"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">
                      {report.records}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">
                      {formatDate(report.date)}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-medium">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-indigo-600 hover:text-indigo-800 transition"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => exportReport(exportFormat, report.id)}
                          className="text-emerald-600 hover:text-emerald-800 transition"
                        >
                          Exporter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview sidebar */}
      <RightSidebar
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Aperçu"
        width="w-96"
      >
        <div className="space-y-6">
          <div className="bg-slate-50/80 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-slate-800">
              Configuration
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Vérifiez avant génération
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-medium text-slate-500 uppercase">
                Type
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getTypeStyle(reportType)}`}
              >
                {reportType}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase">
                Période
              </span>
              <p className="text-sm text-slate-700 mt-1">
                {dateRange.start && dateRange.end
                  ? `${formatDate(dateRange.start)} – ${formatDate(dateRange.end)}`
                  : "Toutes les dates"}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase">
                Format
              </span>
              <p className="text-sm text-slate-700 mt-1 uppercase">
                {exportFormat}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <button
              onClick={() => setShowPreview(false)}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                setShowPreview(false);
                exportReport(exportFormat, "all");
              }}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
            >
              Générer
            </button>
          </div>
        </div>
      </RightSidebar>

      {/* Detail sidebar */}
      <RightSidebar
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Détails"
        width="w-96"
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="bg-slate-50/80 rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-slate-800">
                {selectedReport.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Généré le {formatDate(selectedReport.date)}
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  label: "Type",
                  node: (
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getTypeStyle(selectedReport.type)}`}
                    >
                      {selectedReport.type}
                    </span>
                  ),
                },
                {
                  label: "Enregistrements",
                  node: (
                    <span className="text-sm text-slate-700">
                      {selectedReport.records}
                    </span>
                  ),
                },
                {
                  label: "Taille",
                  node: (
                    <span className="text-sm text-slate-700">
                      {selectedReport.size}
                    </span>
                  ),
                },
              ].map(({ label, node }) => (
                <div
                  key={label}
                  className="flex justify-between items-center border-b border-slate-100 pb-2"
                >
                  <span className="text-xs font-medium text-slate-500 uppercase">
                    {label}
                  </span>
                  {node}
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
              >
                Fermer
              </button>
              <button
                onClick={() => exportReport("csv", selectedReport.id)}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition"
              >
                Exporter CSV
              </button>
            </div>
          </div>
        )}
      </RightSidebar>
    </div>
  );
};

export default Reports;
