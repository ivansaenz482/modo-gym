import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import "./Testimonials.css";

const testimonials = [
  {
    quote:
      "En 6 meses perdí 14 kilos y gané mucha fuerza. Los entrenadores son de otro nivel y las clases de CrossFit me engancharon.",
    name: "Carlos M.",
    role: "Miembro desde 2024",
  },
  {
    quote:
      "El plan Pro vale cada centavo: acceso 24/7 y clases ilimitadas. El mejor gimnasio de la zona, sin duda.",
    name: "Andrea L.",
    role: "Miembro Premium",
  },
  {
    quote:
      "Entrené con personal trainer y logré mi primera competencia de powerlifting. Instalaciones impecables y ambiente motivador.",
    name: "Jorge P.",
    role: "Miembro Pro",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const t = testimonials[index];

  return (
    <section className="testimonials" id="opiniones">
      <div className="container">
        <motion.div
          className="testimonials-head"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">Testimonios</span>
          <h2 className="section-title">
            Resultados <span className="gold-text">reales</span>
          </h2>
        </motion.div>

        <div className="slider">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              className="testimonial"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <p className="quote">"{t.quote}"</p>
              <footer>
                <div className="author">{t.name}</div>
                <div className="role">{t.role}</div>
              </footer>
            </motion.blockquote>
          </AnimatePresence>

          <div className="dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === index ? "active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Testimonio ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
