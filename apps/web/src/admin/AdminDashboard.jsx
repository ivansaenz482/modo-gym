import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, clearToken, mediaUrl } from "../api";
import QrPanel from "./QrPanel";

const tabs = [
  { id: "resumen", label: "Resumen" },
  { id: "clientes", label: "Clientes" },
  { id: "ejercicios", label: "Ejercicios" },
  { id: "qr", label: "Códigos QR" },
];

const muscleGroups = ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Pierna", "Core", "Glúteos", "Gemelos", "Cardio"];
const categories = ["Fuerza", "Aislamiento", "Peso corporal", "Cardio", "Máquinas"];

const IMG_ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VID_ACCEPT = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMG = 5 * 1024 * 1024;
const MAX_VID = 50 * 1024 * 1024;

export default function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("resumen");
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [exercises, setExercises] = useState([]);
  const [exLoading, setExLoading] = useState(false);
  const [form, setForm] = useState({ name: "", muscleGroup: "Pecho", category: "Fuerza", description: "" });
  const [busy, setBusy] = useState({});

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

  const loadExercises = async () => {
    setExLoading(true);
    try {
      const data = await api.getExercises();
      setExercises(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setExLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadExercises();
  }, []);

  const openClient = async (id) => {
    try {
      const detail = await api.getClient(id);
      setSelected(detail);
    } catch (err) {
      setError(err.message);
    }
  };

  const notify = (text, isError = false) => {
    setError(isError ? text : "");
    if (!isError) setMsg(text);
    setTimeout(() => (isError ? setError("") : setMsg("")), 3500);
  };

  const createExercise = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (name.length < 2) return notify("El nombre debe tener al menos 2 caracteres", true);
    setBusy((b) => ({ ...b, _create: true }));
    try {
      const created = await api.createExercise(form);
      notify("Ejercicio creado ✓");
      setForm({ name: "", muscleGroup: form.muscleGroup, category: form.category, description: "" });
      await loadExercises();
    } catch (err) {
      notify(err.message, true);
    } finally {
      setBusy((b) => ({ ...b, _create: false }));
    }
  };

  const uploadMedia = async (exercise, kind, file) => {
    const accept = kind === "imageUrl" ? IMG_ACCEPT : VID_ACCEPT;
    const max = kind === "imageUrl" ? MAX_IMG : MAX_VID;
    const label = kind === "imageUrl" ? "imagen" : "video";
    if (!accept.includes(file.type)) return notify(`Solo se permiten ${kind === "imageUrl" ? "imágenes" : "videos"}`, true);
    if (file.size > max) return notify(`El ${label} supera el máximo de ${Math.round(max / 1024 / 1024)} MB`, true);

    setBusy((b) => ({ ...b, [exercise.id]: { ...(b[exercise.id] || {}), [kind]: true } }));
    try {
      const uploaded = await api.uploadFile(file);
      const updated = await api.updateExercise(exercise.id, { [kind]: uploaded.url });
      setExercises((list) => list.map((ex) => (ex.id === updated.id ? updated : ex)));
      notify(`${label === "imagen" ? "Foto" : "Video"} subido ✓`);
    } catch (err) {
      notify(err.message, true);
    } finally {
      setBusy((b) => ({ ...b, [exercise.id]: { ...(b[exercise.id] || {}), [kind]: false } }));
    }
  };

  const clearMedia = async (exercise, kind) => {
    setBusy((b) => ({ ...b, [exercise.id]: { ...(b[exercise.id] || {}), [kind]: true } }));
    try {
      const updated = await api.updateExercise(exercise.id, { [kind]: "" });
      setExercises((list) => list.map((ex) => (ex.id === updated.id ? updated : ex)));
      notify(`${kind === "imageUrl" ? "Foto" : "Video"} eliminado`);
    } catch (err) {
      notify(err.message, true);
    } finally {
      setBusy((b) => ({ ...b, [exercise.id]: { ...(b[exercise.id] || {}), [kind]: false } }));
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
      {msg && <div className="admin-msg">{msg}</div>}

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
                <span className="admin-stat-num">{exercises.length}</span>
                <span className="admin-stat-label">Ejercicios en biblioteca</span>
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

          {tab === "ejercicios" && (
            <div className="admin-ex-view">
              <form className="admin-ex-form" onSubmit={createExercise}>
                <h3>Nuevo ejercicio</h3>
                <div className="admin-ex-form-grid">
                  <label>
                    Nombre
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Press de banca"
                      required
                    />
                  </label>
                  <label>
                    Grupo muscular
                    <select
                      value={form.muscleGroup}
                      onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
                    >
                      {muscleGroups.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Categoría
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-ex-form-desc">
                    Descripción (opcional)
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Técnica, consejos..."
                    />
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" disabled={busy._create}>
                  {busy._create ? "Creando..." : "Crear ejercicio"}
                </button>
              </form>

              <div className="admin-ex-grid">
                {exLoading ? (
                  <p className="admin-empty">Cargando ejercicios...</p>
                ) : exercises.length === 0 ? (
                  <p className="admin-empty">No hay ejercicios. Crea el primero arriba.</p>
                ) : (
                  exercises.map((ex) => {
                    const img = mediaUrl(ex.imageUrl);
                    const vid = mediaUrl(ex.videoUrl);
                    return (
                      <div className="admin-ex-card" key={ex.id}>
                        <div className="admin-ex-thumb">
                          {img ? (
                            <img src={img} alt={ex.name} />
                          ) : (
                            <span className="admin-ex-placeholder">Sin foto</span>
                          )}
                          {vid && <span className="admin-ex-badge">▶ Video</span>}
                        </div>
                        <div className="admin-ex-info">
                          <b>{ex.name}</b>
                          <small>{ex.muscleGroup} · {ex.category}</small>
                        </div>
                        <div className="admin-ex-actions">
                          <label className={`btn btn-ghost ${busy[ex.id]?.imageUrl ? "disabled" : ""}`}>
                            {busy[ex.id]?.imageUrl ? "Subiendo..." : "Foto"}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadMedia(ex, "imageUrl", f);
                                e.target.value = "";
                              }}
                            />
                          </label>
                          <label className={`btn btn-ghost ${busy[ex.id]?.videoUrl ? "disabled" : ""}`}>
                            {busy[ex.id]?.videoUrl ? "Subiendo..." : "Video"}
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadMedia(ex, "videoUrl", f);
                                e.target.value = "";
                              }}
                            />
                          </label>
                          {(img || vid) && (
                            <button
                              className="btn btn-danger"
                              onClick={() => clearMedia(ex, img && !vid ? "imageUrl" : "videoUrl")}
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {tab === "qr" && <QrPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
