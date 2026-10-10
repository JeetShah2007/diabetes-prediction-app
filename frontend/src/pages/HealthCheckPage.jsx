import { useState, useEffect } from "react";
import axios from "axios";
import Field from "../components/Field";
import ScrollReveal from "../components/ScrollReveal";
import { RangeBar, ProbabilityRing, Sparkline } from "../components/Visuals";
import { visitorHeaders } from "../utils/visitor";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function calcBmi(heightCm, weightKg) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w) return null;
  const heightM = h / 100;
  return w / (heightM * heightM);
}

function buildInitialForm(config) {
  const form = {};
  config.fields.forEach((f) => {
    if (f.type !== "bmi") form[f.key] = "";
  });
  return form;
}

export default function HealthCheckPage({ config }) {
  const hasBmiField = config.fields.some((f) => f.type === "bmi");
  const bmiFieldKey = config.fields.find((f) => f.type === "bmi")?.key;

  const [form, setForm] = useState(buildInitialForm(config));
  const [bmiInputs, setBmiInputs] = useState({ height: "", weight: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const bmi = hasBmiField ? calcBmi(bmiInputs.height, bmiInputs.weight) : null;

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/${config.apiPath}/history`, {
        headers: visitorHeaders(),
      });
      setHistory(res.data);
    } catch (err) {
      // non-critical
    }
  };

  useEffect(() => {
    loadHistory();
    // Reset everything when navigating between health check pages
    setForm(buildInitialForm(config));
    setBmiInputs({ height: "", weight: "" });
    setResult(null);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.key]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleBmiChange = (e) => {
    setBmiInputs({ ...bmiInputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const unanswered = config.fields.filter((f) => f.type !== "bmi" && form[f.key] === "");
    if (unanswered.length > 0) {
      setError(`Please answer: ${unanswered.map((f) => f.label.replace(/[?]$/, "")).join(", ")}`);
      return;
    }

    if (hasBmiField && !bmi) {
      setError("Enter height and weight to calculate BMI.");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (hasBmiField) payload[bmiFieldKey] = bmi.toFixed(1);

      const res = await axios.post(`${API_BASE}/${config.apiPath}/predict`, payload, {
        headers: visitorHeaders(),
      });
      setResult(res.data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await axios.delete(`${API_BASE}/${config.apiPath}/history`, { headers: visitorHeaders() });
      setHistory([]);
    } catch (err) {
      // non-critical
    }
  };

  const handleReset = () => {
    setForm(buildInitialForm(config));
    setBmiInputs({ height: "", weight: "" });
    setResult(null);
    setError(null);
  };

  const handleSample = (key) => {
    const sample = config.samples[key];
    const newForm = {};
    config.fields.forEach((f) => {
      if (f.type !== "bmi" && sample[f.key] !== undefined) newForm[f.key] = sample[f.key];
    });
    setForm(newForm);
    if (hasBmiField) setBmiInputs({ height: sample.height ?? "", weight: sample.weight ?? "" });
    setResult(null);
    setError(null);
  };

  // Which numeric fields (besides BMI) have a reference range worth showing
  // in the Analysis section as a range bar.
  const rangeFieldKeys = Object.keys(config.ranges || {}).filter((k) => k !== "bmi" || hasBmiField);

  return (
    <div className="check-page">
      <ScrollReveal>
        <header className="check-header">
          <span className="check-icon" style={{ background: `${config.color}1a`, color: config.color }}>
            {config.icon}
          </span>
          <div>
            <h1>{config.title}</h1>
            <p className="subtitle">{config.tagline}</p>
          </div>
        </header>
      </ScrollReveal>

      <ScrollReveal>
        <div className="top-grid">
          {/* --- Entry block --- */}
          <div className="panel form-panel">
            <form onSubmit={handleSubmit} className="form">
              {config.fields.map((f) =>
                f.type === "bmi" ? (
                  <div className="bmi-fields" key={f.key}>
                    <div className="field">
                      <label htmlFor="height">Height (cm)</label>
                      <input
                        id="height" name="height" type="number" step="any"
                        value={bmiInputs.height} onChange={handleBmiChange}
                        placeholder="e.g. 170" required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="weight">Weight (kg)</label>
                      <input
                        id="weight" name="weight" type="number" step="any"
                        value={bmiInputs.weight} onChange={handleBmiChange}
                        placeholder="e.g. 68" required
                      />
                      <span className="hint">
                        {bmi ? `Calculated BMI: ${bmi.toFixed(1)}` : "BMI is calculated automatically"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Field key={f.key} field={f} value={form[f.key]} onChange={handleChange} />
                )
              )}

              <div className="actions">
                <button type="submit" disabled={loading} style={{ background: config.color }}>
                  {loading ? "Checking..." : "Check Risk"}
                </button>
                <button type="button" className="secondary" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </form>

            {error && <div className="result error">{error}</div>}

            <div className="samples-block">
              <span className="samples-label">Don't have numbers handy? Try an example:</span>
              <div className="samples-buttons">
                <button type="button" className="sample-btn" onClick={() => handleSample("lower")}>
                  Example: Lower risk
                </button>
                <button type="button" className="sample-btn" onClick={() => handleSample("higher")}>
                  Example: Higher risk
                </button>
              </div>
            </div>

            <div className="tips-block">
              <h2>Tips for accurate results</h2>
              <ul className="tips-list">
                {config.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* --- Always-visible info panel --- */}
          <div className="panel info-panel">
            <div className="info-block">
              <h2>Why these matter</h2>
              <div className="why-list">
                {config.fields.map((f) => (
                  <div className="why-item" key={f.key}>
                    <span className="why-label">{f.label.replace(/[?]$/, "").split("(")[0].trim()}</span>
                    <span className="why-text">{config.whyItMatters[f.key]}</span>
                  </div>
                ))}
              </div>
            </div>

            {rangeFieldKeys.length > 0 && (
              <div className="info-block">
                <h2>Reference values</h2>
                <p className="info-note">
                  Typical healthy ranges, shown for context — you can still enter any value,
                  they're not a limit on what you can submit.
                </p>
                <div className="legend-list">
                  {rangeFieldKeys.map((key) => {
                    const r = config.ranges[key];
                    const fieldLabel =
                      config.fields.find((f) => f.key === key)?.label.split("(")[0].trim() ||
                      (key === "bmi" ? "BMI" : key);
                    return (
                      <div className="legend-item" key={key}>
                        <span className="legend-dot" style={{ background: `${config.color}55` }} />
                        <span className="legend-label">{fieldLabel}</span>
                        <span className="legend-value">
                          {r.normalMin != null ? `${r.normalMin}–${r.normalMax}${r.unit}` : "varies"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="info-block disclaimer-block">
              {config.modelInfoNote} This is a demo tool, not a medical diagnosis — please
              consult a doctor for actual health concerns.
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* --- Analysis section --- */}
      <ScrollReveal>
        <div className="panel analysis-section">
          <h2>Analysis</h2>
          {result ? (
            <>
              <div className={`result ${result.prediction === 1 ? "positive" : "negative"}`}>
                <div className="result-top">
                  <ProbabilityRing probability={result.probability} positive={result.prediction === 1} color={config.color} />
                  <div className="result-top-text">
                    <div className="result-label">{result.label}</div>
                    <div className="result-prob">
                      Estimated probability: {(result.probability * 100).toFixed(1)}%
                    </div>
                    {result.topFactors && result.topFactors.length > 0 && (
                      <div className="result-factors">
                        Biggest contributors: {result.topFactors.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {rangeFieldKeys.length > 0 && (
                <div className="range-bars">
                  {rangeFieldKeys.map((key) => {
                    const r = config.ranges[key];
                    const fieldLabel =
                      config.fields.find((f) => f.key === key)?.label.split("(")[0].trim() ||
                      (key === "bmi" ? "BMI" : key);
                    const value = key === "bmi" ? (bmi ? Number(bmi.toFixed(1)) : null) : Number(form[key]);
                    return (
                      <RangeBar
                        key={key}
                        label={fieldLabel}
                        value={value}
                        unit={r.unit}
                        min={r.min}
                        max={r.max}
                        normalMin={r.normalMin}
                        normalMax={r.normalMax}
                      />
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>
                Fill in the form and hit <strong>Check Risk</strong> — your result will appear
                here.
              </p>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* --- History section --- */}
      <ScrollReveal>
        <div className="panel history-section">
          <div className="history-head">
            <h2>Recent Checks</h2>
            {history.length > 0 && (
              <button type="button" className="clear-btn" onClick={handleClearHistory}>
                Clear my history
              </button>
            )}
          </div>
          <p className="history-note">Only you can see these, on this browser.</p>
          {history.length > 0 ? (
            <>
              {history.length > 1 && (
                <div className="history-trend">
                  <span className="hint">Probability trend (oldest → newest)</span>
                  <Sparkline data={[...history].reverse().map((h) => h.probability * 100)} />
                </div>
              )}
              <div className="history-list">
                {history.map((entry, i) => (
                  <div
                    className={`history-item ${entry.prediction === 1 ? "positive" : "negative"}`}
                    key={i}
                  >
                    <span className="history-label">{entry.label}</span>
                    <span className="history-prob">{(entry.probability * 100).toFixed(0)}%</span>
                    <span className="history-time">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🕓</div>
              <p>No checks yet — your history will show up here once you run one.</p>
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
