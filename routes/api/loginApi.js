const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Customer = require("../../mongoose/schemas/customer.js");
const router = express.Router();

// JWT 토큰 생성 함수
const generateToken = (user) => {
  return jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// 로그인 처리 부분
router.post("/", async (req, res) => {
  const { userId, password, rememberMe } = req.body;
  console.log("로그인 시도하는 사용자 정보", req.body);

  const plainPassword = req.body.password; //사용자가 입력한 비밀번호

  // 일치하는 user_id가 데이터베이스에 존재하는지 확인
  const customer = await Customer.findOne({ user_id: userId }).exec();

  if (!customer) {
    return res.status(401).send("Invalid username or password");
  }

  // 입력된 비밀번호와 저장된 해시된 비밀번호를 비교
  const isPasswordValid = await bcrypt.compare(
    plainPassword,
    customer.password
  );

  if (isPasswordValid) {
    //로그인 성공
    const token = generateToken(customer);

    //로그인 유지 옵션에 따라 토큰을 쿠키에 저장
    if (rememberMe) {
      res.cookie("token", token, { maxAge: 30 * 24 * 60 * 60 * 1000 }); //쿠키의 유효기간 : 30일간 유지
    } else {
      res.cookie("token", token); // 세션 동안만 유지
    }

    res.json({ userId: customer.user_id, token });
  } else {
    //로그인 실패
    console.log("로그인 실패");
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// 로그아웃 처리 부분
router.post("/logout", async (req, res) => {
  // 쿠키에서 토큰을 제거하여 로그아웃
  res.clearCookie("token");

  // 로그아웃 성공 응답
  res.json({ success: true });
});

module.exports = router;
