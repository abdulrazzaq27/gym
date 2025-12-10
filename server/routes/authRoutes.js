const express = require("express");
const { register, login, changePassword } = require("../controllers/authController");
const { adminAuth } = require("../middlewares/authMiddleware");
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { 
  registerValidation, 
  loginValidation, 
  changePasswordValidation,
  handleValidationErrors 
} = require('../middlewares/validationMiddleware');
const { body } = require('express-validator');

const router = express.Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.put("/change-password", adminAuth, changePasswordValidation, changePassword);

// Profile routes
router.get("/profile", adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(admin);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put("/profile", adminAuth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existingAdmin = await Admin.findOne({ email, _id: { $ne: req.user.id } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(admin);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put("/change-password", adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
