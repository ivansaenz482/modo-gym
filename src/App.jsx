import { motion } from "framer-motion";
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
import { useState } from "react";

export default function App() {
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
