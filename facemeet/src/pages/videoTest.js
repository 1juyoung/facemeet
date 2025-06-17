import React, { useEffect, useState, useRef } from 'react';
import { useParams } from "react-router-dom";
import '../components/VideoTest.css'; // 스타일을 가져옵니다.

const MeetingDetail = () => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [emotionScores, setEmotionScores] = useState({}); // 감정 점수를 사용자별로 저장
    const [recognizedSpeech, setRecognizedSpeech] = useState(''); // 음성 인식 결과 상태
    const [meetingKey, setMeetingKey] = useState(''); // 입력받은 참가 키
    const [isConnected, setIsConnected] = useState(false); // 연결 상태
    const { meeting_id } = useParams();
    const localVideoRef = useRef();
    const remoteVideoRefs = useRef({});
    const pcs = useRef({});
    const ws = useRef(null);
    const pendingCandidates = useRef({});
    const userId = localStorage.getItem('user_id'); // 로컬 스토리지에서 사용자 ID를 가져옵니다.
    const WEBSOCKET_URL = `wss://172.20.10.3/ws/meeting/${meeting_id}/`; // WebSocket URL 변수화
    const [messages, setMessages] = useState([]); 
    const [chatInput, setChatInput] = useState('');

    const createPeerConnection = (id) => {
        console.log(`Creating RTCPeerConnection for ${id}`);
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

        // ICE 후보 생성 시 처리
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(`Sending ICE candidate to ${id}`);
                // ICE 후보를 상대 피어에게 전송
                sendMessage({
                    type: 'candidate',
                    candidate: event.candidate,
                    from: userId,
                    to: id
                });
            }
        };

        // 원격 스트림을 수신할 때 처리
        pc.ontrack = (event) => {
            console.log(`Track received from ${id}:`, event.streams);
            setRemoteStreams(prevStreams => ({
                ...prevStreams,
                [id]: event.streams[0]
            }));
        };

        // ICE 연결 상태 변화 시 처리
        pc.oniceconnectionstatechange = () => {
            console.log(`ICE connection state change for ${id}: ${pc.iceConnectionState}`);
            if (pc.iceConnectionState === 'disconnected') {
                console.log(`ICE connection state is disconnected for ${id}. Attempting to reconnect...`);
                connectToPeer(id);
            }
        };

        // 신호 상태 변화 시 처리
        pc.onsignalingstatechange = () => {
            console.log(`Signaling state change for ${id}: ${pc.signalingState}`);
        };

        return pc;
    };

    const sendMessage = async (message) => {
        if (ws.current.readyState !== WebSocket.OPEN) {
            await new Promise(resolve => {
                const interval = setInterval(() => {
                    if (ws.current.readyState === WebSocket.OPEN) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        }
        ws.current.send(JSON.stringify(message));
    };

    
    const connectWebSocket = () => {
        ws.current = new WebSocket(WEBSOCKET_URL);

        ws.current.onopen = () => {
            console.log("WebSocket 연결 성공");
            sendMessage({ type: 'join', from: userId });
        };

        ws.current.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            // 감정 점수 및 음성 인식 결과 수신 시 처리
            if (data.type === 'audio') {
                setRecognizedSpeech(data.text);
            } else if (data.type === 'video') {
                setEmotionScores(prevScores => ({
                    ...prevScores,
                    [data.from]: data.score
                }));
            } else {
                console.log('WebSocket 메시지 수신:', data);
            }

            const { from, to, type, sdp, candidate } = data;

            if (from === userId) {
                console.log('수신한 메시지가 자기 자신으로부터 왔습니다. 무시합니다.');
                return;
            }

            if (!pcs.current[from]) {
                pcs.current[from] = createPeerConnection(from);
                pendingCandidates.current[from] = [];
                if (localStream) {
                    localStream.getTracks().forEach(track => {
                        pcs.current[from].addTrack(track, localStream);
                    });
                }
            }

            const pc = pcs.current[from];

            if (type === 'offer') {
                console.log(`오퍼 수신 from ${from}`);
                if (pc.signalingState !== 'stable') {
                    console.error(`Unexpected signaling state: ${pc.signalingState}`);
                    return;
                }
                const desc = new RTCSessionDescription(sdp);
                await pc.setRemoteDescription(desc);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendMessage({ type: 'answer', sdp: answer, from: userId, to: from });
            } else if (type === 'answer') {
                console.log(`답변 수신 from ${from}`);
                if (pc.signalingState === 'have-local-offer') {
                    const desc = new RTCSessionDescription(sdp);
                    await pc.setRemoteDescription(desc);
                    if (pendingCandidates.current[from]) {
                        pendingCandidates.current[from].forEach(async candidate => {
                            try {
                                await pc.addIceCandidate(new RTCIceCandidate(candidate));
                                console.log(`Added ICE candidate from ${from}`);
                            } catch (error) {
                                console.error('Failed to add ICE candidate', error);
                            }
                        });
                        pendingCandidates.current[from] = [];
                    }
                } else {
                    console.error(`Unexpected signaling state: ${pc.signalingState}`);
                }
            } else if (type === 'candidate') {
                console.log(`ICE 후보 수신 from ${from}`);
                const iceCandidate = new RTCIceCandidate(candidate);
                if (pc.remoteDescription) {
                    try {
                        await pc.addIceCandidate(iceCandidate);
                        console.log(`Added ICE candidate from ${from}`);
                    } catch (error) {
                        console.error('Failed to add ICE candidate', error);
                    }
                } else {
                    pendingCandidates.current[from].push(candidate);
                }
            } else if (type === 'join' && from !== userId) {
                console.log(`New user joined: ${from}`);
                connectToPeer(from);
            }
        };

        ws.current.onclose = () => {
            console.log("WebSocket 연결이 닫혔습니다");
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket 에러:", error);
        };
    };

    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            localVideoRef.current.srcObject = stream;
            console.log("Local stream started and tracks added to all RTCPeerConnections");

            setInterval(() => {
                if (localVideoRef.current) {
                    const canvas = document.createElement('canvas');
                    canvas.width = localVideoRef.current.videoWidth;
                    canvas.height = localVideoRef.current.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(localVideoRef.current, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg');
                    sendMessage({ type: 'frame', data: dataUrl });
                }
            }, 1000);
        } catch (error) {
            console.error('미디어 장치 접근 중 에러 발생:', error);
        }
    };

    const connectToPeer = async (id) => {
        if (!pcs.current[id]) {
            pcs.current[id] = createPeerConnection(id);
        }

        const pc = pcs.current[id];
        if (pc.signalingState === 'stable') {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendMessage({ type: 'offer', sdp: offer, from: userId, to: id });
        }
    };

    const handleJoinMeeting = () => {
        if (meetingKey) {
            setIsConnected(true);
            connectWebSocket();
            startLocalStream();
        } else {
            alert('회의 참가 키를 입력하세요.');
        }
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleReconnect = () => {
        if (ws.current) {
            ws.current.close();
        }
        Object.values(pcs.current).forEach(pc => pc.close());
        pcs.current = {};
        pendingCandidates.current = {};
        connectWebSocket();
        startLocalStream();
    };

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        Object.keys(remoteStreams).forEach(id => {
            if (remoteVideoRefs.current[id] && remoteStreams[id]) {
                remoteVideoRefs.current[id].srcObject = remoteStreams[id];
            }
        });
    }, [remoteStreams]);

    useEffect(() => {
        const interval = setInterval(() => {
            Object.keys(pcs.current).forEach(id => {
                if (pcs.current[id].iceConnectionState === 'disconnected') {
                    connectToPeer(id);
                }
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (ws) {
          ws.onmessage = function (event) {
            const message = JSON.parse(event.data).message;
            setMessages(prevMessages => [...prevMessages, message]);
          };
        }
    }, [ws]);
    
    const calculateAverageEmotionScore = () => {
        const scores = Object.values(emotionScores);
        if (scores.length === 0) return 0;
        const total = scores.reduce((sum, score) => sum + score, 0);
        return (total / scores.length).toFixed(2);
    };

    const averageEmotionScore = calculateAverageEmotionScore();

    // 점수에 따라 텍스트와 테두리 색상을 동적으로 설정하는 함수
    const getScoreColor = (averageEmotionScore) => {
        if (averageEmotionScore >= 0 && averageEmotionScore < 30) {
            return 'red';
        } else if (averageEmotionScore >= 30 && averageEmotionScore < 70) {
            return 'yellow';
        } else if (averageEmotionScore >= 70 && averageEmotionScore <= 100) {
            return '#40b569';
        } else {
            return '#000'; // 기본 색상 (예: 검정색)
        }
    };

    const scoreColor = getScoreColor(averageEmotionScore);

    return (
        <div className="Container">
            <div className='Chatting'>
            {messages.map((message, index) => (
            <div key={index}>{message}</div>
            ))}
                <div className='ChatInput'>
                    <input
                        type='text'
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? sendMessage() : null}
                        placeholder='메시지를 입력하세요'
                    />
                    <button onClick={sendMessage}>전송</button>
                </div>
            </div>
            <div className='Score' style={{ color: scoreColor, borderColor: scoreColor, borderStyle: 'solid', borderWidth: '5px', padding: '5px' }}>
                <text>{averageEmotionScore}</text>
            </div>
            {!isConnected ? (
                <div>
                    <input className='KeyInput'
                        type="text" 
                        value={meetingKey} 
                        onChange={(e) => setMeetingKey(e.target.value)} 
                        placeholder="회의 참가 키 입력" 
                    />
                    <button className="con-button" onClick={handleJoinMeeting}>회의 참가</button>
                </div>
            ) : (
                <div>
                    <video ref={localVideoRef} className="Camera1" autoPlay muted />
                    {Object.keys(remoteStreams).map((id) => (
                        <video key={id} ref={ref => remoteVideoRefs.current[id] = ref} className="Camera2" autoPlay />
                    ))}
                    <div className="speech">
                    <p>Recognized Speech: {recognizedSpeech}</p>
                    </div>
                    <button className="rescreen-button" onClick={handleRefresh}>화면 새로고침</button>
                    <button className="entry-button" onClick={handleReconnect}>연결 새로고침</button>
                </div>
            )}
        </div>
    );
};

export default MeetingDetail;
