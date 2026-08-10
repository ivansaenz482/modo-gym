import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getConfig, waLink, igLink } from "../config";
import "./SocialButtons.css";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.7 6L4 29l8.2-1.6c1.2.6 2.5 1 3.8 1 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.7 0-3.4-.5-4.9-1.3l-.4-.2-4.8 1 1-4.7-.2-.4C6 17.7 5.5 16 5.5 14 5.5 9.2 9.2 5.5 16 5.5s10.5 3.7 10.5 8.5-3.7 8.8-10.5 8.8zm5.4-6c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6l.4-.6c.1-.2.2-.3.3-.5s0-.4 0-.6c0-.1-.7-1.8-1-2.4-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.4c.2.2 2.4 3.7 5.9 5.1.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function SocialButtons() {
  const [cfg, setCfg] = useState(getConfig());

  useEffect(() => {
    const sync = () => setCfg(getConfig());
    window.addEventListener("marph-config", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("marph-config", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className="social-buttons">
      <motion.a
        className="social-btn social-wa"
        href={waLink(cfg)}
        target="_blank"
        rel="noreferrer"
        aria-label="Escríbenos por WhatsApp"
        title={`WhatsApp: ${cfg.whatsapp}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <WhatsAppIcon />
      </motion.a>
      <motion.a
        className="social-btn social-ig"
        href={igLink(cfg)}
        target="_blank"
        rel="noreferrer"
        aria-label="Síguenos en Instagram"
        title={`Instagram: @${cfg.instagram}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.75, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <InstagramIcon />
      </motion.a>
    </div>
  );
}
