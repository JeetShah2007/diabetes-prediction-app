import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:5000/api";

const FACTOR_LABELS = {
  Pregnancies: "Pregnancies",
  Glucose: "Glucose",
  BloodPressure: "Blood Pressure",
  BMI: "BMI",
  Age: "Age",
  SkinThickness: "Skin Thickness",
  Insulin: "Insulin",
  DiabetesPedigreeFunction: "Family History",
};

const initialForm = {
  Pregnancies: "",
  Glucose: "",
  BloodPressure: "",
  Age: "",
};

const initialBmiInputs = {
  height: "", // cm
  weight: "", // kg
};

const FIELD_META = {
  Pregnancies: { label: "Pregnancies", hint: "Number of times pregnant", placeholder: "e.g. 2" },
  Glucose: { label: "Glucose (mg/dL)", hint: "Plasma glucose concentration", placeholder: "e.g. 120" },
  BloodPressure: { label: "Blood Pressure (mm Hg)", hint: "Diastolic blood pressure", placeholder: "e.g. 72" },
  Age: { label: "Age (years)", hint: "", placeholder: "e.g. 34" },
};

// Reference ranges used both for the always-visible legend and the
// range bars drawn after a prediction. normalMin/normalMax mark the
// healthy band; null means there's no standard "normal" zone (e.g. age).
const RANGES = {
  Glucose: { min: 60, max: 200, normalMin: 70, normalMax: 99, unit: " mg/dL" },
  BloodPressure: { min: 40, max: 130, normalMin: 60, normalMax: 80, unit: " mmHg" },
  BMI: { min: 12, max: 45, normalMin: 18.5, normalMax: 24.9, unit: "" },
  Age: { min: 18, max: 90, normalMin: null, normalMax: null, unit: " yrs" },
};

// Plain-language explanations of why each input matters for diabetes risk —
// aimed at anyone using the tool, not just people with a technical background.
const WHY_IT_MATTERS = {
  Pregnancies: "Pregnancy can temporarily affect how the body handles blood sugar, which is linked to future risk.",
  Glucose: "Blood sugar level is one of the clearest signals doctors use to check for diabetes.",
  BloodPressure: "High blood pressure often shows up alongside diabetes and shares some of the same risk factors.",
  BMI: "A higher body mass index is linked to how well the body responds to insulin.",
  Age: "Risk of type 2 diabetes tends to rise with age, especially after 45.",
};

// Two example profiles so people can try the tool instantly without
// needing real numbers on hand — useful for demos too.
const SAMPLES = {
  higher: { Pregnancies: 6, Glucose: 148, BloodPressure: 72, Age: 50, height: 160, weight: 86 },
  lower: { Pregnancies: 1, Glucose: 85, BloodPressure: 66, Age: 31, height: 165, weight: 72 },
};

const TIPS = [
  "Use a fasting glucose reading if you have one — it's more accurate than a random reading.",
  "Measure blood pressure while resting, not right after activity or caffeine.",
  "Use your most recent height and weight for the BMI calculation.",
  "\"Pregnancies\" means lifetime total, not a current pregnancy.",
];

function calcBmi(heightCm, weightKg) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w) return null;
  const heightM = h / 100;
  return w / (heightM * heightM);
}

function RangeBar({ label, value, min, max, normalMin, normalMax, unit }) {
  const clamp = (v) => Math.min(max, Math.max(min, v));
  const toPercent = (v) => ((clamp(v) - min) / (max - min)) * 100;
  const hasValue = value !== null && value !== undefined && !Number.isNaN(value);
  const markerPos = hasValue ? toPercent(value) : null;
  const normalLeft = normalMin != null ? toPercent(normalMin) : null;
  const normalWidth = normalMin != null ? toPercent(normalMax) - normalLeft : null;

  return (
    <div className="range-bar">
      <div className="range-bar-label">
        <span>{label}</span>
        <span className="range-bar-value">
          {hasValue ? `${value}${unit}` : normalMin != null ? `${normalMin}–${normalMax}${unit} normal` : "—"}
        </span>
      </div>
      <div className="range-bar-track">
        {normalLeft != null && (
          <div
            className="range-bar-normal"
            style={{ left: `${normalLeft}%`, width: `${normalWidth}%` }}
            title="Typical healthy range"
          />
        )}
        {hasValue && <div className="range-bar-marker" style={{ left: `${markerPos}%` }} />}
      </div>
      <div className="range-bar-scale">
        <span>{min}</span>
        {normalMin != null && <span className="range-bar-scale-normal">normal range</span>}
        <span>{max}</span>
      </div>
    </div>
  );
}

function ProbabilityRing({ probability, positive }) {
  const pct = Math.round(probability * 100);
  const color = positive ? "#ff7875" : "#73d13d";
  return (
    <div
      className="prob-ring"
      style={{ background: `conic-gradient(${color} ${pct}%, #ececf4 ${pct}% 100%)` }}
    >
      <div className="prob-ring-inner">
        <span className="prob-ring-value">{pct}%</span>
        <span className="prob-ring-caption">est. risk</span>
      </div>
    </div>
  );
}

function Sparkline({ data, width = 280, height = 56 }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data
    .map((d, i) => {
      const x = i * stepX;
      const y = height - 6 - ((d - min) / range) * (height - 12);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="sparkline" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="#6c63ff" strokeWidth="2" />
    </svg>
  );
}

function App() {
  const [form, setForm] = useState(initialForm);
  const [bmiInputs, setBmiInputs] = useState(initialBmiInputs);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const bmi = calcBmi(bmiInputs.height, bmiInputs.weight);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data);
    } catch (err) {
      // history is a nice-to-have; fail silently if backend isn't reachable yet
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBmiChange = (e) => {
    setBmiInputs({ ...bmiInputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!bmi) {
      setError("Enter height and weight to calculate BMI.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/predict`, {
        ...form,
        BMI: bmi.toFixed(1),
      });
      setResult(res.data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setBmiInputs(initialBmiInputs);
    setResult(null);
    setError(null);
  };

  const handleSample = (key) => {
    const s = SAMPLES[key];
    setForm({ Pregnancies: s.Pregnancies, Glucose: s.Glucose, BloodPressure: s.BloodPressure, Age: s.Age });
    setBmiInputs({ height: s.height, weight: s.weight });
    setResult(null);
    setError(null);
  };

  return (
    <div className="page">
      <div className="shell">
        <header className="shell-header">
          <h1>Diabetes Risk Predictor</h1>
          <p className="subtitle">
            Enter a few basic health details to get a quick, model-based estimate.
          </p>
        </header>

        <div className="top-grid">
          {/* --- Entry block --- */}
          <div className="panel form-panel">
            <form onSubmit={handleSubmit} className="form">
              {Object.keys(initialForm).map((field) => (
                <div className="field" key={field}>
                  <label htmlFor={field}>{FIELD_META[field].label}</label>
                  <input
                    id={field}
                    name={field}
                    type="number"
                    step="any"
                    value={form[field]}
                    onChange={handleChange}
                    placeholder={FIELD_META[field].placeholder}
                    required
                  />
                  {FIELD_META[field].hint && <span className="hint">{FIELD_META[field].hint}</span>}
                </div>
              ))}

              <div className="field">
                <label htmlFor="height">Height (cm)</label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  step="any"
                  value={bmiInputs.height}
                  onChange={handleBmiChange}
                  placeholder="e.g. 170"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  step="any"
                  value={bmiInputs.weight}
                  onChange={handleBmiChange}
                  placeholder="e.g. 68"
                  required
                />
                <span className="hint">
                  {bmi ? `Calculated BMI: ${bmi.toFixed(1)}` : "BMI will be calculated automatically"}
                </span>
              </div>

              <div className="actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Predicting..." : "Predict"}
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
                {TIPS.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* --- Always-visible info panel, beside the form --- */}
          <div className="panel info-panel">
            <div className="info-block">
              <h2>Why these matter</h2>
              <div className="why-list">
                {["Pregnancies", "Glucose", "BloodPressure", "BMI", "Age"].map((key) => (
                  <div className="why-item" key={key}>
                    <span className="why-label">
                      {FIELD_META[key]?.label.split(" (")[0] || key}
                    </span>
                    <span className="why-text">{WHY_IT_MATTERS[key]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-block">
              <h2>Reference values</h2>
              <p className="info-note">
                These are typical healthy ranges shown for context — you can still enter any
                value, they're not a limit on what you can submit.
              </p>
              <div className="legend-list">
                {Object.entries(RANGES).map(([key, r]) => (
                  <div className="legend-item" key={key}>
                    <span className="legend-dot" />
                    <span className="legend-label">{FIELD_META[key]?.label.split(" (")[0] || key}</span>
                    <span className="legend-value">
                      {r.normalMin != null ? `${r.normalMin}–${r.normalMax}${r.unit}` : "varies"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-block disclaimer-block">
              This is a demo model trained on a small public dataset of past patients. It is
              not a medical diagnosis — please consult a doctor for actual health concerns.
            </div>
          </div>
        </div>

        {/* --- Analysis section: always visible, shows result or a placeholder --- */}
        <div className="panel analysis-section">
          <h2>Analysis</h2>
          {result ? (
            <>
              <div className={`result ${result.prediction === 1 ? "positive" : "negative"}`}>
                <div className="result-top">
                  <ProbabilityRing probability={result.probability} positive={result.prediction === 1} />
                  <div className="result-top-text">
                    <div className="result-label">{result.label}</div>
                    <div className="result-prob">
                      Estimated probability: {(result.probability * 100).toFixed(1)}%
                    </div>
                    {result.topFactors && result.topFactors.length > 0 && (
                      <div className="result-factors">
                        Biggest contributors:{" "}
                        {result.topFactors.map((f) => FACTOR_LABELS[f] || f).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="range-bars">
                <RangeBar
                  label="Glucose"
                  value={Number(form.Glucose)}
                  unit={RANGES.Glucose.unit}
                  min={RANGES.Glucose.min}
                  max={RANGES.Glucose.max}
                  normalMin={RANGES.Glucose.normalMin}
                  normalMax={RANGES.Glucose.normalMax}
                />
                <RangeBar
                  label="Blood Pressure"
                  value={Number(form.BloodPressure)}
                  unit={RANGES.BloodPressure.unit}
                  min={RANGES.BloodPressure.min}
                  max={RANGES.BloodPressure.max}
                  normalMin={RANGES.BloodPressure.normalMin}
                  normalMax={RANGES.BloodPressure.normalMax}
                />
                <RangeBar
                  label="BMI"
                  value={bmi ? Number(bmi.toFixed(1)) : null}
                  unit={RANGES.BMI.unit}
                  min={RANGES.BMI.min}
                  max={RANGES.BMI.max}
                  normalMin={RANGES.BMI.normalMin}
                  normalMax={RANGES.BMI.normalMax}
                />
                <RangeBar
                  label="Age"
                  value={Number(form.Age)}
                  unit={RANGES.Age.unit}
                  min={RANGES.Age.min}
                  max={RANGES.Age.max}
                  normalMin={RANGES.Age.normalMin}
                  normalMax={RANGES.Age.normalMax}
                />
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>
                Fill in the form and hit <strong>Predict</strong> — your risk gauge and range
                breakdown will appear here.
              </p>
            </div>
          )}
        </div>

        {/* --- History section: always visible, empty state until predictions exist --- */}
        <div className="panel history-section">
          <h2>Recent Predictions</h2>

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
                    <span className="history-detail">
                      Glucose {entry.Glucose}, BMI {entry.BMI}, Age {entry.Age}
                    </span>
                    <span className="history-prob">{(entry.probability * 100).toFixed(0)}%</span>
                    <span className="history-time">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🕓</div>
              <p>No predictions yet — your history will show up here once you run one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;