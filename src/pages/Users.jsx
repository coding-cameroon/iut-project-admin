import { useState } from "react";
import { useUsers, useUpdateUser, useDeleteUser } from "../hooks/useUsers";
import { useNotifications } from "../contexts/NotificationContext.jsx";
import RightSidebar from "../components/RightSidebar";

const getRoleColor = (role) => {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "SUPER_ADMIN":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "MANAGER":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-green-100 text-green-800 border-green-200";
  }
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const getInitials = (first, last) =>
  `${first?.charAt(0) ?? ""}${last?.charAt(0) ?? ""}`.toUpperCase();

const Users = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);

  const params = {
    page,
    limit: 10,
    search: search || undefined,
    role: roleFilter || undefined,
    isActive:
      activeFilter === "active"
        ? true
        : activeFilter === "inactive"
          ? false
          : undefined,
  };

  const { data, isLoading, isError, error, refetch, isFetching } =
    useUsers(params);
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const { showSuccess, showError } = useNotifications();

  // backend: { users, pagination }
  const users = data?.users ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    total: 0,
    pages: 1,
    limit: 10,
  };

  const isBusy = updateMutation.isPending || deleteMutation.isPending;

  const handleRoleChange = async (id, role) => {
    try {
      await updateMutation.mutateAsync({ id, data: { role } });
      showSuccess("Rôle mis à jour");
      if (selectedUser?.id === id) setSelectedUser((u) => ({ ...u, role }));
    } catch {
      showError("Impossible de modifier le rôle");
    }
  };

  const handleStatusToggle = async (id, currentIsActive) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { isActive: !currentIsActive },
      });
      showSuccess("Statut mis à jour");
      if (selectedUser?.id === id)
        setSelectedUser((u) => ({ ...u, isActive: !currentIsActive }));
    } catch {
      showError("Impossible de modifier le statut");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      showSuccess("Utilisateur supprimé");
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch {
      showError("Échec de la suppression");
    }
  };

  const exportCSV = () => {
    const rows = [
      ["ID", "Prénom", "Nom", "Email", "Rôle", "Actif", "Téléphone", "Créé le"],
      ...users.map((u) => [
        u.id,
        u.firstName,
        u.lastName,
        u.email,
        u.role,
        u.isActive,
        u.phone,
        formatDate(u.createdAt),
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            Utilisateurs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination.total} utilisateurs au total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white ring-1 ring-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
          >
            Exporter CSV
          </button>
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

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              placeholder="Rechercher nom, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les rôles</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="USER">Utilisateur</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
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
                  "Utilisateur",
                  "Email",
                  "Rôle",
                  "Statut",
                  "Téléphone",
                  "Créé le",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                      i === 6 ? "text-right" : "text-left"
                    } ${h === "Téléphone" ? "hidden md:table-cell" : ""} ${h === "Créé le" ? "hidden lg:table-cell" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {getInitials(user.firstName, user.lastName)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-500 sm:hidden truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-600">
                      {user.email}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <select
                        value={user.role}
                        disabled={isBusy}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className={`px-2 py-1 text-xs font-semibold rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed ${getRoleColor(user.role)}`}
                      >
                        <option value="USER">User</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleStatusToggle(user.id, user.isActive)
                        }
                        disabled={isBusy}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition disabled:cursor-not-allowed ${
                          user.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {user.isActive ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="hidden md:table-cell px-5 py-3 whitespace-nowrap text-sm text-slate-600">
                      {user.phone || "—"}
                    </td>
                    <td className="hidden lg:table-cell px-5 py-3 whitespace-nowrap text-xs text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-indigo-600 hover:text-indigo-800 transition"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
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
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {pagination.total > 0
              ? `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} sur ${pagination.total}`
              : "Aucun résultat"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.pages}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Detail sidebar */}
      <RightSidebar
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={
          selectedUser
            ? `${selectedUser.firstName} ${selectedUser.lastName}`
            : ""
        }
        width="w-96"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white font-bold text-xl">
                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 truncate">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-sm text-slate-600 truncate">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "Rôle",
                  node: (
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleColor(selectedUser.role)}`}
                    >
                      {selectedUser.role}
                    </span>
                  ),
                },
                {
                  label: "Statut",
                  node: (
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${selectedUser.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {selectedUser.isActive ? "Actif" : "Inactif"}
                    </span>
                  ),
                },
                {
                  label: "Téléphone",
                  node: (
                    <span className="text-sm text-slate-900">
                      {selectedUser.phone || "—"}
                    </span>
                  ),
                },
                {
                  label: "Créé le",
                  node: (
                    <span className="text-sm text-slate-900">
                      {formatDate(selectedUser.createdAt)}
                    </span>
                  ),
                },
              ].map(({ label, node }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    {label}
                  </span>
                  {node}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
              >
                Fermer
              </button>
              <button
                onClick={() =>
                  handleStatusToggle(selectedUser.id, selectedUser.isActive)
                }
                disabled={isBusy}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60 ${
                  selectedUser.isActive
                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                {selectedUser.isActive ? "Désactiver" : "Activer"}
              </button>
            </div>
          </div>
        )}
      </RightSidebar>
    </div>
  );
};

export default Users;
