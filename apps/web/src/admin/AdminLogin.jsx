import { motion } from "framer-motion";
import { useState } from "react";
import { api, setToken } from "../api";
import "./Admin.css";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      setToken(data.accessToken);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="admin-login-brand">
          MODO<span>GYM</span>
        </div>
        <h1 className="admin-login-title">Panel del administrador</h1>
        <p className="admin-login-sub">Accede para gestionar a tus clientes</p>

        {error && <div className="admin-msg admin-msg-error">{error}</div>}

        <form onSubmit={submit} className="admin-login-form">
          <label>
            Correo electrónico
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@modogym.com"
              autoComplete="email"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          <button className="btn btn-primary admin-login-btn" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="admin-login-hint">
          Usuario demo: <code>admin@modogym.com</code> / <code>admin123</code>
        </p>
      </motion.div>
    </div>
  );
}
