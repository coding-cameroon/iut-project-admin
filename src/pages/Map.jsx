import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useDashboardMapAlerts } from "../hooks/useDashboard";
import RightSidebar from "../components/RightSidebar";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const getMarkerIcon = (priority) => {
  const colors = {
    HIGH: "#ef4444",
    CRITICAL: "#dc2626",
    MEDIUM: "#f59e0b",
    LOW: "#3b82f6",
  };
  const color = colors[priority] ?? "#6b7280";
  return L.divIcon({
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid white;">!</div>`,
    iconSize: [28, 28],
    className: "custom-marker",
  });
};

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const getPriorityColor = (p) => {
  switch (p) {
    case "HIGH":
    case "CRITICAL":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "MEDIUM":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
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

const Map = () => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 4.0511, lng: 9.7679 });
  const [mapZoom, setMapZoom] = useState(12);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Load Leaflet CSS
  useEffect(() => {
    const urls = [
      "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
      "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css",
      "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css",
    ];
    const links = urls.map((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
    return () => links.forEach((l) => document.head.removeChild(l));
  }, []);

  // Get user location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setMapCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setMapCenter({ lat: 4.0511, lng: 9.7679 }),
    );
  }, []);

  const queryParams = {
    ...(statusFilter && { status: statusFilter }),
    ...(priorityFilter && { priority: priorityFilter }),
  };

  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboardMapAlerts(queryParams);

  // backend: { alerts }  — each alert has latitude + longitude
  const alerts = data?.alerts ?? [];

  const filteredAlerts = alerts.filter((a) => {
    const lat = parseFloat(a.latitude);
    const lng = parseFloat(a.longitude);
    return !isNaN(lat) && !isNaN(lng);
  });

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setMapCenter({
      lat: parseFloat(alert.latitude),
      lng: parseFloat(alert.longitude),
    });
    setMapZoom(15);
  };

  const handleLocationClick = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        setMapCenter({ lat: p.coords.latitude, lng: p.coords.longitude });
        setMapZoom(14);
      },
      () => {},
    );
  };

  const stats = {
    total: filteredAlerts.length,
    high: filteredAlerts.filter(
      (a) => a.priority === "HIGH" || a.priority === "CRITICAL",
    ).length,
    medium: filteredAlerts.filter((a) => a.priority === "MEDIUM").length,
    low: filteredAlerts.filter((a) => a.priority === "LOW").length,
    pending: filteredAlerts.filter((a) => a.status === "PENDING").length,
    inProgress: filteredAlerts.filter((a) => a.status === "IN_PROGRESS").length,
    resolved: filteredAlerts.filter((a) => a.status === "RESOLVED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            Carte des alertes
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredAlerts.length} alerte
            {filteredAlerts.length !== 1 ? "s" : ""} affichée
            {filteredAlerts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHeatmap((v) => !v)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition ring-1 ${
              showHeatmap
                ? "bg-indigo-600 text-white ring-indigo-600"
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            Heatmap
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolu</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Toutes les priorités</option>
            <option value="CRITICAL">Critique</option>
            <option value="HIGH">Haute</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="LOW">Basse</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-700">
          Impossible de charger les alertes : {error?.message}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden h-[500px] lg:h-[600px] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : (
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={mapZoom}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <MapUpdater
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={mapZoom}
                />

                {filteredAlerts.map((alert) => (
                  <Marker
                    key={alert.id}
                    position={[
                      parseFloat(alert.latitude),
                      parseFloat(alert.longitude),
                    ]}
                    icon={getMarkerIcon(alert.priority)}
                    eventHandlers={{ click: () => handleAlertClick(alert) }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-semibold text-slate-800">
                          {alert.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          {alert.city || alert.address || "—"}
                        </p>
                        <span
                          className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full ${getPriorityColor(alert.priority)}`}
                        >
                          {alert.priority}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}

            {/* Zoom controls */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
              <button
                onClick={() => setMapZoom((z) => Math.min(z + 1, 18))}
                className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl shadow-sm flex items-center justify-center text-slate-700 hover:bg-white transition font-bold"
              >
                +
              </button>
              <button
                onClick={() => setMapZoom((z) => Math.max(z - 1, 4))}
                className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl shadow-sm flex items-center justify-center text-slate-700 hover:bg-white transition font-bold"
              >
                −
              </button>
              <button
                onClick={handleLocationClick}
                className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl shadow-sm flex items-center justify-center text-slate-700 hover:bg-white transition"
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
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>

            {showHeatmap && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-sky-500/10 z-[500]" />
            )}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-5">
          {/* Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/60">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
              Statistiques
            </h3>
            <div className="space-y-2.5">
              {[
                {
                  label: "Total affiché",
                  value: stats.total,
                  color: "text-slate-800",
                },
                {
                  label: "Haute priorité",
                  value: stats.high,
                  color: "text-rose-600",
                },
                {
                  label: "Moy. priorité",
                  value: stats.medium,
                  color: "text-amber-600",
                },
                {
                  label: "Basse priorité",
                  value: stats.low,
                  color: "text-sky-600",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className={`font-semibold ${color}`}>{value}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2.5 space-y-2.5">
                {[
                  {
                    label: "En attente",
                    value: stats.pending,
                    color: "text-amber-600",
                  },
                  {
                    label: "En cours",
                    value: stats.inProgress,
                    color: "text-indigo-600",
                  },
                  {
                    label: "Résolues",
                    value: stats.resolved,
                    color: "text-emerald-600",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className={`font-semibold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alert list */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/60">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
              Alertes sur la carte
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredAlerts.slice(0, 8).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className="p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {alert.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {alert.city || alert.address || "—"}
                      </p>
                    </div>
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
                        alert.priority === "HIGH" ||
                        alert.priority === "CRITICAL"
                          ? "bg-rose-500"
                          : alert.priority === "MEDIUM"
                            ? "bg-amber-500"
                            : "bg-sky-500"
                      }`}
                    />
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(alert.priority)}`}
                    >
                      {alert.priority}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyle(alert.status)}`}
                    >
                      {alert.status === "PENDING"
                        ? "En attente"
                        : alert.status === "IN_PROGRESS"
                          ? "En cours"
                          : "Résolu"}
                    </span>
                  </div>
                </div>
              ))}
              {filteredAlerts.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-6">
                  Aucune alerte
                </p>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/60">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
              Légende
            </h3>
            <div className="space-y-2">
              {[
                { color: "bg-rose-500", label: "Critique / Haute" },
                { color: "bg-amber-500", label: "Moyenne priorité" },
                { color: "bg-sky-500", label: "Basse priorité" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full ${color} shadow-sm flex-shrink-0`}
                  />
                  <span className="text-sm text-slate-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail sidebar */}
      <RightSidebar
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title="Détails de l'alerte"
        width="w-96"
      >
        {selectedAlert && (
          <div className="space-y-6">
            <div className="bg-slate-50/80 rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-slate-800">
                {selectedAlert.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {selectedAlert.description || "—"}
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  label: "Priorité",
                  node: (
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getPriorityColor(selectedAlert.priority)}`}
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
                  label: "Ville",
                  node: (
                    <span className="text-sm text-slate-700">
                      {selectedAlert.city || "—"}
                    </span>
                  ),
                },
                {
                  label: "Adresse",
                  node: (
                    <span className="text-sm text-slate-700">
                      {selectedAlert.address || "—"}
                    </span>
                  ),
                },
                {
                  label: "GPS",
                  node: (
                    <span className="text-xs text-slate-500">
                      {parseFloat(selectedAlert.latitude).toFixed(4)},{" "}
                      {parseFloat(selectedAlert.longitude).toFixed(4)}
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
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedAlert(null)}
                className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </RightSidebar>
    </div>
  );
};

export default Map;
