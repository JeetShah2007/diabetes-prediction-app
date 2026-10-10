"""
Trains a diabetes risk model on a 100,000-row dataset (gender, age,
hypertension, heart disease history, smoking history, BMI, HbA1c level,
blood glucose level -> diabetes).

This is a larger, more complete dataset than the classic 768-row Pima
dataset used in earlier versions of this project. Source: "Diabetes
Prediction Dataset" (Kaggle, Mohammed Mustafa). Note: this dataset is
very likely synthetic/heavily processed (documented by downstream
analyses) -- it's a solid demo dataset, not a clinical-grade one.

Saves: model.pkl, scaler.pkl, accuracy.json, feature_columns.json
"""
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, recall_score

df = pd.read_csv("diabetes_dataset.csv")

# Simplify smoking_history's 6 raw categories down to the 4 options the UI
# offers, so the form stays easy to fill without a confusing dropdown.
SMOKING_MAP = {
    "never": "never",
    "No Info": "unknown",
    "former": "former",
    "current": "current",
    "not current": "former",   # "used to smoke, quit a while ago" -> former
    "ever": "former",          # smoked at some point -> former
}
df["smoking_simple"] = df["smoking_history"].map(SMOKING_MAP)

df["gender_enc"] = df["gender"].map({"Female": 0, "Male": 1, "Other": 2})
smoke_dummies = pd.get_dummies(df["smoking_simple"], prefix="smk")
df = pd.concat([df, smoke_dummies], axis=1)

FEATURE_COLUMNS = (
    ["gender_enc", "age", "hypertension", "heart_disease", "bmi",
     "HbA1c_level", "blood_glucose_level"]
    + list(smoke_dummies.columns)
)

X = df[FEATURE_COLUMNS]
y = df["diabetes"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# class_weight="balanced" matters: only ~8.5% of rows are positive.
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    min_samples_leaf=3,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train_scaled, y_train)

preds = model.predict(X_test_scaled)
acc = accuracy_score(y_test, preds)
recall = recall_score(y_test, preds)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=cv, scoring="accuracy", n_jobs=-1)

print(f"Test accuracy: {acc:.3f}")
print(f"Cross-validation accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")
print(f"Recall (diabetic class): {recall:.3f}")
print(classification_report(y_test, preds))

joblib.dump(model, "model.pkl")
joblib.dump(scaler, "scaler.pkl")

# Save the exact column order/names so predict.py can build a matching
# feature vector regardless of which dummy columns happened to appear.
with open("feature_columns.json", "w") as f:
    json.dump(FEATURE_COLUMNS, f, indent=2)

with open("accuracy.json", "w") as f:
    json.dump({
        "accuracy": round(acc, 4),
        "cv_accuracy": round(float(cv_scores.mean()), 4),
        "recall": round(recall, 4),
        "dataset_size": len(df),
    }, f, indent=2)

print("Saved model.pkl, scaler.pkl, feature_columns.json, accuracy.json")
