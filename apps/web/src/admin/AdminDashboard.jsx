import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, clearToken } from "../api";
import QrPanel from "./QrPanel";

const tabs = [
  { id: "resumen", label: "Resumen" },
  { id: "clientes", label: "Clientes" },
  { id: "qr", label: "Códigos QR" },
];

export default function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("resumen");
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getClients();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openClient = async (id) => {
    try {
      const detail = await api.getClient(id);
      setSelected(detail);
    } catch (err) {
      setError(err.message);
    }
  };

  const activeRoutines = clients.filter((c) => c.activeRoutineCount > 0).length;

  return (
    <div className="admin-dash">
      <header className="admin-dash-head">
        <div>
          <h1 className="admin-dash-title">Hola, {user?.name || "Admin"} 👋</h1>
          <p className="admin-dash-sub">Panel de gestión de MODO GYM</p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => {
            clearToken();
            onLogout();
          }}
        >
          Cerrar sesión
        </button>
      </header>

      <nav className="admin-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error && <div className="admin-msg admin-msg-error">{error}</div>}

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "resumen" && (
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <span className="admin-stat-num">{clients.length}</span>
                <span className="admin-stat-label">Clientes registrados</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-num">{activeRoutines}</span>
                <span className="admin-stat-label">Clientes con rutina activa</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-num">
                  {clients.reduce((acc, c) => acc + (c.progressCount || 0), 0)}
                </span>
                <span className="admin-stat-label">Registros de progreso</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-num">2</span>
                <span className="admin-stat-label">Códigos QR disponibles</span>
              </div>
            </div>
          )}

          {tab === "clientes" && (
            <div className="admin-clients-view">
              {loading ? (
                <p className="admin-empty">Cargando clientes...</p>
              ) : (
                <>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Email</th>
                          <th>Edad</th>
                          <th>Rutinas</th>
                          <th>Progresos</th>
                          <th>Alta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clients.map((c) => (
                          <tr key={c.id} onClick={() => openClient(c.id)}>
                            <td>
                              <span className="admin-client-name">{c.name}</span>
                            </td>
                            <td>{c.email}</td>
                            <td>{c.age ?? "—"}</td>
                            <td>{c.activeRoutineCount}</td>
                            <td>{c.progressCount}</td>
                            <td>{new Date(c.createdAt).toLocaleDateString("es")}</td>
                          </tr>
                        ))}
                        {clients.length === 0 && (
                          <tr>
                            <td colSpan="6" className="admin-empty">
                              Aún no hay clientes registrados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <AnimatePresence>
                    {selected && (
                      <motion.div
                        className="admin-client-detail"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                      >
                        <div className="admin-detail-head">
                          <div>
                            <h2>{selected.name}</h2>
                            <p className="admin-detail-meta">
                              {selected.email} · {selected.phone || "Sin teléfono"} ·{" "}
                              {selected.age ?? "¿?"} años
                            </p>
                          </div>
                          <button className="admin-close" onClick={() => setSelected(null)}>
                            ✕
                          </button>
                        </div>

                        <div className="admin-detail-grid">
                          <section>
                            <h3>Perfil</h3>
                            <ul className="admin-detail-list">
                              <li>
                                <span>Altura</span>
                                <b>{selected.heightCm ? `${selected.heightCm} cm` : "—"}</b>
                              </li>
                              <li>
                                <span>Peso inicial</span>
                                <b>{selected.startWeightKg ? `${selected.startWeightKg} kg` : "—"}</b>
                              </li>
                              <li>
                                <span>Objetivo</span>
                                <b>{selected.goal || "—"}</b>
                              </li>
                              <li>
                                <span>Días / semana</span>
                                <b>{selected.daysPerWeek ?? "—"}</b>
                              </li>
                            </ul>
                          </section>

                          <section>
                            <h3>Rutinas</h3>
                            {selected.routines?.length ? (
                              <ul className="admin-detail-list">
                                {selected.routines.map((r) => (
                                  <li key={r.id}>
                                    <span>{r.name}</span>
                                    <b>{r.exercises.length} ejercicios</b>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="admin-empty">Sin rutinas todavía.</p>
                            )}
                          </section>

                          <section>
                            <h3>Progreso</h3>
                            {selected.progress?.length ? (
                              <ul className="admin-detail-list">
                                {selected.progress.slice(-5).reverse().map((p) => (
                                  <li key={p.id}>
                                    <span>{new Date(p.date).toLocaleDateString("es")}</span>
                                    <b>{p.weightKg ? `${p.weightKg} kg` : "—"}</b>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="admin-empty">Sin registros de progreso.</p>
                            )}
                          </section>

                          <section>
                            <h3>Nutrición</h3>
                            {selected.nutritionPlan ? (
                              <p className="admin-detail-note">
                                {selected.nutritionPlan.dailyCalories
                                  ? `Meta: ${selected.nutritionPlan.dailyCalories} kcal/día · `
                                  : ""}
                                {selected.nutritionPlan.proteinG
                                  ? `${selected.nutritionPlan.proteinG}g proteína · `
                                  : ""}
                                {selected.nutritionPlan.carbsG
                                  ? `${selected.nutritionPlan.carbsG}g carbohidratos · `
                                  : ""}
                                {selected.nutritionPlan.fatG
                                  ? `${selected.nutritionPlan.fatG}g grasas`
                                  : ""}
                              </p>
                            ) : (
                              <p className="admin-empty">Sin plan nutricional.</p>
                            )}
                          </section>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          )}

          {tab === "qr" && <QrPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
