import { Avatar, Typography, Box } from '@mui/material';
import logo from '../dog.svg';
import './Style.css';

// 해당 유저의 프로필로 이동 X

function ProfileListStyle({ username, state }) {
    return (
        <div>
            <Box
                sx={{
                    position: 'relative',
                    display: 'inline-block',
                }}
            >
                <Avatar src={logo} alt={username} className='custom-avatar'
                    sx={{
                        width: '5rem',
                        height: '5rem',
                        marginLeft: '8px',
                        borderRadius: '15%',
                        '> img': {
                            padding: '1.5px',

                        },
                    }} />

                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: state ? '#4EE080' : '#FF8A00', // 원 모양 도형의 배경색
                        border: '2px solid white', // 원 모양 도형의 테두리
                    }}
                />
            </Box>

            <Typography variant="body2" noWrap align='center' sx={{ width: '56px' }}> {username}</Typography>
        </div>
    );

}
export default ProfileListStyle;