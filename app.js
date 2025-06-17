const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const sharp = require("sharp");
const http = require("http");
const socketHandler = require("./modules/socketHandler");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const customersRouter = require("./routes/api/myPageApi");
const loginRouter = require("./routes/api/loginApi");
const registerRouter = require("./routes/api/registerApi");
const postRouter = require("./routes/api/postApi");
const myPageRouter = require("./routes/api/myPageApi");
const commentRouter = require("./routes/api/commentApi");
const accountRouter = require("./routes/api/accountApi");
const meetingRouter = require("./routes/api/meetingApi");
const emotionRouter = require("./routes/api/emotionApi");

const mongoose = require("./mongoose"); // mongoose 모듈을 불러옴
const app = express();
const PORT = 4000;

// 포트 확인용 콘솔 로그
console.log(`서버가 ${PORT}번 포트에서 실행됩니다.`);

const server = http.createServer(app);
socketHandler(server);

server.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

require("dotenv").config({
  path: ".env",
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./facemeet/build/index.html")));
app.use(express.static(path.join(__dirname, "public"))); // 프론트 연동 끝나면 이 경로 삭제
app.use(cors());
app.engine("html", require("ejs").renderFile); //ejs를 html파일처럼 사용하게 설정
app.set("view engine", "html"); //템플릿 엔진으로 ejs 사용

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/customers", customersRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/post", postRouter);
app.use("/mypage", myPageRouter);
app.use("/comment", commentRouter);
app.use("/account", accountRouter);
//facemeet 라우터 정의
app.use("/meeting", meetingRouter);
app.use("/emotion", emotionRouter);


app.use((req, res, next) => {
  res.status(404).render("404");
});

mongoose.connect();

app.get("*", function (request, response) {
  response.sendFile(path.join(__dirname, "./facemeet/build/index.html"));
});

app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname, "./facemeet/build/index.html"));
});



module.exports = app;
