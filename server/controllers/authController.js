const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validatePassword } = require("../utils/passwordValidator");
const logger = require("../utils/logger");

// REGISTER (only once for owner)
const register = async (req, res) => {
    try {
        const { name, email, password, gymName, gymCode } = req.body;

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                msg: "Password does not meet requirements",
                errors: passwordValidation.errors 
            });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ msg: "Registration failed" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new Admin({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            gymName,
            gymCode
        });

        await admin.save();
        logger.info(`New admin registered: ${email}`);
        res.status(201).json({ msg: "Admin created successfully" });
    } catch (err) {
        logger.error('Registration error:', err);
        
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: 'Validation failed' });
        }
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Registration failed' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        logger.info(`Admin logged in: ${email}`);
        res.json({ token, admin: { id: admin._id, name: admin.name, role: admin.role } });
    } catch (err) {
        logger.error('Login error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.user.id; // From auth middleware

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ msg: "Current password and new password are required" });
        }

        // Validate new password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                msg: "New password does not meet requirements",
                errors: passwordValidation.errors 
            });
        }

        // Find admin
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Current password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        admin.password = hashedPassword;
        await admin.save();

        logger.info(`Password changed for admin: ${admin.email}`);
        res.json({ msg: "Password changed successfully" });
    } catch (err) {
        logger.error("Error changing password:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

module.exports = { register, login, changePassword };
