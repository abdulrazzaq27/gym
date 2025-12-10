// server/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // For admin routes
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Member authentication middleware
const memberAuth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.member = decoded; // For member routes
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = { adminAuth, memberAuth };