import { useState } from "react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Sécurité Temps Réel",
    siteDescription:
      "Plateforme de gestion et de signalement d'incidents de sécurité",
    contactEmail: "contact@securite.com",
    timezone: "Europe/Paris",
    language: "fr",
    itemsPerPage: 10,
    autoRefresh: true,
    refreshInterval: 30,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    alertTypes: { high: true, medium: true, low: false },
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 60,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    twoFactorAuth: false,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
  });

  const [systemSettings, setSystemSettings] = useState({
    logLevel: "info",
    backupEnabled: true,
    backupFrequency: "daily",
    backupRetention: 30,
    maintenanceMode: false,
    apiRateLimit: 1000,
    maxFileSize: 10,
  });

  const tabs = [
    { id: 0, name: "Général" },
    { id: 1, name: "Notifications" },
    { id: 2, name: "Sécurité" },
    { id: 3, name: "Système" },
    { id: 4, name: "Sauvegarde" },
  ];

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Wire to a real settings API endpoint when available
      await new Promise((r) => setTimeout(r, 600));
      setSuccess("Paramètres sauvegardés avec succès");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmAction = (action) => {
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  const executeAction = () => {
    const messages = {
      backup: "Sauvegarde lancée avec succès",
      restore: "Restauration lancée avec succès",
      reset: "Paramètres réinitialisés",
    };
    setSuccess(messages[confirmAction] ?? "");
    setConfirmDialogOpen(false);
    setConfirmAction(null);
    setTimeout(() => setSuccess(""), 3000);
  };

  const exportSettings = () => {
    const settings = {
      general: generalSettings,
      notifications: notificationSettings,
      security: securitySettings,
      system: systemSettings,
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settings_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const s = JSON.parse(ev.target.result);
        if (s.general) setGeneralSettings(s.general);
        if (s.notifications) setNotificationSettings(s.notifications);
        if (s.security) setSecuritySettings(s.security);
        if (s.system) setSystemSettings(s.system);
        setSuccess("Paramètres importés avec succès");
        setTimeout(() => setSuccess(""), 3000);
      } catch {
        setError("Fichier invalide");
      }
    };
    reader.readAsText(file);
  };

  const inputClass =
    "w-full px-3 py-2 bg-white border-0 ring-1 ring-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";
  const labelClass =
    "block text-xs font-medium text-slate-600 uppercase tracking-wider mb-1";
  const checkRow = (id, label, checked, onChange) => (
    <div key={id} className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <label htmlFor={id} className="text-sm text-slate-700">
        {label}
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            Paramètres
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configuration avancée de la plateforme
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200 disabled:opacity-60"
        >
          {saving && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      {/* Feedback */}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Tabs + content */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        {/* Tab nav */}
        <div className="border-b border-slate-100 px-5 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* General */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Général</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Nom du site</label>
                  <input
                    type="text"
                    value={generalSettings.siteName}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        siteName: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email de contact</label>
                  <input
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        contactEmail: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Fuseau horaire</label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        timezone: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Africa/Douala">Africa/Douala</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Langue</label>
                  <select
                    value={generalSettings.language}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        language: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Éléments par page</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={generalSettings.itemsPerPage}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        itemsPerPage: parseInt(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Intervalle de rafraîchissement (sec)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={generalSettings.refreshInterval}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        refreshInterval: parseInt(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={generalSettings.autoRefresh}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      autoRefresh: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="autoRefresh" className="text-sm text-slate-700">
                  Rafraîchissement automatique
                </label>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Notifications
              </h2>
              <div className="space-y-3">
                {checkRow(
                  "emailAlerts",
                  "Alertes par email",
                  notificationSettings.emailAlerts,
                  (e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      emailAlerts: e.target.checked,
                    }),
                )}
                {checkRow(
                  "smsAlerts",
                  "Alertes par SMS",
                  notificationSettings.smsAlerts,
                  (e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      smsAlerts: e.target.checked,
                    }),
                )}
                {checkRow(
                  "pushNotifications",
                  "Notifications push",
                  notificationSettings.pushNotifications,
                  (e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      pushNotifications: e.target.checked,
                    }),
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">
                  Types d'alertes
                </p>
                <div className="space-y-2">
                  {checkRow(
                    "alertHigh",
                    "Haute priorité",
                    notificationSettings.alertTypes.high,
                    (e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        alertTypes: {
                          ...notificationSettings.alertTypes,
                          high: e.target.checked,
                        },
                      }),
                  )}
                  {checkRow(
                    "alertMedium",
                    "Moyenne priorité",
                    notificationSettings.alertTypes.medium,
                    (e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        alertTypes: {
                          ...notificationSettings.alertTypes,
                          medium: e.target.checked,
                        },
                      }),
                  )}
                  {checkRow(
                    "alertLow",
                    "Basse priorité",
                    notificationSettings.alertTypes.low,
                    (e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        alertTypes: {
                          ...notificationSettings.alertTypes,
                          low: e.target.checked,
                        },
                      }),
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Sécurité</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Délai de session (min)</label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: parseInt(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Longueur min. mot de passe
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="32"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        passwordMinLength: parseInt(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Tentatives max avant blocage
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        maxLoginAttempts: parseInt(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Durée de blocage (min)</label>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={securitySettings.lockoutDuration}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        lockoutDuration: parseInt(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-3">
                {checkRow(
                  "reqUpper",
                  "Exiger des majuscules",
                  securitySettings.passwordRequireUppercase,
                  (e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      passwordRequireUppercase: e.target.checked,
                    }),
                )}
                {checkRow(
                  "reqNum",
                  "Exiger des chiffres",
                  securitySettings.passwordRequireNumbers,
                  (e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      passwordRequireNumbers: e.target.checked,
                    }),
                )}
                {checkRow(
                  "reqSpecial",
                  "Caractères spéciaux",
                  securitySettings.passwordRequireSpecialChars,
                  (e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      passwordRequireSpecialChars: e.target.checked,
                    }),
                )}
                {checkRow(
                  "2fa",
                  "Authentification à deux facteurs",
                  securitySettings.twoFactorAuth,
                  (e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      twoFactorAuth: e.target.checked,
                    }),
                )}
              </div>
            </div>
          )}

          {/* System */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Système</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Niveau de journalisation</label>
                  <select
                    value={systemSettings.logLevel}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        logLevel: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Limite API (req/heure)</label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    value={systemSettings.apiRateLimit}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        apiRateLimit: parseInt(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Taille max fichier (MB)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={systemSettings.maxFileSize}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        maxFileSize: parseInt(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              {checkRow(
                "maintenance",
                "Mode maintenance",
                systemSettings.maintenanceMode,
                (e) =>
                  setSystemSettings({
                    ...systemSettings,
                    maintenanceMode: e.target.checked,
                  }),
              )}
            </div>
          )}

          {/* Backup */}
          {activeTab === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Sauvegarde & restauration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Fréquence</label>
                  <select
                    value={systemSettings.backupFrequency}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        backupFrequency: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="hourly">Horaire</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Rétention (jours)</label>
                  <input
                    type="number"
                    min="7"
                    max="365"
                    value={systemSettings.backupRetention}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        backupRetention: parseInt(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              {checkRow(
                "backupEnabled",
                "Activer les sauvegardes automatiques",
                systemSettings.backupEnabled,
                (e) =>
                  setSystemSettings({
                    ...systemSettings,
                    backupEnabled: e.target.checked,
                  }),
              )}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-medium text-slate-700 mb-4">
                  Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleConfirmAction("backup")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    Lancer sauvegarde
                  </button>
                  <button
                    onClick={() => handleConfirmAction("restore")}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition"
                  >
                    Restaurer
                  </button>
                  <button
                    onClick={exportSettings}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition"
                  >
                    Exporter paramètres
                  </button>
                </div>
                <div className="mt-4">
                  <label className={labelClass}>
                    Importer paramètres (JSON)
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmDialogOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 max-w-md w-full shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Confirmation
            </h3>
            <p className="text-sm text-slate-600 mb-5">
              {confirmAction === "backup" &&
                "Lancer une sauvegarde maintenant ?"}
              {confirmAction === "restore" &&
                "Restaurer une sauvegarde ? Cette action peut modifier les données."}
              {confirmAction === "reset" &&
                "Réinitialiser tous les paramètres ? Action irréversible."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialogOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
              >
                Annuler
              </button>
              <button
                onClick={executeAction}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
