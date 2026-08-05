import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import "./Stats.css";

const stats = [
  { value: "800+", label: "Miembros activos" },
  { value: "15", label: "Entrenadores certificados" },
  { value: "24/7", label: "Horario de acceso" },
  { value: "3000m²", label: "De equipamiento" },
];

export default function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="stats" ref={ref}>
      <div className="container stats-grid">
        {stats.map((s, i) => (
          <motion.div
            className="stat"
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12, duration: 0.7, ease: "easeOut" }}
          >
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
