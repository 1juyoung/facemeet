const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// 토큰 검증 함수
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log("verifyToken에서 에러남");
    return null;
  }
};

// 미들웨어 : 경로 검사
const requireAuth = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    //토큰이 없으면 로그인 페이지로 이동

    console.log("토큰이 없습니다.");

    return res.redirect("/login");
  }

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    //토큰이 유효하지 않으면 로그인 페이지로 이동
    window.location.href = "/login";
  }
  //토큰이 유효하면 다음 미들웨어로 이동
  req.userId = decodedToken.userId;
  next();
};

// 라우터
router.get("/", requireAuth, (req, res) => {
  res.render("index");
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.get("/join", function (req, res, next) {
  res.render("join");
});

module.exports = router;
