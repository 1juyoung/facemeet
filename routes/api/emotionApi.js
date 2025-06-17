const express = require('express');
const router = express.Router();
const MeetingVideo = require('../../mongoose/schemas/meetingVideo'); // MeetingVideo 스키마 가져오기
const { spawn } = require('child_process');
const { ObjectId } = require('mongoose').Types;

// 평균 감정 점수 가져오기
router.get('/average_score/:meetingDbId', async (req, res) => {
    const { meetingDbId } = req.params;

    try {
        const meeting = await MeetingVideo.findOne({ _id: ObjectId(meetingDbId) }); // meetingDbId로 조회

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.status(200).json({ averageScore: meeting.averageEmotionScore });
    } catch (err) {
        console.error('Error retrieving average score:', err);
        res.status(500).json({ message: 'Error retrieving average score', error: err });
    }
});

// 실시간 스트림 데이터 받기
router.post('/stream', (req, res) => {
    const { meetingId, userId, data } = req.body;

    if (!meetingId || !data) {
        return res.status(400).json({ message: 'Invalid data received' });
    }

    // 파이썬 스크립트를 실행해 감정 분석 수행
    const pythonProcess = spawn('python', ['analyze_emotion.py']);

    pythonProcess.stdin.write(JSON.stringify({ meetingId, userId, data }));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python script output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });

    res.status(200).json({ message: 'Stream data received' });
});

router.post('/emotion/score', async (req, res) => {
    const { meetingId, score, transcription } = req.body;

    if (!meetingId || score === undefined) {
        return res.status(400).json({ message: 'Invalid data received' });
    }

    try {
        // meetingId를 이용해 MeetingVideo 스키마 업데이트
        const meeting = await MeetingVideo.findOneAndUpdate(
            { _id: ObjectId(meetingId) },
            { $set: { averageEmotionScore: score }, $push: { transcriptions: transcription } },
            { new: true }
        );

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.status(200).json({ message: 'Emotion score updated successfully' });
    } catch (error) {
        console.error('Error updating emotion score:', error);
        res.status(500).json({ message: 'Error updating emotion score', error });
    }
});



module.exports = router;
