const express = require("express");
const bcrypt = require("bcrypt");
const Customer = require("../../mongoose/schemas/customer.js");
const router = express.Router();

// 회원가입 라우터
router.post("/", async (req, res) => {
  try {
    const { userId, pw1, name, phone, email, gender } = req.body;
    console.log("여기로 맵핑됨");

    const saltRounds = 10; // 솔트를 생성할 라운드 수

    // 중복된 아이디 확인
    const existingUser = await Customer.findOne({ user_id: userId });
    if (existingUser) {
      return res.status(400).json({ error: "이미 사용 중인 아이디입니다." });
    }

    const plainPassword = req.body.pw1; // 사용자가 입력한 비밀번호 가져오기

    const salt = await bcrypt.genSalt(saltRounds); //솔트 생성

    // 솔트와 함께 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 새로운 고객 생성
    const newCustomer = new Customer({
      user_id: userId,
      password: hashedPassword,
      name,
      phone,
      email,
      gender,
    });

    // MongoDB에 저장
    const savedCustomer = await newCustomer.save();

    // 성공적으로 회원가입이 완료되었을 때 응답
    res.json({ message: "회원가입이 성공적으로 완료되었습니다." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

//회원가입 중복 확인 엔드포인트
router.post("/checkDuplicate", async (req, res) => {
  try {
    const { userId } = req.body;

    // 사용자가 입력한 ID가 이미 존재하는지 확인
    const existingUser = await Customer.findOne({ user_id: userId });

    if (existingUser) {
      res.json({ isDuplicate: true, message: "이미 사용 중인 ID입니다." });
    } else {
      res.json({ isDuplicate: false, message: "사용 가능한 ID입니다." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
