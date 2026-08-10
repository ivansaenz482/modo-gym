import { motion } from "framer-motion";
import "./Schedule.css";

const schedule = [
  { day: "Lunes", classes: ["CrossFit 7am", "Funcional 10am", "Box 6pm", "Spinning 7pm"] },
  { day: "Martes", classes: ["Musculación 7am", "Yoga 9am", "Funcional 6pm", "CrossFit 7pm"] },
  { day: "Miércoles", classes: ["CrossFit 7am", "Box 10am", "Spinning 6pm", "Funcional 7pm"] },
  { day: "Jueves", classes: ["Musculación 7am", "Yoga 9am", "CrossFit 6pm", "Box 7pm"] },
  { day: "Viernes", classes: ["CrossFit 7am", "Funcional 10am", "Spinning 6pm", "Box 7pm"] },
  { day: "Sábado", classes: ["CrossFit 9am", "Funcional 10am", "Yoga 11am"] },
];

export default function Schedule() {
  return (
    <section className="schedule" id="horarios">
      <div className="container">
        <motion.div
          className="schedule-head"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">Horarios</span>
          <h2 className="section-title">
            Clases de la <span className="gold-text">semana</span>
          </h2>
        </motion.div>

        <div className="schedule-grid">
          {schedule.map((d, i) => (
            <motion.div
              className="schedule-day"
              key={d.day}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <h3>{d.day}</h3>
              <ul>
                {d.classes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <p className="schedule-note">
          * El acceso a la sala de musculación y cardio es libre en horario de
          apertura del gimnasio.
        </p>
      </div>
    </section>
  );
}
