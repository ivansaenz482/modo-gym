import { motion } from "framer-motion";
import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Classes from "./components/Classes";
import Plans from "./components/Plans";
import Schedule from "./components/Schedule";
import Gallery from "./components/Gallery";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import SocialButtons from "./components/SocialButtons";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import { useState } from "react";
import { isAuthenticated } from "./api";

function Landing() {
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Classes />
        <Plans />
        <Schedule />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer onAdmin={() => setAdminOpen(true)} />
      <SocialButtons />
      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
    </motion.div>
  );
}

function AdminPage() {
  const [user, setUser] = useState(null);

  if (!user && !isAuthenticated()) {
    return <AdminLogin onLogin={setUser} />;
  }

  return (
    <AdminDashboard user={user} onLogout={() => setUser(null)} />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route
        path="*"
        element={
          <div className="container" style={{ padding: "6rem 0", textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "3rem" }}>
              404 — No encontrado
            </h1>
            <Link to="/" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
              Volver al inicio
            </Link>
          </div>
        }
      />
    </Routes>
  );
}
