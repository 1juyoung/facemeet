const mongoose = require("mongoose");

const { Schema } = mongoose;

const customerSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  nickname: {
    type: String,
    required: false,
  },
  signUpDate: {
    type: Date,
    default: Date.now,
  },
  meetings: [{ type: String }] 
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
