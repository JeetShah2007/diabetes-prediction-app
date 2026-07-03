"""
Loads the trained model and returns a prediction.
Called by the Node backend as: python3 predict.py '<json input>'

Expected input JSON (the fields the UI actually collects):
{
  "Pregnancies": 2, "Glucose": 130, "BloodPressure": 78,
  "BMI": 28.5, "Age": 34
}

Any of SkinThickness / Insulin / DiabetesPedigreeFunction not provided
are filled in automatically from medians.json.
"""
import sys
import json
import joblib
import numpy as np
import pandas as pd
import os
import warnings
warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FEATURES = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
            "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]

def main():
    raw_input = sys.argv[1]
    user_data = json.loads(raw_input)

    with open(os.path.join(BASE_DIR, "medians.json")) as f:
        medians = json.load(f)

    # Build the full feature vector: use user-provided values where given,
    # fall back to dataset medians for anything the UI didn't ask for.
    row = []
    for feat in FEATURES:
        if feat in user_data and user_data[feat] is not None:
            row.append(float(user_data[feat]))
        else:
            row.append(medians[feat])

    model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
    scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))

    X = pd.DataFrame([row], columns=FEATURES)
    X_scaled = scaler.transform(X)

    prediction = int(model.predict(X_scaled)[0])
    probability = float(model.predict_proba(X_scaled)[0][1])

    # --- Top contributing factors ---
    # RandomForest gives us global feature importances. We combine that with
    # how far this specific input is from the "typical" (median) value to get
    # a rough per-request sense of which inputs pushed the result the most.
    importances = model.feature_importances_
    factors = []
    for i, feat in enumerate(FEATURES):
        median_val = medians[feat]
        deviation = abs(row[i] - median_val) / (median_val if median_val != 0 else 1)
        factors.append({
            "feature": feat,
            "value": row[i],
            "score": float(importances[i] * deviation),
        })
    factors.sort(key=lambda f: f["score"], reverse=True)
    # Only surface factors from fields the user actually entered themselves
    user_entered = [f for f in factors if f["feature"] in user_data]
    top_factors = [f["feature"] for f in (user_entered or factors)[:3]]

    result = {
        "prediction": prediction,               # 1 = diabetic, 0 = not diabetic
        "label": "Diabetic" if prediction == 1 else "Not Diabetic",
        "probability": round(probability, 4),    # probability of being diabetic
        "topFactors": top_factors,               # which inputs drove this result most
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()