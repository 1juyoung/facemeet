const express = require("express");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Chat = require("../../mongoose/schemas/chat");

const io = socketIo(server);

// 미들웨어 설정
app.use(bodyParser.json());

// 채팅 시작 API
app.post("/startChat", async (req, res) => {
  try {
    const { userId, otherUserId } = req.body;

    // 채팅이 이미 존재하는지 확인
    const existingChat = await Chat.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (existingChat) {
      // 이미 존재하는 채팅이면 기존 채팅의 ID를 클라이언트에게 응답
      return res.json({ chatId: existingChat._id });
    }

    // 채팅이 없으면 새로운 채팅 생성
    const newChat = new Chat({
      participants: [userId, otherUserId],
    });

    const savedChat = await newChat.save();

    // 생성된 채팅의 ID를 클라이언트에게 응답
    res.json({ chatId: savedChat._id });

    // 실시간으로 채팅 알림을 보내기 위해 Socket.io를 사용
    io.emit("newChat", { chatId: savedChat._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Socket.io 연결
io.on("connection", (socket) => {
  console.log("Client connected");

  // 클라이언트로부터 메시지를 받으면 해당 채팅방에 메시지를 브로드캐스트
  socket.on("sendMessage", async (data) => {
    const { chatId, sender, content } = data;

    // MongoDB에 메시지 저장
    const chat = await Chat.findById(chatId);
    chat.messages.push({ sender, content });
    await chat.save();

    // 해당 채팅방에 메시지 브로드캐스트
    io.to(chatId).emit("receiveMessage", { sender, content });
  });

  // 클라이언트로부터 채팅방 입장을 받으면 해당 채팅방에 입장
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });

  // 연결 해제 시 로그 출력
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
