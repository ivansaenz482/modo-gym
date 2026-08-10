import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer({ onAdmin }) {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="container footer-inner">
        <a href="#inicio" className="brand">
          MODO<span className="brand-accent">GYM</span>
        </a>

        <div className="footer-links">
          <a href="#clases">Clases</a>
          <a href="#planes">Planes</a>
          <a href="#horarios">Horarios</a>
          <a href="#contacto">Contacto</a>
        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} MODO GYM. Todos los derechos reservados.
        </p>

        <div className="footer-admin-row">
          <Link to="/admin" className="admin-trigger">
            🔐 Panel de administración
          </Link>
          <button className="admin-trigger" onClick={onAdmin}>
            🔧 Ajustes locales
          </button>
        </div>
      </div>
    </motion.footer>
  );
}
