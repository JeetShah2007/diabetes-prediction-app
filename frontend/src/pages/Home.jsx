import { Link } from "react-router-dom";
import ScrollReveal from "../components/ScrollReveal";
import { DISEASE_LIST } from "../config/diseaseConfigs";

export default function Home() {
  return (
    <div className="home-page">
      <ScrollReveal>
        <section className="hero">
          <h1>Your quick health check-in</h1>
          <p>
            Simple, plain-language risk checks for conditions that often matter most as we
            age — diabetes, heart health, and stroke. Answer a few basic questions, no lab
            coat required.
          </p>
        </section>
      </ScrollReveal>

      <div className="home-cards">
        {DISEASE_LIST.map((d, i) => (
          <ScrollReveal key={d.key} delay={i * 80}>
            <Link to={`/${d.key}`} className="home-card" style={{ "--accent": d.color }}>
              <span className="home-card-icon">{d.icon}</span>
              <h2>{d.title}</h2>
              <p>{d.tagline}</p>
              <span className="home-card-cta">Start check →</span>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal>
        <section className="home-note">
          <p>
            🩺 These are educational demo tools, not medical diagnoses. If you're worried
            about your health, please talk to a doctor — these checks are a nudge to pay
            attention, not a replacement for one.
          </p>
        </section>
      </ScrollReveal>
    </div>
  );
}
