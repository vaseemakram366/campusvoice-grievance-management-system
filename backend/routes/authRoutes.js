
const express = require("express");
const router = express.Router();

const {
    register,
    login,
    refreshAccessToken,
    logout
} = require("../controllers/authController");

// Register a new user
router.post("/register", register);

// Login existing user
router.post("/login", login);

// Generate new access and refresh tokens
router.post("/refresh", refreshAccessToken);

// Logout and revoke refresh token
router.post("/logout", logout);

module.exports = router;
