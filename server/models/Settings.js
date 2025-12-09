const mongoose = require("mongoose");

const membershipPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Monthly"
    durationInMonths: { type: Number, required: true }, // e.g. 1, 3, 6, 12
    price: { type: Number, required: true }, // price in currency units
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      unique: true,
    },

    // General gym info
    gymName: { type: String },
    gymCode: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String },

    // Operational settings
    openingTime: { type: String }, // "06:00"
    closingTime: { type: String }, // "22:00"
    workingDays: [{ type: String }], // ["Mon","Tue",...]

    // Membership pricing
    currency: { type: String, default: "INR" },
    membershipPlans: {
      type: [membershipPlanSchema],
      default: [
        { name: "Monthly", durationInMonths: 1, price: 1000, isActive: true },
        { name: "Quarterly", durationInMonths: 3, price: 2700, isActive: true },
        { name: "Half-Yearly", durationInMonths: 6, price: 5100, isActive: true },
        { name: "Yearly", durationInMonths: 12, price: 9600, isActive: true },
      ],
    },

    // Notification / reminder settings
    renewalReminderDays: { type: Number, default: 7 }, // days before expiry
    lowAttendanceAlertThreshold: { type: Number, default: 5 }, // visits per month
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;


