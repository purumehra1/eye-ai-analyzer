import cv2
import numpy as np
from PIL import Image
import io
import base64

def analyze_image(image_bytes: bytes) -> dict:
    """Full eye/face analysis pipeline — no API keys, all local."""
    # Decode image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        return {"error": "Could not decode image"}

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    result = {
        "face_detected": False,
        "emotion": None,
        "dominant_emotion": None,
        "age": None,
        "gender": None,
        "eye_metrics": {},
        "fatigue": None,
        "fatigue_score": 0,
        "stress_score": 0,
        "annotated_image": None,
    }

    # --- Face detection ---
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    eye_cascade  = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))

    if len(faces) == 0:
        return result

    result["face_detected"] = True
    x, y, w, h = faces[0]
    face_roi_bgr = img_bgr[y:y+h, x:x+w]
    face_roi_rgb = img_rgb[y:y+h, x:x+w]
    face_gray    = gray[y:y+h, x:x+w]

    # --- Eye metrics from face ROI ---
    r = face_roi_rgb[:, :, 0].mean()
    g = face_roi_rgb[:, :, 1].mean()
    b = face_roi_rgb[:, :, 2].mean()
    redness = max(0.0, (r - (g + b) / 2) / 255.0) * 100
    blurred  = cv2.GaussianBlur(face_gray, (15, 15), 0)
    clarity  = max(0.0, 100.0 - float(np.std(blurred)) * 1.5)
    avg_br   = face_gray.mean()
    dark_circle = max(0.0, (128 - avg_br) / 128 * 100)

    result["eye_metrics"] = {
        "redness_score":   round(redness, 1),
        "eye_clarity":     round(clarity, 1),
        "dark_circle_index": round(dark_circle, 1),
        "puffiness_score": round(min(100, float(np.std(face_gray)) * 0.8), 1),
    }

    # --- Fatigue via eye aspect ratio proxy ---
    eyes = eye_cascade.detectMultiScale(face_gray, 1.1, 4)
    fatigue_score = 50  # default moderate
    fatigue_label = "⚡ Unknown"
    if len(eyes) >= 2:
        ew, eh = eyes[0][2], eyes[0][3]
        ear = eh / ew if ew > 0 else 0.25
        fatigue_score = int(max(0, min(100, (1 - ear / 0.4) * 100)))
        if fatigue_score > 70:
            fatigue_label = "😴 High Fatigue"
        elif fatigue_score > 40:
            fatigue_label = "🥱 Mild Fatigue"
        else:
            fatigue_label = "✅ Alert"
    elif len(eyes) == 1:
        fatigue_score = 60
        fatigue_label = "🥱 Mild Fatigue"
    else:
        fatigue_score = 75
        fatigue_label = "😴 High Fatigue (eyes not detected)"

    result["fatigue"] = fatigue_label
    result["fatigue_score"] = fatigue_score

    # --- Stress proxy (redness + dark circles + fatigue) ---
    stress = int((redness * 0.3 + dark_circle * 0.3 + fatigue_score * 0.4))
    result["stress_score"] = min(100, stress)

    # --- DeepFace emotion + age + gender ---
    try:
        from deepface import DeepFace
        analysis = DeepFace.analyze(
            img_rgb,
            actions=["emotion", "age", "gender"],
            enforce_detection=False,
            silent=True,
        )
        r0 = analysis[0] if isinstance(analysis, list) else analysis
        result["emotion"] = r0.get("emotion", {})
        result["dominant_emotion"] = r0.get("dominant_emotion", "neutral")
        result["age"] = r0.get("age")
        gender_data = r0.get("gender", {})
        if isinstance(gender_data, dict):
            result["gender"] = max(gender_data, key=gender_data.get)
        else:
            result["gender"] = str(gender_data)
    except Exception as e:
        result["dominant_emotion"] = "neutral"
        result["emotion"] = {"neutral": 100}
        result["age"] = None
        result["gender"] = None

    # --- Annotated image ---
    annotated = img_bgr.copy()
    cv2.rectangle(annotated, (x, y), (x+w, y+h), (0, 255, 128), 2)
    for (ex, ey, ew2, eh2) in eyes[:2]:
        cv2.rectangle(annotated[y:y+h, x:x+w], (ex, ey), (ex+ew2, ey+eh2), (255, 200, 0), 2)
    _, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
    result["annotated_image"] = "data:image/jpeg;base64," + base64.b64encode(buf).decode()

    return result
