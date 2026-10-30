import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import HealthCheckPage from "./pages/HealthCheckPage";
import { DISEASES } from "./config/diseaseConfigs";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          {Object.values(DISEASES).map((d) => (
            <Route key={d.key} path={`/${d.key}`} element={<HealthCheckPage config={d} />} />
          ))}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="app-footer">
        This is an estimate, not a diagnosis. After checking, please also consult a doctor.
      </footer>
    </div>
  );
}