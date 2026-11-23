
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getProfile } = require("../controllers/userController");

// Protected route: any authenticated user
router.get("/profile", protect, getProfile);

// RBAC route: admin only
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome, Admin!"
    });
});

module.exports = router;
