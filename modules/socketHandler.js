const { Server } = require("socket.io");

const rooms = {};  // 각 방의 사용자 ID를 저장하는 객체
const user = {};
const socketHandler = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5000", // 클라이언트가 실행 중인 포트
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);
        
        socket.on("join_room", (roomName) => {
            console.log(`User ${socket.id} joining room: ${roomName}`);
            
            if (!rooms[roomName]) {
                rooms[roomName] = [];
            }
            rooms[roomName].push(socket.id);
            socket.join(roomName);

            io.to(roomName).emit("room_users", rooms[roomName]);

            // 기존 사용자들에게 새로 참가한 사용자 정보 전달
            rooms[roomName].forEach((existingUserId) => {
                if (existingUserId !== socket.id) {
                    io.to(existingUserId).emit("welcome", { userId: socket.id });
                }
            });
        });



        // 사용자 연결 해제 시 처리
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);

            for (const roomName in rooms) {
                if (rooms[roomName].includes(socket.id)) {
                    rooms[roomName] = rooms[roomName].filter(id => id !== socket.id);
                    io.to(roomName).emit("room_users", rooms[roomName]);

                    if (rooms[roomName].length === 0) {
                        delete rooms[roomName];
                    }
                }
            }
        });

        // offer, answer, ICE 처리
        socket.on("offer", ({ offer, roomName, toUserId }) => {
            console.log(`Sending offer from ${socket.id} to ${toUserId} in room ${roomName}`);
            socket.to(toUserId).emit("offer", { offer, userId: socket.id, roomName });
        });

        socket.on("answer", ({ answer, roomName, toUserId }) => {
            console.log(`Sending answer from ${socket.id} to ${toUserId} in room ${roomName}`);
            socket.to(toUserId).emit("answer", { answer, userId: socket.id, roomName });
        });

        socket.on("ice", ({ ice, roomName, toUserId }) => {
            console.log(`Sending ICE from ${socket.id} to ${toUserId} in room ${roomName}`);
            socket.to(toUserId).emit("ice", { ice, userId: socket.id, roomName });
        });

        //채팅을 위한 socket 정의
        socket.on("event1", (msg) => {
            console.log(msg);
            io.emit("getID", socket.id);
        });

        // 모두에게
        socket.on("input", (data) => {
            //console.log(socket.id, " 가 보낸 메세지 : ", data);
            io.emit("msg", { id: socket.id, message: data })
            console.log(user);
        });

        // 본인 제외한 모든 소켓
        socket.on("inputWM", (data) => {
            socket.broadcast.emit("msg", { id: socket.id, message: data });
            //  console.log(socket.id, " 본인 제외 ", data);
            // io.emit("msg") 보내는코드
        });

        // 특정 소켓
        socket.on("private", (id, data) => {
            // console.log(socket.id, " 특정 소켓 ", data);
            io.to(id).emit("msg", { id: socket.id, message: data });
        });

    });
};

module.exports = socketHandler;