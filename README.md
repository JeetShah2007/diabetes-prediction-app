# Diabetes Risk Predictor

A full-stack demo project: a Python ML model, an Express API that serves it, and a React UI to use it. 


## Overview

- **ML model**: Random Forest classifier (tuned, class-balanced) trained on the Pima Indians Diabetes dataset (768 records) — **75.3% test accuracy**, **78.5% average across 5-fold cross-validation**.
- **Backend**: Node/Express API that spawns the Python model as a subprocess.
- **Frontend**: React (Vite) UI with a probability gauge, range-bar visuals, plain-language explanations, and a prediction history log.

 **Disclaimer**: This is a demo model trained on a small, non-representative public dataset (women of Pima Indian heritage, studied in the 1990s). It is **not** a medical diagnostic tool and should not be used to make real health decisions. Consult a doctor for actual health concerns.

## Features

- Predicts diabetes risk from 5 inputs: Pregnancies, Glucose, Blood Pressure, Age, and a built-in BMI calculator (Height + Weight)
- Two-column layout with an always-visible info panel explaining *why* each input matters, in plain language
- Reference ranges shown for context only — clearly labeled as non-restrictive
- Sample data buttons to try the tool instantly (useful for demos)
- Probability gauge and top contributing factors for each prediction
- Visual range bars comparing your inputs against typical healthy ranges
- Prediction history log with a probability trend sparkline

