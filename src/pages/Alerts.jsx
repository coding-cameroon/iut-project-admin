import { useState } from "react";
import { useAlerts, useUpdateAlert, useDeleteAlert } from "../hooks/useAlerts";
import { useNotifications } from "../contexts/NotificationContext";
import RightSidebar from "../components/RightSidebar";

const getPriorityStyle = (p) => {
  switch (p) {
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

const getStatusStyle = (s) => {
  switch (s) {
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

const Alerts = () => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 10 });

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAlerts(params);
  const updateMutation = useUpdateAlert();
  const deleteMutation = useDeleteAlert();
  const { showSuccess, showError } = useNotifications();

  // backend returns { alerts, pagination }
  const alerts = data?.alerts ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };

  const updateFilters = (patch) =>
    setParams((p) => ({ ...p, ...patch, page: 1 }));

  const handleStatusChange = async (id, status) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status } });
      showSuccess(`Statut mis à jour`);
      // keep sidebar in sync
      if (selectedAlert?.id === id) setSelectedAlert((a) => ({ ...a, status }));
    } catch {
      showError("Impossible de mettre à jour le statut");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette alerte ?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      showSuccess("Alerte supprimée");
      if (selectedAlert?.id === id) setSelectedAlert(null);
    } catch {
      showError("Échec de la suppression");
    }
  };

  const isBusy = updateMutation.isPending || deleteMutation.isPending;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            Alertes
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Surveillance et gestion des incidents
          </p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: pagination.total,
            color: "indigo",
            icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          },
          {
            label: "En attente",
            value: alerts.filter((a) => a.status === "PENDING").length,
            color: "amber",
            icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
          },
          {
            label: "En cours",
            value: alerts.filter((a) => a.status === "IN_PROGRESS").length,
            color: "sky",
            icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
          },
          {
            label: "Résolues",
            value: alerts.filter((a) => a.status === "RESOLVED").length,
            color: "emerald",
            icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/60 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}
              >
                <svg
                  className={`w-5 h-5 text-${stat.color}-600`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d={stat.icon}
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              onChange={(e) =>
                updateFilters({ search: e.target.value || undefined })
              }
              className="w-full pl-9 pr-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            onChange={(e) =>
              updateFilters({ status: e.target.value || undefined })
            }
            className="px-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolu</option>
          </select>
          <select
            onChange={(e) =>
              updateFilters({ priority: e.target.value || undefined })
            }
            className="px-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Toutes les priorités</option>
            <option value="CRITICAL">Critique</option>
            <option value="HIGH">Haute</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="LOW">Basse</option>
          </select>
          <select
            onChange={(e) =>
              updateFilters({ type: e.target.value || undefined })
            }
            className="px-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les types</option>
            <option value="ACCIDENT">Accident</option>
            <option value="FIRE">Incendie</option>
            <option value="MEDICAL_EMERGENCY">Urgence médicale</option>
            <option value="SECURITY_INCIDENT">Incident sécurité</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                {[
                  "Titre",
                  "Priorité",
                  "Statut",
                  "Localisation",
                  "Assigné à",
                  "Date",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                      i === 6 ? "text-right" : "text-left"
                    } ${h === "Localisation" ? "hidden sm:table-cell" : ""} ${h === "Assigné à" ? "hidden md:table-cell" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Aucune alerte trouvée
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-slate-50/50 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="max-w-[200px]">
                        <div className="text-sm font-medium text-slate-800 truncate">
                          {alert.title}
                        </div>
                        <div className="hidden sm:block text-xs text-slate-500 truncate">
                          {alert.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityStyle(alert.priority)}`}
                      >
                        {alert.priority === "HIGH"
                          ? "Haute"
                          : alert.priority === "MEDIUM"
                            ? "Moyenne"
                            : alert.priority === "CRITICAL"
                              ? "Critique"
                              : "Basse"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={alert.status}
                        disabled={isBusy}
                        onChange={(e) =>
                          handleStatusChange(alert.id, e.target.value)
                        }
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed ${getStatusStyle(alert.status)}`}
                      >
                        <option value="PENDING">En attente</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="RESOLVED">Résolu</option>
                      </select>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {alert.city || alert.address || "—"}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                      {alert.assignments?.length > 0
                        ? alert.assignments[0].assignedTo
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                      {formatDate(alert.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="text-indigo-600 hover:text-indigo-800 transition"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => handleDelete(alert.id)}
                          disabled={isBusy}
                          className="text-rose-500 hover:text-rose-700 transition disabled:opacity-40"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {pagination.total > 0
              ? `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} sur ${pagination.total}`
              : "Aucun résultat"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Précédent
            </button>
            <button
              onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Detail sidebar */}
      <RightSidebar
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title={selectedAlert?.title || "Détails"}
        width="w-96"
      >
        {selectedAlert && (
          <div className="space-y-6">
            <div className="bg-slate-50/80 rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-slate-800">
                {selectedAlert.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {selectedAlert.description}
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  label: "Priorité",
                  node: (
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getPriorityStyle(selectedAlert.priority)}`}
                    >
                      {selectedAlert.priority}
                    </span>
                  ),
                },
                {
                  label: "Statut",
                  node: (
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusStyle(selectedAlert.status)}`}
                    >
                      {selectedAlert.status}
                    </span>
                  ),
                },
                {
                  label: "Type",
                  node: (
                    <span className="text-sm text-slate-700">
                      {selectedAlert.type}
                    </span>
                  ),
                },
                {
                  label: "Ville",
                  node: (
                    <span className="text-sm text-slate-700">
                      {selectedAlert.city || "—"}
                    </span>
                  ),
                },
                {
                  label: "Créé le",
                  node: (
                    <span className="text-sm text-slate-700">
                      {formatDate(selectedAlert.createdAt)}
                    </span>
                  ),
                },
              ].map(({ label, node }) => (
                <div
                  key={label}
                  className="flex justify-between items-center border-b border-slate-100 pb-2"
                >
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {label}
                  </span>
                  {node}
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleStatusChange(selectedAlert.id, "IN_PROGRESS")
                  }
                  disabled={isBusy}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  En cours
                </button>
                <button
                  onClick={() =>
                    handleStatusChange(selectedAlert.id, "RESOLVED")
                  }
                  disabled={isBusy}
                  className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  Résoudre
                </button>
              </div>
              <button
                onClick={() => handleDelete(selectedAlert.id)}
                disabled={isBusy}
                className="px-3 py-2 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium hover:bg-rose-100 transition disabled:opacity-60"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
      </RightSidebar>
    </div>
  );
};

export default Alerts;
