
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getNotifications,
    getUnreadNotifications,
    markNotificationAsRead
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);
router.get("/unread", protect, getUnreadNotifications);
router.patch("/:id/read", protect, markNotificationAsRead);

module.exports = router;
