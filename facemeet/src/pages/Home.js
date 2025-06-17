import React, { useState } from 'react';
import Layout from '../components/Layout';
import '../components/ReHome.css';
import { AiFillVideoCamera, AiOutlinePlus, AiOutlineFileSearch, AiOutlineUser } from 'react-icons/ai'; // Added AiOutlineUser for profile icon
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TbFlagSearch } from 'react-icons/tb';



// Modal component definition without passing data or defining styles
const Modal = ({ onClose, onConfirm, children }) => {
    // 모달 스타일
    const modalStyle = {
        position: 'fixed',
        width: '18rem',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '40px',
        marginLeft: '10px',
        borderRadius: '8px',
        border: '3px solid #ccc',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
    };

    // 닫기 버튼
    const closeButtonStyle = {
        width: '4rem',
        marginLeft: '2rem',
        marginTop: '20px',
        padding: '10px',
        cursor: 'pointer',
        backgroundColor: '#fa9018',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
    };

    // 확인 버튼
    const okButtonStyle = {
        width: '4rem',
        marginLeft: '6rem',
        marginTop: '20px',
        padding: '10px',
        cursor: 'pointer',
        backgroundColor: '#2a9551',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
    };

    return (
        <div style={modalStyle}>
            {children}
            <button style={closeButtonStyle} onClick={onClose}>취소</button>
            <button style={okButtonStyle} onClick={onConfirm}>확인</button>
        </div>

    );
};



// 새 회의 모달
const NewMeetingModal = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [meetingId, setMeetingId] = useState('');
    const [password, setPassword] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        const userId = localStorage.getItem('userId'); // Current user's ID


        try {
            const newMeetingData = {
                meetingTitle: title,
                meetingId: meetingId,
                meetingPwd: password,
                userId: userId,
            };

            const response = await axios.post('http://localhost:4000/meeting/newmeeting', newMeetingData);

            console.log('Meeting created:', response.data);
            setShowConfirm(true);
        } catch (error) {
            console.error('새 회의를 만드는데 오류:', error);
        }
    };

    // Handle confirmation
    const handleConfirm = () => {
        console.log('Meeting participation confirmed.');
        onClose();
    };

    return (
        <Modal onClose={onClose} onConfirm={handleSubmit}>
            <div style={{ textAlign: 'center', margin: '1rem' }}>
                <p style={{ fontWeight: 'bold' }}>새 회의 만들기</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='title' style={{ marginRight: '2.2rem' }}>Title</label>
                    <input
                        type='text'
                        id='title'
                        name='title'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='회의 이름'
                        style={{ margin: '1rem', padding: '5px', borderRadius: '5px', border: 'none', background: '#97F7B8' }}
                    /><br></br>
                    <label htmlFor='id' style={{ marginRight: '3.2rem' }}>Id</label>
                    <input
                        type='text'
                        id='id'
                        name='id'
                        value={meetingId}
                        placeholder='아이디'
                        onChange={(e) => setMeetingId(e.target.value)}
                        style={{ margin: '1rem', padding: '5px', borderRadius: '5px', border: 'none', background: '#97F7B8' }}
                    /><br></br>
                    <label htmlFor='password' style={{ marginRight: '0rem' }}>Password</label>
                    <input
                        type='text'
                        id='password'
                        name='password'
                        placeholder='비밀번호'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ margin: '1rem', padding: '5px', borderRadius: '5px', border: 'none', background: '#97F7B8' }}
                    /><br></br>
                </div>
            </form>
            {showConfirm && (
                <div style={{ marginTop: "20px" }}>
                    <p>생성되었습니다! 참가하시겠습니까?</p>
                    <button onClick={handleConfirm} style={{ marginRight: '10px' }}>예</button>
                    <button onClick={onClose}>아니오</button>
                </div>
            )}
        </Modal>
    );
};

// id 입력 후 참가
const AttendMeetingModal = ({ onClose, onConfirm }) => {
    const [meetingId, setMeetingId] = useState('');
    const [password, setPassword] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const participate = async (event) => {
        event.preventDefault();
        const userId = localStorage.getItem('userId');

        try {
            const response = await axios.post('http://localhost:4000/meeting/participate', {
                meetingId, // _id 값을 그대로 사용
                userId,
            });

            console.log('Meeting participate:', response.data);
            setShowConfirm(true);
            onConfirm(); // 모달 종료 후 콜백 실행
        } catch (error) {
            console.error('참가 오류:', error);
        }
    };

    return (
        <Modal onClose={onClose} onConfirm={participate}>
            <p>회의 참가하기</p>
            <form>
                <p>Meeting _id</p>
                <input
                    type='text'
                    name='id'
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                />
                <p>Password</p>
                <input
                    type='text'
                    name='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </form>
        </Modal>
    );
};

// Main component for MeetingBefore
function MeetingBefore() {
    const userId = localStorage.getItem('userId');
    // State variables
    const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
    const [showAttendMeetingModal, setShowAttendMeetingModal] = useState(false);

    // Router navigation hook
    const navigate = useNavigate();
    const iconStyle = { color: 'white', fontSize: '50px', marginLeft: '25px', marginTop: '20px' };
    const iconbox = { marginTop: '10px', position: 'relative', marginLeft: '0.5rem' };

    // Functions to toggle modals
    const NewMeeting = () => {
        setShowNewMeetingModal(true);
    };

    const AttendMeeting = () => {
        setShowAttendMeetingModal(true);
    };

    const NoteList = () => {
        navigate('/NoteList');
    };

    // Profile button click handler
    const goToProfile = () => {
        navigate('/Profile');
    };



    return (
        <Layout>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Profile Button */}
                <div className="green-box1" onClick={goToProfile}>
                    <div style={iconbox}>
                        <AiOutlineUser style={iconStyle} />
                    </div>
                    <p style={{ marginTop: '8rem', marginLeft: '1.6rem', position: 'fixed', fontWeight: 'bold' }}>프로필</p>
                </div>

                {/* New Meeting Button */}
                <div className="green-box2" onClick={NewMeeting}>
                    <div style={iconbox}>
                        <AiFillVideoCamera style={iconStyle} />
                    </div>
                    <p style={{ marginTop: '8rem', marginLeft: '1.6rem', position: 'fixed', fontWeight: 'bold' }}>새 회의</p>
                </div>

                {/* Attend Meeting Button */}
                <div className="green-box3" onClick={AttendMeeting}>
                    <div style={iconbox}>
                        <AiOutlinePlus style={iconStyle} />
                    </div>
                    <p style={{ marginTop: '8rem', marginLeft: '2.6rem', position: 'fixed', fontWeight: 'bold' }}>참가</p>
                </div>

                {/* Note List Button */}
                <div className="green-box4" onClick={NoteList}>
                    <div style={iconbox}>
                        <AiOutlineFileSearch style={iconStyle} />
                    </div>
                    <p style={{ marginTop: '8rem', marginLeft: '0.3rem', position: 'fixed', fontWeight: 'bold' }}>이전 회의 기록</p>
                </div>
            </div>
            {/* Rendering modals */}
            {showNewMeetingModal && <NewMeetingModal onClose={() => setShowNewMeetingModal(false)} />}
            {showAttendMeetingModal && <AttendMeetingModal onClose={() => setShowAttendMeetingModal(false)} />}
        </Layout>
    );
}

export default MeetingBefore;