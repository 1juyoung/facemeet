const mongoose = require("mongoose");

const { Schema } = mongoose;
const meetingSchema = new Schema({
    meetingId: { type: String, required: true, unique: true },
    meetingTitle: { type: String, required: true },
    meetingPwd: { type: String, required: true },
    participants: [{ type: String }],
});

const meeting = mongoose.model("meeting", meetingSchema);

module.exports = meeting;