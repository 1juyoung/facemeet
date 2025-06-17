const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
router.use(express.json());
const Meeting = require('../../mongoose/schemas/meeting'); // Meeting 스키마 가져옴
const Customer = require('../../mongoose/schemas/customer');

router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  
  router.use(express.json());

// 미팅 생성 API
router.post('/newmeeting', async (req, res) => {
    console.log('Received POST request at /meeting');
    console.log('Request body:', req.body);
    const { meetingId, meetingTitle, meetingPwd, userId } = req.body;
    console.log('Request data:', { meetingId, meetingTitle, meetingPwd, userId });
   
    if (!userId || !meetingId || !meetingTitle || !meetingPwd) {
        return res.status(400).json({ message: '필수 필드가 누락되었습니다.' });
    }

    // 새로운 미팅 생성
    const newMeeting = new Meeting({
        meetingId,
        meetingTitle,
        meetingPwd,
        participants: [userId],
    });

    try {
        
        const savedMeeting = await newMeeting.save(); // MongoDB에 저장
        console.log('Meeting saved:', savedMeeting);

        // Customer 스키마에 해당 사용자의 meetings 배열에 새 미팅 ID 추가
        const updatedCustomer = await Customer.findOneAndUpdate(
            { user_id: userId },
            { $push: { meetings: meetingId } },
            { new: true }
        );

        if (!updatedCustomer) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Customer updated:', updatedCustomer);
        res.status(201).json(savedMeeting); // 미팅 생성 성공 응답
    } catch (err) {
        res.status(500).json({ message: '미팅 생성 오류', error: err });
    }
});

// 미팅 참가 API
router.post('/participate', async (req, res) => {
    const { meetingId, userId } = req.body;

    try {
        // 미팅을 찾고 participants 배열에 userId 추가
        const meeting = await Meeting.findOneAndUpdate(
            { _id: meetingId },  // meetingId 대신 _id로 검색
            { $addToSet: { participants: userId } }, // 중복 방지
            { new: true } // 업데이트 후 문서를 반환
        );

        if (!meeting) {
            return res.status(404).json({ message: '미팅을 찾을 수 없습니다.' });
        }

        // Customer 스키마의 meetings 배열에 미팅 ID 추가
        await Customer.findOneAndUpdate(
            { user_id: userId },
            { $addToSet: { meetings: meetingId } }, // 중복 방지
            { new: true }
        );

        res.status(200).json({ message: '참가 성공', meeting });
    } catch (err) {
        console.error('참가 오류:', err);
        res.status(500).json({ message: '참가 오류', error: err });
    }
});


// 사용자 미팅 목록 가져오는 API
router.get('/user-meetings/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // participants 배열에 userId가 포함된 미팅을 찾음
        const userMeetings = await Meeting.find(
            { participants: userId }, 
            'meetingId meetingTitle' // meetingId와 meetingTitle만 반환
        );

        if (!userMeetings || userMeetings.length === 0) {
            return res.status(404).json({ message: '참여한 미팅이 없습니다.' });
        }

        res.status(200).json(userMeetings); // 미팅 리스트 반환
    } catch (err) {
        console.error('미팅 목록 가져오기 오류:', err);
        res.status(500).json({ message: '서버 오류', error: err });
    }
});

module.exports = router;
