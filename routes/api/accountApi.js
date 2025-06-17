const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../../mongoose/schemas/post.js");
const Account = require("../../mongoose/schemas/account.js");

// 가계부
router.get("/accountBook/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // 사용자의 잔고 조회
    const ledger = await Account.findOne({ userId });

    if (!ledger) {
      return res.status(404).json({ error: "Ledger not found" });
    }

    // 여기서 필요에 따라 다른 정보를 응답에 추가할 수 있습니다.
    res.json({ balance: ledger.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Balance Retrieval Error" });
  }
});

// 거래 등록
router.post("/transaction", async (req, res) => {
  try {
    const { userId, balance } = req.body;

    // 해당 유저의 가계부를 찾거나 생성
    const ledger = await Account.findOneAndUpdate(
      { userId },
      { $inc: { balance } }, // 클라이언트에서 보낸 balance 값을 현재 잔고에 추가
      { new: true, upsert: true } // upsert 옵션은 데이터가 없으면 새로 생성
    );

    // 여기서 다른 거래 로직 등을 추가할 수 있습니다.

    res.json({ success: true, ledger });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transaction Error" });
  }
});

module.exports = router;
