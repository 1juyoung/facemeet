import cv2
from deepface import DeepFace
import numpy as np
import base64
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# TensorFlow 최적화 설정
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)

# 얼굴 검출 모델 로드
face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

@app.route('/analyze_emotion', methods=['POST'])
def analyze_emotion():
    try:
        # 클라이언트로부터 프레임 데이터 디코딩
        data = request.json
        frame_data = data['frameData']
        header, encoded = frame_data.split(",", 1)
        np_arr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # 얼굴 검출 및 감정 분석
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        rgb_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)
        faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        last_emotion_score = 0.0
        for (x, y, w, h) in faces:
            face_roi = rgb_frame[y:y+h, x:x+w]
            results = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
            
            # 감정 점수 계산
            emotion_data = results[0]['emotion'] if isinstance(results, list) else results['emotion']
            last_emotion_score = 0.0
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

        # 감정 점수를 JSON 형식으로 반환 (float으로 변환)
        return jsonify({"emotionScore": float(last_emotion_score)})

    except Exception as e:
        print("프레임 처리 중 오류:", e)
        return jsonify({"error": str(e)})

# Flask 서버 실행
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4001)
