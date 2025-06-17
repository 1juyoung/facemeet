import cv2
import sys
import json
from deepface import DeepFace
import numpy as np
import base64
import os
import speech_recognition as sr
import threading
import time

# TensorFlow 최적화 설정
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# 얼굴 검출 모델 로드
face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

# 음성 인식 초기화
recognizer = sr.Recognizer()
mic = sr.Microphone()

# 전역 변수 설정
last_emotion_score = 0
running = True  # 실행 상태 관리

def get_audio():
    """음성 인식 함수"""
    with mic as source:
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)
        try:
            return recognizer.recognize_google(audio, language="ko-KR")
        except sr.UnknownValueError:
            return None
        except sr.RequestError as e:
            print(f"Google Speech Recognition service error: {e}")
            return None

def audio_processing():
    """음성 인식을 별도 쓰레드에서 실행"""
    global running, last_emotion_score
    while running:
        text = get_audio()
        if text:
            print(json.dumps({"transcription": text, "emotionScore": last_emotion_score}))
            sys.stdout.flush()  # 즉시 출력
        time.sleep(0.5)

# 음성 처리 스레드 실행
threading.Thread(target=audio_processing, daemon=True).start()

def analyze_emotion(frame_data):
    """Base64 이미지를 감정 분석"""
    global last_emotion_score
    try:
        header, encoded = frame_data.split(",", 1)
        np_arr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        rgb_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)
        faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        if len(faces) == 0:
            print(json.dumps({"error": "No face detected"}))
            sys.stdout.flush()
            return None

        for (x, y, w, h) in faces:
            face_roi = rgb_frame[y:y+h, x:x+w]
            results = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)

            if not results:
                print(json.dumps({"error": "DeepFace analysis failed"}))
                sys.stdout.flush()
                return None

            emotion_data = results[0]['emotion'] if isinstance(results, list) else results['emotion']

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

        return last_emotion_score

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.stdout.flush()
        return None

# ✅ 테스트 데이터 추가 (직접 실행할 경우)
if __name__ == "__main__":
    test_image_path = "test.jpg"  # 실제 테스트할 얼굴 이미지 경로
    if os.path.exists(test_image_path):
        with open(test_image_path, "rb") as img_file:
            frame_data = "data:image/jpeg;base64," + base64.b64encode(img_file.read()).decode("utf-8")
        
        score = analyze_emotion(frame_data)
        print(json.dumps({"test_emotionScore": score}))
        sys.stdout.flush()
    else:
        print(json.dumps({"error": "Test image not found"}))
        sys.stdout.flush()

# 표준 입력에서 데이터 읽기 (Node.js와 연결)
for line in sys.stdin:
    try:
        data = json.loads(line.strip())
        meeting_id = data.get("meetingId")
        user_id = data.get("userId")
        frame_data = data.get("data")

        if not frame_data:
            continue

        emotion_score = analyze_emotion(frame_data)

        if emotion_score is not None:
            # 결과를 JSON 형식으로 출력하여 Node.js에서 받을 수 있도록 함
            result = {"meetingId": meeting_id, "userId": user_id, "emotionScore": emotion_score}
            print(json.dumps(result))
            sys.stdout.flush()  # 즉시 출력

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.stdout.flush()
