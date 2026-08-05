import { motion } from "framer-motion";
import { useState } from "react";
import { getConfig, waLink, igLink } from "../config";
import "./Contact.css";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const cfg = getConfig();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  const contactItems = [
    { icon: "📱", title: "WhatsApp", text: cfg.whatsapp, href: waLink(cfg) },
    { icon: "📸", title: "Instagram", text: `@${cfg.instagram}`, href: igLink(cfg) },
    { icon: "📍", title: "Dirección", text: cfg.address },
    { icon: "🕒", title: "Horario", text: "Lun a Vie 6am–10pm · Sáb 8am–2pm" },
  ];

  return (
    <section className="contact" id="contacto">
      <div className="container contact-grid">
        <motion.div
          className="contact-info"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">Contáctanos</span>
          <h2 className="section-title">
            Empieza hoy tu <span className="gold-text">transformación</span>
          </h2>
          <p className="contact-desc">
            Agenda tu prueba, consulta disponibilidad de planes o pide una
            evaluación inicial gratuita. Te respondemos rápido por WhatsApp.
          </p>

          <ul className="contact-list">
            {contactItems.map((c) => (
              <li key={c.title}>
                <span className="c-icon">{c.icon}</span>
                <div>
                  <strong>{c.title}</strong>
                  {c.href ? (
                    <a className="contact-link" href={c.href} target="_blank" rel="noreferrer">
                      {c.text}
                    </a>
                  ) : (
                    <span>{c.text}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="contact-socials">
            <a className="btn btn-primary" href={waLink(cfg)} target="_blank" rel="noreferrer">
              Escríbenos por WhatsApp
            </a>
            <a className="btn btn-ghost" href={igLink(cfg)} target="_blank" rel="noreferrer">
              Síguenos en Instagram
            </a>
          </div>
        </motion.div>

        <motion.form
          className="contact-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          {sent ? (
            <motion.div
              className="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="success-icon">✓</div>
              <h3>¡Mensaje enviado!</h3>
              <p>
                Gracias por contactarnos. Para una respuesta más rápida,
                escríbenos por WhatsApp.
              </p>
              <a
                className="btn btn-primary"
                style={{ marginTop: "1.5rem" }}
                href={waLink(cfg)}
                target="_blank"
                rel="noreferrer"
              >
                Abrir WhatsApp
              </a>
            </motion.div>
          ) : (
            <>
              <div className="form-row">
                <input type="text" placeholder="Tu nombre" required />
                <input type="tel" placeholder="Tu teléfono / WhatsApp" required />
              </div>
              <select required defaultValue="">
                <option value="" disabled>
                  ¿Qué te interesa?
                </option>
                <option>Probar el gimnasio</option>
                <option>Plan Pro / Premium</option>
                <option>Personal trainer</option>
                <option>CrossFit / Clases</option>
                <option>Planes corporativos</option>
              </select>
              <textarea
                placeholder="Cuéntanos tu objetivo (perder peso, ganar músculo, rendimiento...)"
                rows="5"
                required
              />
              <button type="submit" className="btn btn-primary btn-block">
                Enviar mensaje →
              </button>
            </>
          )}
        </motion.form>
      </div>
    </section>
  );
}
