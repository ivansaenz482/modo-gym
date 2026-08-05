import { motion } from "framer-motion";
import "./Plans.css";

const plans = [
  {
    name: "Pase de día",
    price: "$5",
    period: "/ día",
    desc: "Perfecto para probar el gimnasio",
    features: [
      "Acceso a todas las zonas",
      "Clase guiada incluida",
      "Locker y regaderas",
      "Acceso por un día",
    ],
    highlight: false,
    cta: "Probar un día",
  },
  {
    name: "Básico",
    price: "$25",
    period: "/ mes",
    desc: "Lo esencial para entrenar libre",
    features: [
      "Acceso libre en horario 6am–10pm",
      "Musculación y cardio",
      "Evaluación inicial",
      "App con rutinas",
    ],
    highlight: false,
    cta: "Elegir Básico",
  },
  {
    name: "Pro",
    price: "$40",
    period: "/ mes",
    desc: "El favorito de nuestros miembros",
    features: [
      "Acceso 24/7",
      "Todas las clases incluidas",
      "CrossFit y funcional ilimitado",
      "Rutina personalizada mensual",
      "Invitado gratis 1 vez al mes",
    ],
    highlight: true,
    cta: "Elegir Pro",
  },
  {
    name: "Premium",
    price: "$60",
    period: "/ mes",
    desc: "Experiencia completa con coach",
    features: [
      "Todo lo del plan Pro",
      "4 sesiones de personal trainer",
      "Plan nutricional básico",
      "Acceso a sauna y spa",
      "Seguimiento de resultados",
    ],
    highlight: false,
    cta: "Elegir Premium",
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
              {p.highlight && <div className="plan-badge">Más popular</div>}
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
