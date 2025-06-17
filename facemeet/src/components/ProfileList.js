import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box } from '@mui/material';
import ProfileListStyle from './ProfileListStyle';

function ProfileList() {
    const [profileList, setProfileList] = useState();  // 변수 이름 변경

    /* 친구 목록에서 친구의 프로필과 이름을 가져올 수 있어야 함. */

    useEffect(() => {
        axios.get('/testData.json')
            .then(response => {
                const data = response.data.Profile;
                const sortedData = data.sort((a, b) => b.state - a.state);
                setProfileList(sortedData);
            })
            .catch(error => {
                console.error('데이터를 불러오는 중 에러 발생:', error);
            });
    }, []);

    if (!profileList) return <div>loading...</div>;

    return (
        <Box
            sx={{
                display: 'flex',
                padding: '1.5rem',
                overflowX: 'auto',
                border: `1px solid #e0e0e0`,
                borderRadius: '2px',
                '> div + div': {
                    marginLeft: '0.5rem',
                },
            }}
        >
            {profileList.map((profile) => (
                <ProfileListStyle key={profile.id} username={profile.name} state={profile.state} />
            ))}
        </Box>
    );
}

export default ProfileList;