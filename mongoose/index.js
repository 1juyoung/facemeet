const mongoose = require("mongoose");
require("dotenv").config();

const connect = async () => {
  try {
    if (process.env.NODE_ENV !== "production") {
      mongoose.set("debug", true);
    }

    await mongoose.connect(process.env.MONGOOSE_CONNECT, {
      dbName: process.env.MONGOOSE_DBNAME,
    });

    console.log("mongodb 연결 성공");
  } catch (error) {
    console.error("mongodb 연결 에러", error);
  }
};

mongoose.connection.on("error", (error) => {
  console.error("mongodb 연결 에러", error);
});

mongoose.connection.on("disconnected", () => {
  console.error("mongodb 연결 종료됨");
  connect();
});

module.exports = {
  connect,
};
