# Diabetes Risk Predictor

A full-stack demo project: a Python ML model, an Express API that serves it, and a React UI to use it. Built as hackathon practice.



## Overview

- **ML model**: Random Forest classifier trained on the Pima Indians Diabetes dataset (768 records), ~74% test accuracy.
- **Backend**: Node/Express API that spawns the Python model as a subprocess.
- **Frontend**: React (Vite) form UI with a probability gauge, range-bar visuals, and a prediction history log.

⚠️ **Disclaimer**: This is a demo model trained on a small public dataset. It is **not** a medical diagnostic tool.

## Features

- Predicts diabetes risk from 5 inputs: Pregnancies, Glucose, Blood Pressure, Age, and a built-in BMI calculator (Height + Weight)
- Shows a probability gauge and the top contributing factors for each prediction
- Visual range bars comparing your inputs against typical healthy ranges
- Prediction history log with a probability trend sparkline
- REST API (`/api/predict`, `/api/history`, `/api/model-info`)

