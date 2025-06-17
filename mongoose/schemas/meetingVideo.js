const mongoose = require("mongoose");

const { Schema } = mongoose;
const meetingVideoSchema = new Schema({
    meetingId: { type: String, required: true, unique: true }, // 미팅 ID
    meetingTitle: { type: String, required: true }, // 미팅 제목
    meetingDate: { type: Date, required: true }, // 미팅 날짜
    startTime: { type: Date, required: true }, // 미팅 시작 시간
    endTime: { type: Date }, // 미팅 종료 시간
    participants: [{ type: String }], // 참가자 목록
    averageEmotionScore: { type: Number, default: 0 }, // 평균 표정 점수
    highestEmotionScore: { 
        score: { type: Number, default: 0 }, 
        time: { type: Date }
    }, // 최고 표정 점수와 발생 시각
    lowestEmotionScore: { 
        score: { type: Number, default: 0 }, 
        time: { type: Date }
    } // 최저 표정 점수와 발생 시각
});

const MeetingVideo = mongoose.model("MeetingVideo", meetingVideoSchema);
module.exports = MeetingVideo;
