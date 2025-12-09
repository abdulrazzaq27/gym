const express = require("express");
const Settings = require("../models/Settings");

const router = express.Router();

// Get settings for logged-in admin
router.get("/", async (req, res) => {
  try {
    const adminId = req.user.id;

    let settings = await Settings.findOne({ adminId });

    // If no settings, create with defaults (linked to this admin)
    if (!settings) {
      settings = await Settings.create({
        adminId,
      });
    }

    res.json(settings);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// Update / upsert settings for logged-in admin
router.put("/", async (req, res) => {
  try {
    const adminId = req.user.id;
    const payload = req.body;

    const updated = await Settings.findOneAndUpdate(
      { adminId },
      { $set: { ...payload, adminId } },
      { new: true, upsert: true }
    );

    res.json({ message: "Settings updated", settings: updated });
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

module.exports = router;


