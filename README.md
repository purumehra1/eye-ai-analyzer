# 👁️ EyeAI Analyzer

> AI-powered eye & face analysis — detect emotions, fatigue, stress, age & gender from photos. Full-stack React + FastAPI. **Zero API keys needed.**

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)
![No API Key](https://img.shields.io/badge/API%20Key-None%20Required-brightgreen?style=flat-square)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎭 **Emotion Detection** | 7 emotions (happy, sad, angry, surprised, fear, disgust, neutral) via DeepFace |
| 😴 **Fatigue Assessment** | Eye Aspect Ratio analysis using OpenCV Haar cascades |
| 🔴 **Eye Health Metrics** | Redness, dark circles, clarity, puffiness scoring |
| 🧠 **Stress Score** | Composite score from facial indicators |
| 👤 **Age & Gender** | Estimation via DeepFace (local model) |
| 📊 **Radar Chart** | Beautiful visual overview of all health dimensions |
| 🕐 **History** | Last 10 analyses saved in localStorage |
| 📸 **Webcam Support** | Real-time capture directly in browser |

---

## 🚀 Quick Start

### One-command setup:

```bash
git clone https://github.com/purumehra1/eye-ai-analyzer.git
cd eye-ai-analyzer
chmod +x start.sh && ./start.sh
```

Then open → **http://localhost:5173**

---

### Manual setup:

**Backend (FastAPI):**
```bash
cd backend
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

**Frontend (React):**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite
- TailwindCSS (dark glassmorphism UI)
- Recharts (radar chart)
- react-webcam
- Axios

**Backend:**
- FastAPI + Uvicorn
- DeepFace (emotion, age, gender)
- OpenCV (face/eye detection, health metrics)
- NumPy + Pillow

**No external APIs — everything runs locally on your machine.**

---

## 📁 Project Structure

```
eye-ai-analyzer/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── ResultsDashboard.jsx
│   │       ├── MetricCard.jsx
│   │       ├── EmotionBars.jsx
│   │       └── HistoryPanel.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/
│   ├── main.py          ← FastAPI app
│   ├── analyzer.py      ← All ML logic
│   └── requirements.txt
├── start.sh             ← One-command launcher
└── README.md
```

---

## 🔌 API Reference

**POST `/analyze`**
- Input: multipart image upload
- Output: JSON with all analysis results

```json
{
  "face_detected": true,
  "dominant_emotion": "happy",
  "emotion": { "happy": 85.2, "neutral": 12.1, ... },
  "age": 23,
  "gender": "Man",
  "fatigue": "✅ Alert",
  "fatigue_score": 18,
  "stress_score": 22,
  "eye_metrics": {
    "redness_score": 12.3,
    "eye_clarity": 78.5,
    "dark_circle_index": 31.2,
    "puffiness_score": 25.0
  },
  "annotated_image": "data:image/jpeg;base64,..."
}
```

**GET `/health`** — Health check

**GET `/docs`** — Interactive API docs (Swagger UI)

---

## 👤 Author

Built by [Puru Mehra](https://github.com/purumehra1) | BTech CSE (AIML) · SRM Chennai
