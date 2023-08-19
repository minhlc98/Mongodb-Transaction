'use strict';
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: null },
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;