import React, { useEffect, useState, useRef } from 'react';
import { useParams } from "react-router-dom";

const MAX_PEERS = 4; // 최대 피어 수

const MeetingDetail = () => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const { meeting_id } = useParams();
    const localVideoRef = useRef();
    const remoteVideoRefs = useRef({});
    const pcs = useRef({});
    const ws = useRef(null);
    const pendingCandidates = useRef({});
    const userId = localStorage.getItem('user_id'); // 로컬 스토리지에서 사용자 ID를 가져옵니다.

    const createPeerConnection = (id) => {
        console.log(`Creating RTCPeerConnection for ${id}`);
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(`Sending ICE candidate to ${id}`);
                ws.current.send(JSON.stringify({
                    type: 'candidate',
                    candidate: event.candidate,
                    from: userId,
                    to: id
                }));
            }
        };

        pc.ontrack = (event) => {
            console.log(`Track received from ${id}:`, event.streams);
            setRemoteStreams(prevStreams => ({
                ...prevStreams,
                [id]: event.streams[0]
            }));
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`ICE connection state change for ${id}: ${pc.iceConnectionState}`);
        };

        pc.onsignalingstatechange = () => {
            console.log(`Signaling state change for ${id}: ${pc.signalingState}`);
        };

        return pc;
    };

    const connectWebSocket = () => {
        ws.current = new WebSocket(`wss://172.30.1.76/ws/meeting/${meeting_id}/`);

        ws.current.onopen = () => {
            console.log("WebSocket 연결 성공");
            ws.current.send(JSON.stringify({ type: 'join', from: userId }));
        };

        ws.current.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            console.log('WebSocket 메시지 수신:', data);

            const { from, type, sdp, candidate } = data;

            if (from === userId) {
                console.log('수신한 메시지가 자기 자신으로부터 왔습니다. 무시합니다.');
                return;
            }

            if (!pcs.current[from]) {
                pcs.current[from] = createPeerConnection(from);
                pendingCandidates.current[from] = [];
                // Add local stream to new peer connection
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
                ws.current.send(JSON.stringify({ type: 'answer', sdp: answer, from: userId, to: from }));
            } else if (type === 'answer') {
                console.log(`답변 수신 from ${from}`);
                if (pc.signalingState !== 'have-local-offer') {
                    console.error(`Unexpected signaling state: ${pc.signalingState}`);
                    return;
                }
                const desc = new RTCSessionDescription(sdp);
                await pc.setRemoteDescription(desc);
                if (pendingCandidates.current[from]) {
                    pendingCandidates.current[from].forEach(async candidate => {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        } catch (error) {
                            console.error('Failed to add ICE candidate', error);
                        }
                    });
                    pendingCandidates.current[from] = [];
                }
            } else if (type === 'candidate') {
                console.log(`ICE 후보 수신 from ${from}`);
                const iceCandidate = new RTCIceCandidate(candidate);
                if (pc.remoteDescription) {
                    try {
                        await pc.addIceCandidate(iceCandidate);
                    } catch (error) {
                        console.error('Failed to add ICE candidate', error);
                    }
                } else {
                    pendingCandidates.current[from].push(candidate);
                }
            } else if (type === 'join' && from !== userId) {
                console.log(`New user joined: ${from}`);
                if (!pcs.current[from]) {
                    pcs.current[from] = createPeerConnection(from);
                    pendingCandidates.current[from] = [];
                    // Send offer to new user
                    const offer = await pcs.current[from].createOffer();
                    await pcs.current[from].setLocalDescription(offer);
                    ws.current.send(JSON.stringify({ type: 'offer', sdp: offer, from: userId, to: from }));
                }

                // Send offer to all existing peers
                Object.keys(pcs.current).forEach(async peerId => {
                    if (peerId !== from && pcs.current[peerId].signalingState === 'stable') {
                        const offer = await pcs.current[peerId].createOffer();
                        await pcs.current[peerId].setLocalDescription(offer);
                        ws.current.send(JSON.stringify({ type: 'offer', sdp: offer, from: userId, to: peerId }));
                    }
                });
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
            stream.getTracks().forEach(track => {
                Object.values(pcs.current).forEach(pc => {
                    pc.addTrack(track, stream);
                });
            });
            console.log("Local stream started and tracks added to all RTCPeerConnections");
        } catch (error) {
            console.error('미디어 장치 접근 중 에러 발생:', error);
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
        connectWebSocket();
        startLocalStream();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
            Object.values(pcs.current).forEach(pc => pc.close());
        };
    }, [meeting_id, userId]);

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

    return (
        <div>
            <video ref={localVideoRef} autoPlay muted />
            {Object.keys(remoteStreams).map((id) => (
                <video key={id} ref={ref => remoteVideoRefs.current[id] = ref} autoPlay />
            ))}
            <button onClick={handleRefresh}>화면 새로고침</button>
            <button onClick={handleReconnect}>연결 새로고침</button>
        </div>
    );
};

export default MeetingDetail;
