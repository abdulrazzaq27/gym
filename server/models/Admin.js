const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true , required: true},
  password: String,
  role: { type: String, enum: ["admin", "trainer"], default: "admin" }
});

module.exports = mongoose.model("Admin", adminSchema);
