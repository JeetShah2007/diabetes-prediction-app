import { Link } from "react-router-dom";
import ScrollReveal from "../components/ScrollReveal";
import ResourceLinks from "../components/ResourceLinks";
import { DISEASE_LIST, COMMON_RESOURCES, EMERGENCY_NUMBER } from "../config/diseaseConfigs";

export default function Home() {
  return (
    <div className="home-page">
      <ScrollReveal>
        <section className="hero">
          <h1>Your quick health check-in</h1>
          <p>
            Simple, plain-language risk checks for conditions that often matter most as we
            age: diabetes, heart health, and stroke. Answer a few questions and get an
            estimate with clear next steps.
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
            🩺 These checks give an estimate from the details you enter. After checking, please
            also consult a doctor. Only a doctor can examine you, order the right tests and
            confirm anything.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <ResourceLinks
          title="Need to talk to a doctor?"
          emergencyNumber={EMERGENCY_NUMBER}
          sections={[{ heading: "Get care", items: COMMON_RESOURCES }]}
        />
      </ScrollReveal>
    </div>
  );
}