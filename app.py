import streamlit as st
import cv2
import numpy as np
from PIL import Image
import io

st.set_page_config(page_title="EyeAI Analyzer", page_icon="👁️", layout="centered")

st.title("👁️ EyeAI Analyzer")
st.caption("Detect emotions, fatigue, stress and health indicators from eye images using AI.")

try:
    from deepface import DeepFace
    DEEPFACE_OK = True
except ImportError:
    DEEPFACE_OK = False

def analyze_eye_region(img_array):
    """Analyze eye region for redness, puffiness, dark circles."""
    results = {}
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    hsv  = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)

    # Redness score — high red channel relative to others
    r_ch = img_array[:,:,0].mean()
    g_ch = img_array[:,:,1].mean()
    b_ch = img_array[:,:,2].mean()
    redness = max(0, (r_ch - (g_ch + b_ch)/2) / 255)
    results['Redness Score'] = round(redness * 100, 1)

    # Brightness variance — puffiness proxy
    brightness_var = float(np.std(cv2.GaussianBlur(gray, (15,15), 0)))
    results['Eye Clarity'] = round(max(0, 100 - brightness_var * 1.5), 1)

    # Dark circle proxy — lower brightness around eye
    avg_brightness = gray.mean()
    results['Dark Circle Index'] = round(max(0, (128 - avg_brightness) / 128 * 100), 1)

    return results

def classify_fatigue(ear_proxy):
    if ear_proxy < 0.20: return "😴 High Fatigue", "red"
    if ear_proxy < 0.28: return "🥱 Mild Fatigue", "orange"
    return "✅ Alert", "green"

st.divider()
mode = st.radio("Select Mode", ["📤 Upload Image", "📹 Webcam Capture"], horizontal=True)

img_array = None

if mode == "📤 Upload Image":
    uploaded = st.file_uploader("Upload a face/eye image", type=["jpg","jpeg","png","webp"])
    if uploaded:
        img = Image.open(uploaded).convert("RGB")
        img_array = np.array(img)
        st.image(img, caption="Uploaded image", use_container_width=True)

elif mode == "📹 Webcam Capture":
    pic = st.camera_input("Take a photo")
    if pic:
        img = Image.open(pic).convert("RGB")
        img_array = np.array(img)

if img_array is not None:
    with st.spinner("Analysing..."):
        # Face + eye detection via OpenCV
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        eye_cascade  = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)

        col1, col2 = st.columns(2)

        if len(faces) == 0:
            st.warning("No face detected. Try a clearer frontal photo.")
        else:
            x, y, w, h = faces[0]
            face_roi = img_array[y:y+h, x:x+w]
            eyes = eye_cascade.detectMultiScale(cv2.cvtColor(face_roi, cv2.COLOR_RGB2GRAY), 1.1, 4)

            with col1:
                st.subheader("Eye Health Metrics")
                metrics = analyze_eye_region(face_roi)
                for k, v in metrics.items():
                    st.metric(k, f"{v}%")

            with col2:
                st.subheader("Emotion Detection")
                if DEEPFACE_OK:
                    try:
                        result = DeepFace.analyze(img_array, actions=['emotion'], enforce_detection=False)
                        emotions = result[0]['emotion']
                        dominant = result[0]['dominant_emotion']
                        st.metric("Dominant Emotion", dominant.title())
                        for em, score in sorted(emotions.items(), key=lambda x: -x[1])[:4]:
                            st.progress(int(score), text=f"{em.title()}: {score:.1f}%")
                    except Exception as e:
                        st.info("Emotion model loading... install deepface for full analysis.")
                else:
                    st.info("Install deepface for emotion detection: pip install deepface")

            # Eye aspect ratio proxy for fatigue
            if len(eyes) >= 2:
                ey, ex, ew, eh = eyes[0][1], eyes[0][0], eyes[0][2], eyes[0][3]
                ear_proxy = eh / ew if ew > 0 else 0.25
                label, color = classify_fatigue(ear_proxy)
                st.subheader("Fatigue Assessment")
                st.markdown(f"**Status:** :{color}[{label}]")
                st.progress(min(int((1 - ear_proxy/0.35) * 100), 100), text="Fatigue Level")
            else:
                st.info("Position eyes clearly for fatigue analysis.")

st.divider()
st.caption("Built by Puru Mehra | github.com/purumehra1/eye-ai-analyzer")
