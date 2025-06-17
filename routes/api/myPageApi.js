const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const Customer = require("../../mongoose/schemas/customer.js");
const router = express.Router();
require('dotenv').config();

// .env 파일에서 MONGO_URI를 가져와 사용
const mongoURI = process.env.MONGOOSE_CONNECT;

// MongoDB 연결 설정
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("photos"); // 버킷 이름을 설정
  console.log("gfs initialized:", gfs); // gfs 초기화 확인용 로그
});


// GridFS Storage 설정
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    console.log("File being uploaded:", file);
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "photos",
    };
  },
});
const upload = multer({ storage });


// 사용자 정보 조회
router.get("/", async (req, res) => {
  try {
    const loggedInUserId = req.query.userId;
    const customer = await Customer.findOne({ user_id: loggedInUserId }).exec();
    if (!customer) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Mypage Server Error" });
  }
});

// 프로필 사진 업로드 및 사용자 정보 수정
router.patch("/:userId", upload.single("profileImage"), async (req, res) => {
  try {
    console.log("Request received:", req.body, req.file); // 요청 정보와 파일 확인

    const userId = req.params.userId;
    const updatedFields = {};
    const allowedFields = ["user_id", "username", "email", "nickname"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updatedFields[field] = req.body[field];
      }
    });

    if (req.file) {
      console.log("File ID:", req.file.id); // 파일 ID 확인
      updatedFields.profileImageId = req.file.id;
    }

    const result = await Customer.updateOne({ user_id: userId }, { $set: updatedFields });
    const updatedUser = await Customer.findOne({ user_id: userId });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Mypage Server Error" });
  }
});



// 프로필 이미지 조회
router.get("/profileImage/:id", (req, res) => {
  try {
    const fileId = req.params.id;
    gfs.files.findOne({ _id: new mongoose.Types.ObjectId(fileId) }, (err, file) => { // 'new' 키워드 추가
      if (!file || file.length === 0) {
        return res.status(404).json({ error: "Image not found" });
      }

      if (file.contentType.startsWith("image")) {
        const readstream = gfs.createReadStream({ _id: file._id });
        readstream.pipe(res);
      } else {
        res.status(400).json({ error: "Not an image file" });
      }
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "Error fetching image" });
  }
});


module.exports = router;


// 사용자 탈퇴
router.delete("/", async (req, res) => {
  try {
    // 로그인한 사용자의 user_id를 토대로 해당 사용자 삭제
    const loggedInUserId = req.user.userId; // 이 정보는 로그인 미들웨어에서 설정되어야 합니다.

    const result = await Customer.deleteOne({ user_id: loggedInUserId });

    if (result.deletedCount === 0) {
      // 삭제된 데이터가 없음
      return res.status(404).json({ error: "User not found" });
    }

    // 삭제 성공 응답
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Mypage Server Error" });
  }
});

module.exports = router;
