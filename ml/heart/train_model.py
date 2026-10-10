"""
Trains a heart disease risk model on the combined UCI Heart Disease dataset
(920 patients from Cleveland, Hungary, Switzerland, and VA Long Beach).

Deliberately excludes "ca", "thal", "slope", and "restecg": the source
documents these as majority-missing (34-66% missing) and confounded by
which hospital collected the data, so including them would mostly encode
"which hospital" rather than real clinical signal. We also drop the
"dataset" (hospital) column itself for the same reason.

Kept features are self-reportable from a basic checkup: age, sex, chest
pain type, resting blood pressure, cholesterol, fasting blood sugar,
max heart rate achieved, and exercise-induced chest pain.

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

df = pd.read_csv("heart_disease_uci.csv", sep=";")

# num is 0 (no disease) to 4 (severity); binarize to presence/absence.
df["target"] = (df["num"] > 0).astype(int)

df["sex_enc"] = df["sex"].map({"Male": 1, "Female": 0})
df["fbs_enc"] = df["fbs"].map({True: 1, False: 0})
df["exang_enc"] = df["exang"].map({True: 1, False: 0})

# 0 is not physiologically possible for these -> treat as missing
for col in ["trestbps", "chol"]:
    df[col] = df[col].replace(0, np.nan)

df["trestbps"] = df["trestbps"].fillna(df["trestbps"].median())
df["chol"] = df["chol"].fillna(df["chol"].median())
df["thalch"] = df["thalch"].fillna(df["thalch"].median())
df["fbs_enc"] = df["fbs_enc"].fillna(df["fbs_enc"].mode()[0])
df["exang_enc"] = df["exang_enc"].fillna(df["exang_enc"].mode()[0])

cp_dummies = pd.get_dummies(df["cp"], prefix="cp")
df = pd.concat([df, cp_dummies], axis=1)

FEATURE_COLUMNS = (
    ["age", "sex_enc", "trestbps", "chol", "fbs_enc", "thalch", "exang_enc"]
    + list(cp_dummies.columns)
)

X = df[FEATURE_COLUMNS]
y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=8,
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
print(f"Recall (disease class): {recall:.3f}")
print(classification_report(y_test, preds))

joblib.dump(model, "model.pkl")
joblib.dump(scaler, "scaler.pkl")

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
