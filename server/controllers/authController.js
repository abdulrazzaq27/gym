const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER (only once for owner)
const register = async (req, res) => {
    try {
        const { name, email, password, gymName, gymCode } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) return res.status(400).json({ msg: "Admin already exists" });

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
        res.status(201).json({ msg: "Admin created successfully" });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message).join(', ');
            return res.status(400).json({ msg: `Admin validation failed: ${errors}` });
        }
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Duplicate value error: Email or Gym Code already in use' });
        }
        res.status(500).json({ msg: err.message });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET || "fallbacksecret",
            { expiresIn: "1d" }
        );


        res.json({ token, admin: { id: admin._id, name: admin.name, role: admin.role } });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.user.id; // From auth middleware

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: "New password must be at least 8 characters" });
        }

        // Find admin
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        admin.password = hashedPassword;
        await admin.save();

        res.json({ message: "Password changed successfully" });
    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { register, login, changePassword };