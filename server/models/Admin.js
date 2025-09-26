const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "trainer"], default: "admin" },

  // NEW FIELDS
  gymName: { type: String, required: true }, // "FitLife Gym"
  gymCode: { type: String, unique: true, required: true }, // e.g. FIT123
});

module.exports = mongoose.model("Admin", adminSchema);
