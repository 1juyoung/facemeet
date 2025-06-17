import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import '../components/Style.css'; // CSS 파일 임포트

function NoteDetail() {
  const [inputVolume, setInputVolume] = useState(70);
  const [outputVolume, setOutputVolume] = useState(70);
  const [selectedDevice, setSelectedDevice] = useState('Default');
  const [isRecording, setIsRecording] = useState(false);
  const audioRef = useRef(null);

  const handleInputVolumeChange = (event) => {
    setInputVolume(event.target.value);
  };

  const handleOutputVolumeChange = (event) => {
    setOutputVolume(event.target.value);
  };

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioURL = window.URL.createObjectURL(blob);
        audioRef.current.src = audioURL;
      };

      mediaRecorder.start();
      setIsRecording(true);

      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
      }, 5000); // Adjust recording duration as needed
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  return (
    <Layout>
      <div className='NoteDetail'>
        <div className='header'></div>
        <div className='information'>
          <label>녹음 장치</label>
          <select className="dropdown-menu" value={selectedDevice} onChange={handleDeviceChange}>
            <option value="Default">Default</option>
            {/* Add other device options here */}
          </select><br></br>
          <label>출력 장치</label>
          <select className="dropdown-menu" value={selectedDevice} onChange={handleDeviceChange}>
            <option value="Default">Default</option>
            {/* Add other device options here */}
          </select><br></br>
        </div>
        <div className='information'>
          <label>입력 음량</label>
          <input type="range" min="0" max="100" step="3.33" value={inputVolume} onChange={handleInputVolumeChange}></input><br></br>
          <label>출력 음량</label>
          <input type="range" min="0" max="100" step="3.33" value={outputVolume} onChange={handleOutputVolumeChange}></input>
        </div>
        <div className='information'>
          <div className='controls'>
            <button onClick={startRecording} disabled={isRecording}>
              {isRecording ? '녹음 중...' : '마이크 테스트 시작'}
            </button>
            <button onClick={() => audioRef.current.play()} disabled={!audioRef.current}>
              재생
            </button>
            <audio ref={audioRef} controls />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default NoteDetail;