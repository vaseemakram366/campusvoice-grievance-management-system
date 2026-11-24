
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const {
    register,
    login,
    refreshAccessToken,
    logout
} = require("../controllers/authController");

// Limit repeated authentication requests
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again after 15 minutes."
    }
});

// Register a new user
router.post("/register", authLimiter, register);

// Login existing user
router.post("/login", authLimiter, login);

// Generate new access and refresh tokens
router.post("/refresh", authLimiter, refreshAccessToken);

// Logout and revoke refresh token
router.post("/logout", logout);

module.exports = router;
