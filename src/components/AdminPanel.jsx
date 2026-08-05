import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  getConfig,
  saveConfig,
  getUserPhotos,
  saveUserPhotos,
  defaultConfig,
} from "../config";
import "./AdminPanel.css";

export default function AdminPanel({ open, onClose }) {
  const [cfg, setCfg] = useState(getConfig());
  const [photos, setPhotos] = useState(getUserPhotos());
  const [urlInput, setUrlInput] = useState("");
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setCfg(getConfig());
      setPhotos(getUserPhotos());
    }
  }, [open]);

  const notify = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const updateField = (key, value) => {
    const next = { ...cfg, [key]: value };
    setCfg(next);
    saveConfig(next);
    window.dispatchEvent(new Event("marph-config"));
  };

  const addByUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      notify("La URL debe comenzar con http:// o https://");
      return;
    }
    const next = [...photos, { src: url, title: `Foto ${photos.length + 1}`, cat: "Mías" }];
    setPhotos(next);
    saveUserPhotos(next);
    setUrlInput("");
    notify("Foto añadida por URL ✓");
  };

  const addByFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Solo se aceptan imágenes");
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      notify("La imagen es muy grande (máx. 2.5 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...photos, { src: reader.result, title: file.name.split(".")[0], cat: "Mías" }];
      setPhotos(next);
      saveUserPhotos(next);
      notify("Foto guardada en este navegador ✓");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removePhoto = (i) => {
    const next = photos.filter((_, idx) => idx !== i);
    setPhotos(next);
    saveUserPhotos(next);
    notify("Foto eliminada");
  };

  const resetPhotos = () => {
    setPhotos([]);
    saveUserPhotos([]);
    notify("Galería personalizada restablecida");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="admin-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="admin-panel"
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-head">
              <h2>Panel de administrador</h2>
              <button className="admin-close" onClick={onClose} aria-label="Cerrar">
                ✕
              </button>
            </div>

            {msg && <div className="admin-msg">{msg}</div>}

            <section className="admin-section">
              <h3>Contacto</h3>
              <label>
                WhatsApp (número visible)
                <input
                  type="text"
                  value={cfg.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="0985136117"
                />
              </label>
              <label>
                WhatsApp internacional (con código del país, sin + ni espacios)
                <input
                  type="text"
                  value={cfg.whatsappIntl}
                  onChange={(e) => updateField("whatsappIntl", e.target.value)}
                  placeholder="593985136117"
                />
                <small>
                  Ejemplo: Ecuador 593 + número sin el 0 inicial → 593985136117
                </small>
              </label>
              <label>
                Usuario de Instagram (sin @)
                <input
                  type="text"
                  value={cfg.instagram}
                  onChange={(e) => updateField("instagram", e.target.value)}
                  placeholder="modogym"
                />
              </label>
              <label>
                Dirección del gimnasio
                <input
                  type="text"
                  value={cfg.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Av. Principal 1234, Quito"
                />
              </label>
            </section>

            <section className="admin-section">
              <h3>Mis fotos</h3>
              <p className="admin-note">
                Las fotos guardadas aquí solo se ven en este navegador. Para que
                todos las vean, súbelas al repositorio en{" "}
                <code>public/photos/</code> y añádelas por URL como{" "}
                <code>modo-gym/photos/foto.jpg</code>. También puedes usar
                cualquier enlace de Internet.
              </p>

              <div className="admin-upload-row">
                <button className="btn btn-primary" onClick={() => fileRef.current?.click()}>
                  Subir archivo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={addByFile}
                />
                <input
                  type="url"
                  className="admin-url-input"
                  placeholder="Pegar URL de la imagen..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addByUrl()}
                />
                <button className="btn btn-ghost" onClick={addByUrl}>
                  Añadir
                </button>
              </div>

              {photos.length > 0 && (
                <>
                  <ul className="admin-photos">
                    {photos.map((p, i) => (
                      <li key={i}>
                        <img src={p.src} alt={p.title} />
                        <span className="admin-photo-title">{p.title}</span>
                        <button
                          className="admin-remove"
                          onClick={() => removePhoto(i)}
                          aria-label="Eliminar"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button className="admin-reset" onClick={resetPhotos}>
                    Restablecer galería predeterminada
                  </button>
                </>
              )}
              {photos.length === 0 && (
                <p className="admin-empty">Aún no tienes fotos personalizadas.</p>
              )}
            </section>

            <div className="admin-foot">
              <button
                className="btn btn-ghost"
                onClick={() => updateField("whatsappIntl", defaultConfig.whatsappIntl)}
              >
                Restaurar valores por defecto
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Listo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
