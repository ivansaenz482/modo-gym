import { motion } from "framer-motion";
import "./Hero.css";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: "easeOut" },
  }),
};

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-bg" />
      <div className="hero-overlay" />

      <div className="container hero-content">
        <motion.span
          className="hero-tag"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          Gimnasio & entrenamiento funcional
        </motion.span>

        <motion.h1
          className="hero-title"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          Forja tu <span className="accent">mejor versión</span>
        </motion.h1>

        <motion.p
          className="hero-sub"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          Entrenamiento funcional, crossfit, musculación y más. Planes para
          todos los niveles con entrenadores certificados.
        </motion.p>

        <motion.div
          className="hero-actions"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <a href="#planes" className="btn btn-primary">
            Ver planes
          </a>
          <a href="#clases" className="btn btn-ghost">
            Conoce las clases
          </a>
        </motion.div>
      </div>
    </section>
  );
}
