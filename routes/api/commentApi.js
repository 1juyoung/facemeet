const express = require("express");
const Comment = require("../../mongoose/schemas/comment.js");
const router = express.Router();

// 모든 댓글 조회
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Comment Server Error" });
  }
});

// 특정 게시물에 대한 모든 댓글 조회
router.get("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ postId });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Comment Server Error" });
  }
});

// 댓글 작성
router.post("/", async (req, res) => {
  try {
    const { postId, content, userId } = req.body;
    const newComment = new Comment({
      postId,
      content,
      userId,
    });
    const savedComment = await newComment.save();
    res.json(savedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Comment Server Error" });
  }
});

// 댓글 삭제
router.delete("/:commentId", async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    res.json(deletedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Comment Server Error" });
  }
});

module.exports = router;
