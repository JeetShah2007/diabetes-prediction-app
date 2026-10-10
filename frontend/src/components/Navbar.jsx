import { NavLink } from "react-router-dom";
import { DISEASE_LIST } from "../config/diseaseConfigs";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-logo">✚</span> HealthCheck
        </NavLink>
        <div className="navbar-links">
          {DISEASE_LIST.map((d) => (
            <NavLink
              key={d.key}
              to={`/${d.key}`}
              className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
            >
              <span className="navbar-link-icon">{d.icon}</span>
              {d.title.replace(" Check", "").replace(" Risk", "")}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
