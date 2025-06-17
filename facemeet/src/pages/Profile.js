import React, { useState, useEffect } from "react";
import Layout from '../components/Layout';
import '../components/Profile.css';
import axios from 'axios';

function Profile() {
    const initialUserId = localStorage.getItem('userId');
    const accessToken = localStorage.getItem('accessToken'); // 인증 토큰

    const [user, setUser] = useState({
        user_id: initialUserId || '',
        nickname: '',
        email: '',
        username: ''
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    // fetchUser 함수 정의
    const fetchUser = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/customers?userId=${initialUserId}`);
            console.log('Server response data:', response.data); // 서버 응답을 확인
            const data = response.data;

            setUser({
                user_id: data.user_id || '',
                nickname: data.nickname || '',
                email: data.email || '',
                username: data.email ? data.email.split('@')[0] : '',
                profileImageId: data.profileImageId || null // profileImageId를 포함
            });
            setProfilePicture(data.profileImage || null); // 프로필 사진도 가져오기
            setLoading(false); // 로딩 완료
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false); // 로딩 완료
        }
    };

    useEffect(() => {
        fetchUser();
    }, [initialUserId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        console.log("handleSave called"); // 함수 호출 확인

        try {
            const formData = new FormData();
            formData.append('user_id', user.user_id);
            formData.append('nickname', user.nickname);
            formData.append('email', user.email);

            // 이미지 파일을 formData에 추가
            if (profilePictureFile) {
                formData.append('profileImage', profilePictureFile);
                console.log("Image file added to FormData"); // 이미지 파일 확인
            } else {
                console.log("No image file found"); // 이미지 파일이 없을 경우
            }

            const response = await axios.patch(`http://localhost:4000/api/customers/${user.user_id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUser({
                ...user,
                ...response.data
            });
            setProfilePicture(response.data.profileImage);
            alert('정보가 업데이트 되었습니다.');

            // 업데이트 후 최신 데이터 가져오기
            await fetchUser();
        } catch (error) {
            console.error('사용자 정보를 업데이트하는데 실패했습니다:', error);
            alert('정보 업데이트에 실패하였습니다.');
        }
    };



    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("Selected file:", file); // 파일 정보 확인
            setProfilePictureFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            console.log("No file selected");
        }
    };


    if (loading) {
        return <div>Loading...</div>; // 로딩 중일 때 표시
    }

    return (
        <Layout>
            <div className="Profile">
                <div className='header'></div>
                <div className='picture'>
                    {user.profileImageId ? (
                        <img src={`http://localhost:4000/api/customers/profileImage/${user.profileImageId}`} alt="Profile" className="profile-img" />
                    ) : (
                        <div className="profile-placeholder"></div>
                    )}
                </div>
                <h1>{user.nickname}</h1>
                <input
                    type="file"
                    id="profilePictureInput"
                    style={{ display: 'none' }}
                    onChange={handleProfilePictureChange}
                />
                <button className="picture-button" onClick={() => document.getElementById('profilePictureInput').click()}>
                    사진 변경
                </button>
                <button className="save" onClick={handleSave}>저장</button>
                <div className='information'>
                    <label>아이디:</label>
                    <input type="text" name="user_id" className="text-input" value={user.user_id} onChange={handleInputChange} required /><br></br>
                    <label>닉네임:</label>
                    <input type="text" name="nickname" className="text-input" value={user.nickname} onChange={handleInputChange} required /><br></br>
                    <label>이메일:</label>
                    <input type="text" name="email" className="text-input" value={user.email} onChange={handleInputChange} required /><br></br>
                </div>
            </div>
        </Layout>
    );
}

export default Profile;
