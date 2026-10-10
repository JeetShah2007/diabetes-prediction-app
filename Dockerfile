# One container: Express backend + Python (the backend runs each model's
# predict.py as a subprocess).
FROM node:20-slim

RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY ml ./ml
COPY backend ./backend

# Prediction only needs these (imbalanced-learn is only for training)
RUN pip3 install --no-cache-dir --break-system-packages \
    scikit-learn pandas joblib numpy

WORKDIR /app/backend
RUN npm install --omit=dev

EXPOSE 5000
CMD ["node", "server.js"]
