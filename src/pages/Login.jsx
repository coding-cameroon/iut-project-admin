import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNotifications } from "../contexts/NotificationContext.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  const { showError } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch {
      showError("Identifiants incorrects. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo + title */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-800">
            Connexion à Sécurité
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Plateforme de gestion des incidents
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="admin@securite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Se souvenir de moi
            </label>
            <a
              href="#"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Mot de passe oublié?
            </a>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition shadow-sm shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
