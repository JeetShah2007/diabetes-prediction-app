"""
Trains a stroke risk model on 5,110 patient records.

Stroke cases are rare (~4.9% of rows), so this script uses SMOTE
(oversampling synthetic minority-class examples) on the training data
only, which gives much better recall than class_weight alone did in
testing. Expect lower precision than the other two models here -- this
model errs toward flagging more people as elevated-risk rather than
missing real cases, which is intentional for a screening tool, but
means more false positives than the diabetes/heart models.

Saves: model.pkl, scaler.pkl, accuracy.json, feature_columns.json
"""
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, recall_score, precision_score
from imblearn.over_sampling import SMOTE

df = pd.read_csv("healthcare-dataset-stroke-data.csv")

df["bmi"] = df["bmi"].fillna(df["bmi"].median())
df["gender_enc"] = df["gender"].map({"Female": 0, "Male": 1, "Other": 2})
df["ever_married_enc"] = df["ever_married"].map({"No": 0, "Yes": 1})

smoke_dummies = pd.get_dummies(df["smoking_status"], prefix="smk")
df = pd.concat([df, smoke_dummies], axis=1)

FEATURE_COLUMNS = (
    ["gender_enc", "age", "hypertension", "heart_disease", "ever_married_enc",
     "avg_glucose_level", "bmi"]
    + list(smoke_dummies.columns)
)

X = df[FEATURE_COLUMNS]
y = df["stroke"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# SMOTE on the training set only -- never touch the test set, so the
# reported accuracy reflects real, unmodified cases.
sm = SMOTE(random_state=42)
X_train_sm, y_train_sm = sm.fit_resample(X_train_scaled, y_train)

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=8,
    min_samples_leaf=3,
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train_sm, y_train_sm)

preds = model.predict(X_test_scaled)
acc = accuracy_score(y_test, preds)
recall = recall_score(y_test, preds)
precision = precision_score(y_test, preds)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model, X_train_sm, y_train_sm, cv=cv, scoring="accuracy", n_jobs=-1)

print(f"Test accuracy: {acc:.3f}")
print(f"Cross-validation accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")
print(f"Recall (stroke class): {recall:.3f}")
print(f"Precision (stroke class): {precision:.3f}")
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
        "precision": round(precision, 4),
        "dataset_size": len(df),
    }, f, indent=2)

print("Saved model.pkl, scaler.pkl, feature_columns.json, accuracy.json")
