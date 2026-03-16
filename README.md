# 👁️ EyeAI Analyzer

![Python](https://img.shields.io/badge/Python-3.10+-blue) ![Streamlit](https://img.shields.io/badge/Streamlit-1.32+-red) ![OpenCV](https://img.shields.io/badge/OpenCV-4.8+-green)

Detect **emotions, fatigue, stress levels, and health indicators** from eye images using AI.

## Features
- 😴 Fatigue & drowsiness detection (PERCLOS metric)
- 😡 Emotion detection (calm, stressed, angry, sad)
- 🩺 Health flags: redness, puffiness, dark circles
- 📊 Real-time webcam mode + image upload
- 📈 Session-based alerting for driver/study safety

## Tech Stack
- **OpenCV** — eye region detection & PERCLOS
- **MediaPipe** — facial landmark detection
- **DeepFace** — emotion recognition
- **Streamlit** — web UI

## Run
```bash
git clone https://github.com/purumehra1/eye-ai-analyzer
cd eye-ai-analyzer && pip install -r requirements.txt
streamlit run app.py
```

## Author
Puru Mehra — BTech CSE (AIML), SRM Chennai | [github.com/purumehra1](https://github.com/purumehra1)
