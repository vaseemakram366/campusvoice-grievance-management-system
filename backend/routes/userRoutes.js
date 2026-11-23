
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getProfile,
    createOfficer
} = require("../controllers/userController");

// Protected: Any authenticated user
router.get("/profile", protect, getProfile);

// Admin only
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome, Admin!"
    });
});

// Admin creates department officers
router.post(
    "/officers",
    protect,
    authorizeRoles("admin"),
    createOfficer
);

module.exports = router;
