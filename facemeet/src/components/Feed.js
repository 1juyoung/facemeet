import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import axios from 'axios';
import MeetingList from './MeetingList';
import MeetingLogo from './MeetingLogo.png';
import './Style.css';
import { CiMicrophoneOff, CiMicrophoneOn, CiVideoOff, CiVideoOn, CiSettings } from "react-icons/ci";


const Feed = () => {
    const navigate = useNavigate();

    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [profileList, setProfileList] = useState();
    const [meetings, setMeetings] = useState([]);


    useEffect(() => {
        const userId = localStorage.getItem('userId');

        axios.get(`http://localhost:4000/mypage?userId=${userId}`)
            .then(response => {
                const data = response.data;
                setProfileList(data);
            })
            .catch(error => {
                console.error('데이터를 불러오는 중 에러 발생:', error);
            });


        axios.get(`http://localhost:4000/meeting/user-meetings/${userId}/`)
            .then(response => {
                setMeetings(response.data);
            })
            .catch(error => {
                console.error('Error fetching meetings:', error);
            });
    }, []);




    const toggleMic = (event) => {
        event.stopPropagation(); // 이벤트 버블링 방지
        setIsMicOn(prevState => !prevState);
        document.getElementById('mic').classList.toggle('icon-on');
    };

    const toggleVideo = (event) => {
        event.stopPropagation(); // 이벤트 버블링 방지
        setIsVideoOn(prevState => !prevState);
        document.getElementById('video').classList.toggle('icon-on');
    };


    if (!meetings) {
        return <div>Loading...</div>;
    }



    return (
        <div className='Layout'>
            <Box
                component="main"
                sx={{
                    display: 'grid',
                    maxHeight: '93vh',
                    gridTemplateColumns: {
                        xs: 'repeat(6, 1fr)',
                        sm: 'repeat(6, 1fr)',
                        md: 'repeat(6, 1fr)',
                    },
                    gridTemplateRows: {
                        xs: 'repeat(6, 1fr) minmax(0, 1fr) repeat(4, 1fr)',
                        sm: 'repeat(6, 1fr)',
                        md: 'repeat(6, 1fr)',
                    },
                    columnGap: '1rem',
                    marginX: 'auto',
                    marginY: 'auto',
                }}
            >
                <Box
                    component="section"
                    sx={{
                        gridColumn: '1 / 2',
                        gridRow: '2 / 6',
                        display: 'fle',
                        flexDirection: 'column',
                        justifyContent: 'flex-end'
                    }}
                >
                    <MeetingList sx={{ height: '100%' }} />
                    {meetings.map(meeting => (
                        <div key={`key-${meeting.meetingId}`} >

                        </div>
                    ))}
                    <Box sx={{
                        position: 'relative',
                        paddingTop: '3%',
                        width: '16.3rem',
                        height: '10rem',
                    }} >
                        <Box sx={{
                            position: 'relative',
                            backgroundColor: 'grey',
                            marginLeft: '4%',
                            marginTop: '1.5%',
                            width: '3rem',
                            height: '3rem',
                            borderRadius: '15%',
                        }} >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    width: '17px',
                                    height: '17px',
                                    borderRadius: '50%',
                                    backgroundColor: profileList && profileList.length > 0 && profileList[0].state ? '#4EE080' : '#FF8A00',
                                    border: '1px solid white',
                                }}
                            />
                        </Box>
                        <div style={{
                            position: 'relative',
                            marginLeft: '27%',
                            marginTop: '-16%',
                            fontWeight: 'bold'
                        }}>
                            {profileList && profileList.user_id}
                        </div>

                        {/* {profileList.nickname (
                            <div style={{
                                fontSize: '0.8rem',
                                position: 'relative',
                                marginLeft: '27%',
                                marginTop: '0%',
                                fontWeight: 'bold'
                            }}>
                                {profileList[0].state ? '온라인' : '오프라인'}
                            </div>
                        )}*/ }

                        <div id='mic' className="icon-wrapper" onClick={toggleMic}> {isMicOn ? <CiMicrophoneOn /> : <CiMicrophoneOff />} </div>

                        <div id='video' className="icon-wrapper" onClick={toggleVideo}> {isVideoOn ? <CiVideoOn /> : <CiVideoOff />} </div>

                        <div id='setting' onClick={() => navigate('/NoteDetail')}><CiSettings /> </div>
                    </Box>
                </Box>
                {/* Logo */}
                <Box
                    sx={{
                        gridColumn: '1 / -1',
                        gridRow: '1 / 2',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '2px solid #ccc', // 그리드의 두께와 색상 지정
                    }}
                >
                    <img
                        src={MeetingLogo}
                        alt="Meeting 로고"
                        style={{ width: '15rem', height: '8rem' }}
                        onClick={() => navigate('/Home')}
                    />
                </Box>
            </Box>

        </div>
    );
}

export default Feed;