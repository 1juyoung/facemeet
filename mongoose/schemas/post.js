const mongoose = require("mongoose");

const { Schema } = mongoose;

const postSchema = new Schema({
  subject: {
    type: String,
    required: true,
  },
  context: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  posted: {
    type: Date,
    default: Date.now,
  },
  price: {
    type: Number,
    required: true,
  },
  emergency: {
    type: Boolean,
  },
  image: {
    data: Buffer, // 이미지 데이터
    contentType: String, // 이미지 컨텐츠 타입 (예: "image/png", "image/jpeg")
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
