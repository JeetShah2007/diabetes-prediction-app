# One container: Express backend + Python (the backend runs each model's
# predict.py as a subprocess).
FROM node:22-slim

RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY ml ./ml
COPY backend ./backend

# Versions pinned to match the ones the saved models were trained with.
RUN pip3 install --no-cache-dir --break-system-packages \
    scikit-learn==1.8.0 numpy==2.4.4 pandas==3.0.2 joblib

WORKDIR /app/backend
RUN npm install --omit=dev

EXPOSE 5000
CMD ["node", "server.js"]