const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER (only once for owner)
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) return res.status(400).json({ msg: "Admin already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new Admin({
            name,
            email,
            password: hashedPassword,
            role: "admin"
        });

        await admin.save();
        res.status(201).json({ msg: "Admin created successfully" });
    } catch (err) {
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

module.exports = { register, login };
