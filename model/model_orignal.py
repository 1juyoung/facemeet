import cv2
from deepface import DeepFace
import speech_recognition as sr
import threading
import time
import os

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
last_emotion_score = 0
running = True  # 전역 실행 상태 변수

# Load face cascade classifier
face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

# Initialize speech recognition
r = sr.Recognizer()
mic = sr.Microphone()

def get_audio():
    with mic as source:
        r.adjust_for_ambient_noise(source)
        audio = r.listen(source)
        try:
            return r.recognize_google(audio, language="ko-KR")
        except sr.UnknownValueError:
            print("Speech Recognition could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"Google Speech Recognition service error: {e}")
            return None

def audio_processing():
    global running
    with open('recognized_speech.txt', 'a', encoding='utf-8') as f:
        while running:
            text = get_audio()
            if text:
                print(f"말씀하신 내용: {text}, Emotion Score: {last_emotion_score:.0f}")
                f.write(f"{text}, Emotion Score: {last_emotion_score:.0f}\n")
                f.flush()  # Ensure data is written to disk immediately
            if "굿바이" in (text or ""):
                break
            time.sleep(0.01)  # Give some time to prevent tight loop when no audio detected

# Start capturing video
cap = cv2.VideoCapture(0)

# Start audio processing in a separate thread
threading.Thread(target=audio_processing, daemon=True).start()

while running:
    ret, frame = cap.read()
    if not ret:
        break

    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rgb_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)
    faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    for (x, y, w, h) in faces:
        face_roi = rgb_frame[y:y+h, x:x+w]
        results = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
        if isinstance(results, list):
            emotion_data = results[0]['emotion']
        else:
            emotion_data = results['emotion']
        
        last_emotion_score = 0
        for emotion, prob in emotion_data.items():
          if emotion in ["angry", "disgust"]:
            last_emotion_score += prob * 0.1
          elif emotion == "fear":
            last_emotion_score += prob * 0.2
          elif emotion == "sad":
             last_emotion_score += prob * 0.3
          elif emotion in ["neutral", "surprise"]:
             last_emotion_score += prob * 0.5
          else:
             last_emotion_score += prob * 1
        
        color = (0,0,255) if last_emotion_score < 34 else (0,255,0) if last_emotion_score < 67 else (255,0,0)
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
        cv2.putText(frame, f"Emotion Score: {last_emotion_score:.0f}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    cv2.imshow('Real-time Emotion and Speech Recognition', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        running = False

cap.release()
cv2.destroyAllWindows()