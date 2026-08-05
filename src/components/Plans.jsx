import { motion } from "framer-motion";
import "./Plans.css";

const plans = [
  {
    name: "Diario",
    price: "$1.75",
    period: "/ día",
    desc: "Pruébanos sin compromiso",
    features: [
      "Acceso por un día",
      "Zona de pesas y cardio",
      "Clase guiada incluida",
      "Locker y regaderas",
    ],
    highlight: false,
    cta: "Probar un día",
  },
  {
    name: "Mensual",
    price: "$20",
    period: "/ mes",
    desc: "El plan para empezar tu cambio",
    features: [
      "Acceso libre en horario completo",
      "Musculación y cardio",
      "Todas las clases incluidas",
      "Evaluación inicial",
      "App con rutinas",
    ],
    highlight: false,
    cta: "Elegir Mensual",
  },
  {
    name: "Trimestral",
    price: "$50",
    period: "/ trimestre",
    desc: "El mejor precio, ahorra mes a mes",
    features: [
      "Todo lo del plan mensual",
      "Acceso 24/7",
      "Clases ilimitadas",
      "Rutina personalizada mensual",
      "Plan nutricional básico",
      "Invitado gratis 1 vez al mes",
    ],
    highlight: true,
    cta: "Elegir Trimestral",
  },
];

export default function Plans() {
  return (
    <section className="plans" id="planes">
      <div className="container">
        <motion.div
          className="plans-head"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">Membresías</span>
          <h2 className="section-title">
            Planes y <span className="gold-text">precios</span>
          </h2>
          <p className="plans-sub">
            Sin contratos ocultos. Cancela cuando quieras. Primera semana de
            prueba por solo $10.
          </p>
        </motion.div>

        <div className="plans-grid">
          {plans.map((p, i) => (
            <motion.article
              className={`plan-card ${p.highlight ? "highlight" : ""}`}
              key={p.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -8 }}
            >
              {p.highlight && <div className="plan-badge">Mejor valor</div>}
              <h3 className="plan-name">{p.name}</h3>
              <div className="plan-price">
                {p.price}
                <span className="plan-period">{p.period}</span>
              </div>
              <p className="plan-desc">{p.desc}</p>
              <ul className="plan-features">
                {p.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <a href="#contacto" className={`btn ${p.highlight ? "btn-primary" : "btn-ghost"} plan-cta`}>
                {p.cta}
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
