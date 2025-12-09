// server/routes/qrRoutes.js
const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { adminAuth } = require('../middlewares/authMiddleware');
const { memberAuth } = require('../middlewares/authMiddleware');

// Admin routes
router.post('/generate', adminAuth, qrController.generateQRCode);
router.post('/member-scan', adminAuth, qrController.scanMemberQR);

// Member routes
router.post('/scan-gym', memberAuth, qrController.scanGymQR);
router.get('/member-code', memberAuth, qrController.getMemberQRCode);

module.exports = router;