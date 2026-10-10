# HealthCheck — Simple Health Risk Checks

A full-stack web app with three plain-language health risk checks — **Diabetes**, **Heart Health**, and **Stroke** — built with Python ML models, an Express API, and a React UI.

⚠️ **Disclaimer:** Educational demo only. Not a medical diagnosis. Please consult a doctor for real health concerns.

## Features

- Three health checks from one dashboard (diabetes, heart, stroke)
- Plain-language questions and a one-line explanation for every input
- Built-in BMI calculator (height + weight)
- Risk gauge, "biggest contributors", and range bars against typical healthy values
- Example buttons to try each check instantly
- Recent-checks history with a trend line. History is private per browser (anonymous random ID, no login), with a "Clear my history" button
- Modern health-app design with scroll, click, and hover animations; responsive on mobile

---

## Machine Learning Models

### Approach (shared by all three)

- **Algorithm:** Random Forest classifier (scikit-learn), 300 trees
- **Split:** 80% training / 20% test, stratified (keeps the same share of at-risk cases in both), `random_state=42`
- **Preprocessing:** categorical answers encoded as numbers (one-hot for multi-option fields), missing values filled with the median, features standardised
- **Evaluation:** all metrics below are measured on the 20% test set the model never saw during training
- **Class imbalance:** at-risk cases are a minority in two of the three datasets, so each model is trained to avoid simply predicting "lower risk" for everyone (class weighting for diabetes and heart, SMOTE oversampling for stroke)

### Results at a glance

| | Diabetes | Heart | Stroke |
|---|---|---|---|
| Dataset size | 100,000 | 920 | 5,110 |
| At-risk share of data | 8.5% | 55.3% | 4.9% |
| Test set size | 20,000 | 184 | 1,022 |
| **Accuracy** | **90.5%** | **79.3%** | **76.3%** |
| **Precision** | 47.0% | 79.1% | 13.4% |
| **Recall** (sensitivity) | 90.9% | 85.3% | 70.0% |
| Specificity | 90.5% | 72.0% | 76.7% |
| F1 score | 0.62 | 0.82 | 0.22 |
| ROC-AUC | 0.977 | 0.899 | 0.811 |

Confusion matrices (test set):

| | True negative | False positive | False negative | True positive |
|---|---|---|---|---|
| Diabetes | 16,554 | 1,746 | 154 | 1,546 |
| Heart | 59 | 23 | 15 | 87 |
| Stroke | 745 | 227 | 15 | 35 |

### How to read these numbers

- **Accuracy** — share of all predictions that were correct. Can look high when at-risk cases are rare, so don't read it alone.
- **Recall** — of the people who really were at risk, how many the model caught. Missing a real case is the costly mistake in screening, so this is the metric these models are tuned for.
- **Precision** — of the people the model flagged, how many really were at risk. Low precision means many false alarms.
- **Specificity** — of the people not at risk, how many the model correctly cleared.
- **F1** — a single balance of precision and recall.
- **ROC-AUC** — how well the model ranks at-risk people above not-at-risk people, regardless of cut-off (0.5 = coin flip, 1.0 = perfect).

### 1. Diabetes model

| | |
|---|---|
| **Data** | Diabetes Prediction Dataset (Kaggle, Mohammed Mustafa) — 100,000 records |
| **Inputs (11 columns)** | Gender, age, high blood pressure, heart disease history, BMI, HbA1c level, blood glucose level, smoking history (one-hot, 4 options) |
| **Target** | Diabetes yes / no |
| **Settings** | 300 trees, max depth 10, min leaf size 3, balanced class weights |
| **Cross-validation** | 5-fold accuracy 90.6% (± 0.3%) |
| **Strongest drivers** | HbA1c level (41%), blood glucose (30%), age (15%), BMI (7%), high blood pressure (3%) |

Reading the result: the model catches about 91% of true cases (1,546 of 1,700). Only 47% of "higher risk" flags are real because just 8.5% of people in the data have diabetes, so false alarms are common.

### 2. Heart model

| | |
|---|---|
| **Data** | UCI Heart Disease — 920 patients combined from 4 hospitals (Cleveland, Hungary, Switzerland, VA Long Beach) |
| **Inputs (11 columns)** | Age, sex, resting blood pressure, cholesterol, fasting blood sugar over 120, max heart rate, exercise-induced chest pain, chest pain type (one-hot, 4 options) |
| **Target** | Heart disease present (original severity 1–4 merged into "yes") |
| **Settings** | 300 trees, max depth 8, min leaf size 3, balanced class weights |
| **Cross-validation** | 5-fold accuracy 78.8% (± 3.2%) |
| **Strongest drivers** | No chest pain / "asymptomatic" (20%), age (15%), max heart rate (15%), exercise chest pain (14%), cholesterol (11%) |

Data choices: four fields (`ca`, `thal`, `slope`, `restecg`) and the hospital column were deliberately left out. They were 34–66% missing and strongly tied to which hospital collected the data, so using them would teach the model the hospital rather than real medical signal. Cholesterol and blood pressure readings of 0 were treated as missing.

Reading the result: it catches about 85% of true cases (87 of 102). The test set is small (184 people), so these numbers can move by a few points between runs.

### 3. Stroke model

| | |
|---|---|
| **Data** | Stroke Prediction Dataset (Kaggle, fedesoriano) — 5,110 records |
| **Inputs (11 columns)** | Gender, age, high blood pressure, heart disease history, ever married, average glucose, BMI, smoking status (one-hot, 4 options) |
| **Target** | Had a stroke yes / no |
| **Settings** | 300 trees, max depth 8, min leaf size 3, SMOTE oversampling on training data only |
| **Strongest drivers** | Age (54%), ever married (13%), BMI (10%), average glucose (9%), high blood pressure (4%) |

Stroke is rare (only 249 of 5,110 people), so the model was tuned to catch cases rather than to avoid false alarms. It catches 70% of true strokes (35 of 50) but only about 13% of its "higher risk" flags are real. Treat a flag as a reason to get checked, not a verdict.

"Ever married" ranks high mainly because it stands in for age and life stage in this dataset. It is not a medical cause of stroke.

SMOTE creates synthetic training examples, so a cross-validation score computed on the resampled data is overly optimistic. For this reason only held-out test results are reported for stroke.

### Limitations

- **Not clinically validated.** These are demo models trained on public datasets. Nobody has tested them on real patients in a clinic.
- **Diabetes data is likely synthetic.** The 100,000-record dataset is widely believed to be heavily processed or generated, so the 90% accuracy should not be expected on real people.
- **Population mismatch.** The training data does not come from the Indian population. Results may not carry over.
- **Heart data is dated and small.** 920 patients from older hospital studies.
- **Self-reported inputs add noise.** Lab values like HbA1c and cholesterol are only as accurate as what the user enters.
- **Numbers vary slightly between machines.** Retraining with a different scikit-learn version can move the metrics by a point or two. Each model's own `accuracy.json` shows the latest run.

---

## Project structure

```
├── Dockerfile
├── ml/
│   ├── diabetes/   train_model.py, predict.py, *.pkl, *.json, dataset csv
│   ├── heart/      (same layout)
│   └── stroke/     (same layout)
├── backend/        Express API (server.js)
└── frontend/       React + Vite UI
    └── src/{pages,components,config,utils}
```

Each health check's form, explanations, ranges, tips, and examples live in `frontend/src/config/diseaseConfigs.js`. Adding a new check mostly means a new config entry, a new `ml/<name>/` folder, and one entry in `backend/server.js`.

## Setup

**Prerequisites:** Node.js 18+, Python 3.

```bash
pip install scikit-learn pandas joblib numpy imbalanced-learn
```

**Backend**
```bash
cd backend
npm install
npm start          # http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

**Retrain a model (optional)**
```bash
cd ml/diabetes && python train_model.py
cd ../heart    && python train_model.py
cd ../stroke   && python train_model.py
```

## API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/:disease/predict` | Prediction (`diabetes`, `heart`, or `stroke`) |
| GET | `/api/:disease/history` | This visitor's recent checks |
| DELETE | `/api/:disease/history` | Clear this visitor's history |
| GET | `/api/:disease/model-info` | Latest training metrics |
| GET | `/api/health` | Health check |

History requests identify the browser with an `X-Visitor-Id` header (a random ID generated in the browser).

Example:
```json
POST /api/heart/predict
{ "age": 58, "sex": "Male", "cp": "asymptomatic", "trestbps": 140,
  "chol": 260, "fbs": 0, "thalch": 120, "exang": 1 }

→ { "prediction": 1, "label": "Higher Risk", "probability": 0.90,
    "topFactors": ["Chest pain: asymptomatic", "Age", "Max heart rate"] }
```

## Deployment

- **Backend:** Docker (see `Dockerfile`) on a host like Render.
- **Frontend:** static build on Vercel/Netlify with root directory `frontend` and env var `VITE_API_URL=https://<your-backend>/api`.

Note: history is tied to the browser (clearing browser data starts a fresh history), and on free hosting the history files reset when the server restarts.

## Tech stack

Python, scikit-learn, imbalanced-learn, pandas · Node.js, Express · React, React Router, Vite, Axios · Docker

## License

All rights reserved. Shared publicly for portfolio/demonstration purposes only. Please do not copy, redistribute, or reuse without permission.