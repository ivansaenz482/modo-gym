import { motion } from "framer-motion";
import "./Classes.css";

const classes = [
  {
    icon: "🏋️",
    title: "Musculación",
    desc: "Zona de pesas completa con equipamiento de última generación para ganar fuerza y masa muscular.",
  },
  {
    icon: "🔥",
    title: "CrossFit",
    desc: "Entrenamientos de alta intensidad (WOD) que combinan fuerza, resistencia y velocidad.",
  },
  {
    icon: "⚡",
    title: "Funcional",
    desc: "Circuitos que mejoran tu rendimiento en la vida real: equilibrio, movilidad y coordinación.",
  },
  {
    icon: "🚴",
    title: "Spinning",
    desc: "Clases de ciclismo indoor con música y ritmo para quemar calorías a otro nivel.",
  },
  {
    icon: "🥊",
    title: "Box",
    desc: "Entrenamiento de boxeo para cardio explosivo, reflejos y disciplina mental.",
  },
  {
    icon: "🧘",
    title: "Yoga & Movilidad",
    desc: "Recuperación, flexibilidad y control corporal para complementar tu entrenamiento.",
  },
];

export default function Classes() {
  return (
    <section className="classes" id="clases">
      <div className="container">
        <motion.div
          className="classes-head"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">Nuestras disciplinas</span>
          <h2 className="section-title">
            Elige tu <span className="gold-text">entrenamiento</span>
          </h2>
        </motion.div>

        <div className="classes-grid">
          {classes.map((c, i) => (
            <motion.article
              className="class-card"
              key={c.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 3) * 0.12, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -8 }}
            >
              <div className="class-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <a href="#planes" className="class-link">
                Incluido en planes →
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
