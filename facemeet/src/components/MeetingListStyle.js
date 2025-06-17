import React from 'react';
import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function MeetingListStyle({ meeting, onClick = () => { } }) {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (typeof onClick === 'function') {
      onClick(meeting);
    }
    // meetingId가 제대로 있는지 확인
    if (!meeting.meetingId) {
      console.error("Error: meetingId is undefined or null", meeting);
      return; // meetingId가 없으면 이동하지 않음
    }

    console.log("Navigating to meeting detail with meetingId:", meeting.meetingId);
    navigate(`/meetingdetail/${meeting.meetingId}`);
    // 고유 meetingId를 사용해 해당 미팅의 디테일 페이지로 이동
  };

  return (
    <Button
      key={meeting.meetingId}
      variant="contained"
      className={`custom-Button`}
      style={{
        backgroundColor: '#97F7B8',
        marginTop: '1rem',
        width: '10rem',
        height: '4rem',
        borderRadius: '10%',
        border: `none`,
        padding: '1.5px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontWeight: 'bold'
      }}
      sx={{
        '&:hover': {
          backgroundColor: '#2a9551 !important',
        },
      }}
      onClick={handleButtonClick}
    >
      <Typography variant="body2" align='center' sx={{ color: 'black' }}>
        {meeting.meetingTitle || 'No Title'}
      </Typography>
    </Button>
  );
}

export default MeetingListStyle;
