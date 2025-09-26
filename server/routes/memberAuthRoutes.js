const express = require("express");
const { requestOtp, verifyOtp, setPassword, loginWithPassword } = require("../controllers/memberAuthController");
const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/set-password", setPassword);
router.post("/login", loginWithPassword);

module.exports = router;
