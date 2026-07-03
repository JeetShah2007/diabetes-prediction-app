const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

const ML_DIR = path.join(__dirname, "..", "ml");
const PREDICT_SCRIPT = path.join(ML_DIR, "predict.py");
const ACCURACY_FILE = path.join(ML_DIR, "accuracy.json");
const HISTORY_FILE = path.join(__dirname, "history.json");
const MAX_HISTORY = 50;

function readHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
  } catch (err) {
    return [];
  }
}

function appendHistory(entry) {
  const history = readHistory();
  history.unshift(entry); // newest first
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history.slice(0, MAX_HISTORY), null, 2));
}

// Windows normally only has "python" on PATH, not "python3".
// Override by setting the PYTHON_CMD environment variable if needed.
const PYTHON_CMD = process.env.PYTHON_CMD || (process.platform === "win32" ? "python" : "python3");

app.use(cors());
app.use(express.json());

// Fields the UI collects. Keep this in sync with predict.py's FEATURES.
const REQUIRED_FIELDS = ["Pregnancies", "Glucose", "BloodPressure", "BMI", "Age"];

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/model-info", (req, res) => {
  try {
    const accuracy = JSON.parse(fs.readFileSync(ACCURACY_FILE, "utf-8"));
    res.json(accuracy);
  } catch (err) {
    res.status(500).json({ error: "Could not read model info" });
  }
});

app.get("/api/history", (req, res) => {
  res.json(readHistory());
});

app.post("/api/predict", (req, res) => {
  const input = req.body;

  // Basic validation
  const missing = REQUIRED_FIELDS.filter(
    (field) => input[field] === undefined || input[field] === null || input[field] === ""
  );
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
  }
  for (const field of REQUIRED_FIELDS) {
    if (isNaN(Number(input[field]))) {
      return res.status(400).json({ error: `${field} must be a number` });
    }
  }

  const payload = {};
  REQUIRED_FIELDS.forEach((field) => {
    payload[field] = Number(input[field]);
  });

  // Spawn (not exec/shell) so the JSON payload can't be used for command injection.
  const py = spawn(PYTHON_CMD, [PREDICT_SCRIPT, JSON.stringify(payload)]);

  let stdout = "";
  let stderr = "";
  let responded = false;

  py.on("error", (err) => {
    // Fires if the "python"/"python3" command itself can't be found.
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
      console.error("predict.py error:", stderr);
      return res.status(500).json({ error: "Prediction failed", details: stderr });
    }
    try {
      const result = JSON.parse(stdout.trim());
      appendHistory({
        ...payload,
        ...result,
        timestamp: new Date().toISOString(),
      });
      res.json(result);
    } catch (err) {
      console.error("Failed to parse predict.py output:", stdout);
      res.status(500).json({ error: "Invalid response from model", details: stdout });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Diabetes predictor backend running on http://localhost:${PORT}`);
});