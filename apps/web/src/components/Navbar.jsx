import { motion } from "framer-motion";
import { useState } from "react";
import "./Navbar.css";

const links = [
  { label: "Inicio", href: "#inicio" },
  { label: "Clases", href: "#clases" },
  { label: "Planes", href: "#planes" },
  { label: "Horarios", href: "#horarios" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      className="nav"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="container nav-inner">
        <a href="#inicio" className="brand">
          MODO<span className="brand-accent">GYM</span>
        </a>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#planes" className="btn btn-primary nav-cta">
            Empezar ahora
          </a>
        </nav>

        <button
          className={`hamburger ${open ? "active" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </motion.header>
  );
}
