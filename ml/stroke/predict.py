"""
Loads the trained stroke model and returns a prediction.
Called as: python3 predict.py '<json input>'

Expected input JSON:
{
  "gender": "Female" | "Male" | "Other",
  "age": 67,
  "hypertension": 0 | 1,
  "heart_disease": 0 | 1,
  "ever_married": 0 | 1,
  "avg_glucose_level": 150,
  "bmi": 28.5,
  "smoking_status": "never smoked" | "formerly smoked" | "smokes" | "Unknown"
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
    row["ever_married_enc"] = int(user_data.get("ever_married", 0))
    row["avg_glucose_level"] = float(user_data.get("avg_glucose_level", 0))
    row["bmi"] = float(user_data.get("bmi", 0))

    smk_col = f"smk_{user_data.get('smoking_status', 'Unknown')}"
    if smk_col in row:
        row[smk_col] = 1

    model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
    scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))

    X = pd.DataFrame([row], columns=feature_columns)
    X_scaled = scaler.transform(X)

    prediction = int(model.predict(X_scaled)[0])
    probability = float(model.predict_proba(X_scaled)[0][1])

    importances = model.feature_importances_
    factors = sorted(zip(feature_columns, importances), key=lambda t: t[1], reverse=True)
    LABELS = {
        "gender_enc": "Gender", "age": "Age", "hypertension": "Hypertension",
        "heart_disease": "Heart disease history", "ever_married_enc": "Marital history",
        "avg_glucose_level": "Average glucose level", "bmi": "BMI",
    }
    top_factors = [LABELS.get(f[0], f[0].replace("smk_", "Smoking: ")) for f in factors[:3]]

    result = {
        "prediction": prediction,
        "label": "Higher Risk" if prediction == 1 else "Lower Risk",
        "probability": round(probability, 4),
        "topFactors": top_factors,
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
