"""
Loads the trained heart disease model and returns a prediction.
Called as: python3 predict.py '<json input>'

Expected input JSON:
{
  "age": 58,
  "sex": "Male" | "Female",
  "trestbps": 130,
  "chol": 220,
  "fbs": 0 | 1,
  "thalch": 150,
  "exang": 0 | 1,
  "cp": "typical angina" | "atypical angina" | "non-anginal" | "asymptomatic"
}
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


def main():
    user_data = json.loads(sys.argv[1])

    with open(os.path.join(BASE_DIR, "feature_columns.json")) as f:
        feature_columns = json.load(f)

    row = {col: 0 for col in feature_columns}
    row["age"] = float(user_data.get("age", 0))
    row["sex_enc"] = 1 if user_data.get("sex") == "Male" else 0
    row["trestbps"] = float(user_data.get("trestbps", 0))
    row["chol"] = float(user_data.get("chol", 0))
    row["fbs_enc"] = int(user_data.get("fbs", 0))
    row["thalch"] = float(user_data.get("thalch", 0))
    row["exang_enc"] = int(user_data.get("exang", 0))

    cp_col = f"cp_{user_data.get('cp', 'asymptomatic')}"
    if cp_col in row:
        row[cp_col] = 1

    model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
    scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))

    X = pd.DataFrame([row], columns=feature_columns)
    X_scaled = scaler.transform(X)

    prediction = int(model.predict(X_scaled)[0])
    probability = float(model.predict_proba(X_scaled)[0][1])

    importances = model.feature_importances_
    factors = sorted(zip(feature_columns, importances), key=lambda t: t[1], reverse=True)
    LABELS = {
        "age": "Age", "sex_enc": "Sex", "trestbps": "Resting blood pressure",
        "chol": "Cholesterol", "fbs_enc": "Fasting blood sugar",
        "thalch": "Max heart rate", "exang_enc": "Exercise-induced chest pain",
    }
    top_factors = [LABELS.get(f[0], f[0].replace("cp_", "Chest pain: ")) for f in factors[:3]]

    result = {
        "prediction": prediction,
        "label": "Higher Risk" if prediction == 1 else "Lower Risk",
        "probability": round(probability, 4),
        "topFactors": top_factors,
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
