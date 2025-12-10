const express = require("express");
const { requestOtp, verifyOtp, setPassword, loginWithPassword } = require("../controllers/memberAuthController");
const { body } = require('express-validator');
const { handleValidationErrors, loginValidation } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post("/request-otp", [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidationErrors
], requestOtp);

router.post("/verify-otp", [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').notEmpty().withMessage('OTP is required'),
  handleValidationErrors
], verifyOtp);

router.post("/set-password", [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  handleValidationErrors
], setPassword);

router.post("/login", loginValidation, loginWithPassword);

module.exports = router;