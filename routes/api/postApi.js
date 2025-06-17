const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../../mongoose/schemas/post.js");
const sharp = require("sharp");
const imageSize = require("image-size");
router.use(express.json());

// cors 설정
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

router.use(express.json());

// api 라우트
// 모든 게시물 조회
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Post Server Error" });
  }
});

// 긴급대여 게시물 조회
router.get("/emergency", async (req, res) => {
  try {
    const posts = await Post.find({ emergency: true });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Post Server Error" });
  }
});

// 특정 ID 게시물 조회 (상세페이지)
router.get("/postDetail/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    // 검증: ObjectId 형식인지 확인
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid ObjectId format" });
    }

    const post = await Post.findById(postId);

    // 해당 ID에 해당하는 게시물이 없을 경우
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Post Server Error" });
  }
});

// 게시글 검색
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    // 검색어를 이용하여 게시글 검색
    const searchResult = await Post.find({
      $or: [
        { subject: { $regex: query, $options: "i" } }, // 대소문자 구분 없이 검색
        { context: { $regex: query, $options: "i" } },
      ],
    });

    res.json(searchResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search Error" });
  }
});

// 게시물 등록
router.post("/", async (req, res) => {
  try {
    const { subject, context, userId, price, emergency, image } = req.body;

    // 이미지가 전송되었는지 확인
    if (image !== null) {
      const imageBuffer = Buffer.from(image, "base64");

      // 이미지 MIME 타입 식별
      const dimensions = imageSize(imageBuffer);
      const mimeType = dimensions.type;

      // 이미지 MIME 타입에 따라 contentType 설정
      let contentType;
      switch (mimeType) {
        case "image/jpeg":
          contentType = "image/jpeg";
          break;
        case "image/png":
          contentType = "image/png";
          break;
        case "image/gif":
          contentType = "image/gif";
          break;
        // 추가적으로 필요한 MIME 타입이 있으면 추가할 수 있습니다.
        default:
          throw new Error("Unsupported image format");
      }

      const newPost = new Post({
        subject,
        context,
        userId,
        price,
        emergency,
        image: {
          data: imageBuffer.slice(0, 10 * 1024 * 1024), // 최대 10MB까지만 저장 (조절 가능)
          contentType,
        },
      });

      const savedPost = await newPost.save();
      res.json(savedPost);
    } else {
      // 이미지가 전송되지 않은 경우 처리
      const newPost = new Post({
        subject,
        context,
        userId,
        price,
        emergency,
      });

      const savedPost = await newPost.save();
      res.json(savedPost);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Post Server Error" });
  }
});

// 게시물 수정
router.put("/:id", async (req, res) => {
  try {
    const { subject, context, userId, price, emergency, image } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { subject, context, userId, price, emergency, image },
      { new: true }
    );
    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Post Server Error" });
  }
});

// 게시물 삭제
router.delete("/:id", async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    res.json(deletedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Post Server Error" });
  }
});

// 에러 핸들링 미들웨어
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Post Server Error" });
});

module.exports = router;
