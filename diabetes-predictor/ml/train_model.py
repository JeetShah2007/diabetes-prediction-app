"""
Trains a diabetes prediction model on the Pima Indians Diabetes dataset.
Saves: model.pkl, scaler.pkl, medians.json

Columns in diabetes.csv (no header):
Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI,
DiabetesPedigreeFunction, Age, Outcome
"""
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report

COLUMNS = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome"
]

df = pd.read_csv("diabetes.csv", names=COLUMNS)

# In this dataset, 0 is used as a placeholder for "missing" in these columns
# (nobody actually has 0 glucose or 0 BMI), so we treat 0 as NaN and fill
# with the column median before training.
zero_as_missing = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
for col in zero_as_missing:
    df[col] = df[col].replace(0, np.nan)
    df[col] = df[col].fillna(df[col].median())

FEATURES = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
            "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]

X = df[FEATURES]
y = df["Outcome"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train_scaled, y_train)

preds = model.predict(X_test_scaled)
acc = accuracy_score(y_test, preds)
print(f"Test accuracy: {acc:.3f}")
print(classification_report(y_test, preds))

joblib.dump(model, "model.pkl")
joblib.dump(scaler, "scaler.pkl")

# Medians for the fields the UI does NOT ask the user for directly
# (SkinThickness, Insulin, DiabetesPedigreeFunction) so predict.py can
# fill them in automatically for a "quick demo" style form.
medians = {col: float(df[col].median()) for col in FEATURES}
with open("medians.json", "w") as f:
    json.dump(medians, f, indent=2)

with open("accuracy.json", "w") as f:
    json.dump({"accuracy": round(acc, 4)}, f, indent=2)

print("Saved model.pkl, scaler.pkl, medians.json, accuracy.json")
