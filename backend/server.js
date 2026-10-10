const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

const ML_DIR = path.join(__dirname, "..", "ml");
const HISTORY_DIR = path.join(__dirname, "history");
const MAX_HISTORY = 50;

if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });

// Windows normally only has "python" on PATH, not "python3".
const PYTHON_CMD = process.env.PYTHON_CMD || (process.platform === "win32" ? "python" : "python3");

// --- Per-disease configuration ---
// "requiredFields" are validated as present on every /predict call.
// "numericFields" get coerced to Number; everything else passes through as-is
// (predict.py handles strings like gender/smoking/cp directly).
const DISEASES = {
  diabetes: {
    requiredFields: ["gender", "age", "hypertension", "heart_disease", "smoking", "bmi", "HbA1c_level", "blood_glucose_level"],
    numericFields: ["age", "hypertension", "heart_disease", "bmi", "HbA1c_level", "blood_glucose_level"],
  },
  heart: {
    requiredFields: ["age", "sex", "trestbps", "chol", "fbs", "thalch", "exang", "cp"],
    numericFields: ["age", "trestbps", "chol", "fbs", "thalch", "exang"],
  },
  stroke: {
    requiredFields: ["gender", "age", "hypertension", "heart_disease", "ever_married", "avg_glucose_level", "bmi", "smoking_status"],
    numericFields: ["age", "hypertension", "heart_disease", "ever_married", "avg_glucose_level", "bmi"],
  },
};

app.use(cors());
app.use(express.json());

// --- Per-visitor history ---
// Each browser sends a random ID in the X-Visitor-Id header, and history is
// stored per ID so visitors never see each other's results. The ID is
// validated strictly because it becomes part of a file name.
const VISITOR_ID_PATTERN = /^[a-zA-Z0-9-]{8,64}$/;

function getVisitorId(req) {
  const id = req.get("x-visitor-id");
  return id && VISITOR_ID_PATTERN.test(id) ? id : null;
}

function historyFile(disease, visitorId) {
  return path.join(HISTORY_DIR, `${disease}_${visitorId}.json`);
}

function readHistory(disease, visitorId) {
  if (!visitorId) return [];
  try {
    return JSON.parse(fs.readFileSync(historyFile(disease, visitorId), "utf-8"));
  } catch (err) {
    return [];
  }
}

function appendHistory(disease, visitorId, entry) {
  if (!visitorId) return;
  const history = readHistory(disease, visitorId);
  history.unshift(entry);
  fs.writeFileSync(
    historyFile(disease, visitorId),
    JSON.stringify(history.slice(0, MAX_HISTORY), null, 2)
  );
}

// Reject unknown disease params before any route logic runs.
app.param("disease", (req, res, next, disease) => {
  if (!DISEASES[disease]) {
    return res.status(404).json({ error: `Unknown health check: ${disease}` });
  }
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", available: Object.keys(DISEASES) });
});

app.get("/api/:disease/model-info", (req, res) => {
  const accuracyFile = path.join(ML_DIR, req.params.disease, "accuracy.json");
  try {
    res.json(JSON.parse(fs.readFileSync(accuracyFile, "utf-8")));
  } catch (err) {
    res.status(500).json({ error: "Could not read model info" });
  }
});

app.get("/api/:disease/history", (req, res) => {
  res.json(readHistory(req.params.disease, getVisitorId(req)));
});

app.delete("/api/:disease/history", (req, res) => {
  const visitorId = getVisitorId(req);
  if (visitorId) {
    try {
      fs.unlinkSync(historyFile(req.params.disease, visitorId));
    } catch (err) {
      // nothing to delete
    }
  }
  res.json({ cleared: true });
});

app.post("/api/:disease/predict", (req, res) => {
  const disease = req.params.disease;
  const config = DISEASES[disease];
  const input = req.body;
  const visitorId = getVisitorId(req);

  const missing = config.requiredFields.filter(
    (field) => input[field] === undefined || input[field] === null || input[field] === ""
  );
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
  }

  const payload = {};
  config.requiredFields.forEach((field) => {
    payload[field] = config.numericFields.includes(field) ? Number(input[field]) : input[field];
  });

  for (const field of config.numericFields) {
    if (isNaN(payload[field])) {
      return res.status(400).json({ error: `${field} must be a number` });
    }
  }

  const predictScript = path.join(ML_DIR, disease, "predict.py");
  const py = spawn(PYTHON_CMD, [predictScript, JSON.stringify(payload)]);

  let stdout = "";
  let stderr = "";
  let responded = false;

  py.on("error", (err) => {
    if (responded) return;
    responded = true;
    console.error("Failed to start Python process:", err.message);
    res.status(500).json({
      error: `Could not run "${PYTHON_CMD}". Is Python installed and on PATH? (${err.message})`,
    });
  });

  py.stdout.on("data", (data) => (stdout += data.toString()));
  py.stderr.on("data", (data) => (stderr += data.toString()));

  py.on("close", (code) => {
    if (responded) return;
    responded = true;
    if (code !== 0) {
      console.error(`${disease}/predict.py error:`, stderr);
      return res.status(500).json({ error: "Prediction failed", details: stderr });
    }
    try {
      const result = JSON.parse(stdout.trim());
      appendHistory(disease, visitorId, { ...payload, ...result, timestamp: new Date().toISOString() });
      res.json(result);
    } catch (err) {
      console.error("Failed to parse predict.py output:", stdout);
      res.status(500).json({ error: "Invalid response from model", details: stdout });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Health risk backend running on http://localhost:${PORT}`);
  console.log(`Available checks: ${Object.keys(DISEASES).join(", ")}`);
});
