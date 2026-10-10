"""
Loads the trained diabetes model and returns a prediction.
Called as: python3 predict.py '<json input>'

Expected input JSON:
{
  "gender": "Female" | "Male" | "Other",
  "age": 45,
  "hypertension": 0 | 1,
  "heart_disease": 0 | 1,
  "smoking": "never" | "former" | "current" | "unknown",
  "bmi": 27.5,
  "HbA1c_level": 5.8,
  "blood_glucose_level": 140
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

GENDER_MAP = {"Female": 0, "Male": 1, "Other": 2}


def main():
    user_data = json.loads(sys.argv[1])

    with open(os.path.join(BASE_DIR, "feature_columns.json")) as f:
        feature_columns = json.load(f)

    row = {col: 0 for col in feature_columns}
    row["gender_enc"] = GENDER_MAP.get(user_data.get("gender", "Female"), 0)
    row["age"] = float(user_data.get("age", 0))
    row["hypertension"] = int(user_data.get("hypertension", 0))
    row["heart_disease"] = int(user_data.get("heart_disease", 0))
    row["bmi"] = float(user_data.get("bmi", 0))
    row["HbA1c_level"] = float(user_data.get("HbA1c_level", 0))
    row["blood_glucose_level"] = float(user_data.get("blood_glucose_level", 0))

    smoking = user_data.get("smoking", "unknown")
    smk_col = f"smk_{smoking}"
    if smk_col in row:
        row[smk_col] = 1

    model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
    scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))

    X = pd.DataFrame([row], columns=feature_columns)
    X_scaled = scaler.transform(X)

    prediction = int(model.predict(X_scaled)[0])
    probability = float(model.predict_proba(X_scaled)[0][1])

    importances = model.feature_importances_
    factors = sorted(
        zip(feature_columns, importances, X.iloc[0]),
        key=lambda t: t[1],
        reverse=True,
    )
    top_factors = [f[0] for f in factors[:3]]
    # Clean up internal column names into readable labels
    LABELS = {
        "gender_enc": "Gender", "age": "Age", "hypertension": "Hypertension",
        "heart_disease": "Heart disease history", "bmi": "BMI",
        "HbA1c_level": "HbA1c level", "blood_glucose_level": "Blood glucose level",
    }
    top_factors = [LABELS.get(f, f.replace("smk_", "Smoking: ")) for f in top_factors]

    result = {
        "prediction": prediction,
        "label": "Higher Risk" if prediction == 1 else "Lower Risk",
        "probability": round(probability, 4),
        "topFactors": top_factors,
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
