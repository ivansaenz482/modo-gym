import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getUserPhotos } from "../config";
import "./Gallery.css";

const defaultProjects = [
  {
    src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop",
    title: "Zona de musculación",
    cat: "Instalaciones",
  },
  {
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop",
    title: "Entrenamiento funcional",
    cat: "Clases",
  },
  {
    src: "https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=1200&auto=format&fit=crop",
    title: "CrossFit WOD",
    cat: "Clases",
  },
  {
    src: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1200&auto=format&fit=crop",
    title: "Área de cardio",
    cat: "Instalaciones",
  },
  {
    src: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1200&auto=format&fit=crop",
    title: "Entrenador personal",
    cat: "Equipo",
  },
  {
    src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop",
    title: "Pesas libres",
    cat: "Instalaciones",
  },
  {
    src: `${import.meta.env.BASE_URL}photos/istockphoto-2234496580-612x612.jpg`,
    title: "Entrenamiento de pecho",
    cat: "Clases",
  },
];

const filters = ["Todos", "Instalaciones", "Clases", "Equipo", "Mías"];

export default function Gallery() {
  const [active, setActive] = useState("Todos");
  const [userPhotos, setUserPhotos] = useState([]);

  useEffect(() => {
    const sync = () => setUserPhotos(getUserPhotos());
    sync();
    window.addEventListener("marph-photos", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("marph-photos", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const projects = [...userPhotos, ...defaultProjects];
  const filtered =
    active === "Todos"
      ? projects
      : active === "Mías"
        ? userPhotos
        : projects.filter((p) => p.cat === active);

  return (
    <section className="gallery" id="galeria">
      <div className="container">
        <motion.div
          className="gallery-head"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">Galería</span>
          <h2 className="section-title">
            Nuestras <span className="gold-text">instalaciones</span>
          </h2>
        </motion.div>

        <div className="gallery-filters">
          {filters.map((f) => (
            <button
              key={f}
              className={`filter-btn ${active === f ? "active" : ""}`}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <motion.div layout className="gallery-grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <motion.figure
                layout
                key={p.src}
                className="gallery-item"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                whileHover="hover"
              >
                <img src={p.src} alt={p.title} loading="lazy" />
                <motion.figcaption
                  className="gallery-caption"
                  initial="rest"
                  animate="rest"
                  variants={{
                    rest: { opacity: 0, y: 20 },
                    hover: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="gallery-cat">{p.cat}</span>
                  <h3>{p.title}</h3>
                </motion.figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
