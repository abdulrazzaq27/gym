// server/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // "Bearer token"
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token (you might want to add role checking)
    if (!decoded.id) {
      return res.status(401).json({ msg: "Invalid token format" });
    }
    
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
    
    // Check if it's a member token (you might want to add role checking)
    if (!decoded.id) {
      return res.status(401).json({ msg: "Invalid token format" });
    }
    
    req.member = decoded; // For member routes - different from admin
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Export both middlewares
module.exports = { adminAuth, memberAuth };

// Also export the default adminAuth for backward compatibility
module.exports.default = adminAuth;