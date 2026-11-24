
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createGrievance,
    getGrievances,
    updateGrievanceStatus
} = require("../controllers/grievanceController");

// Submit grievance - authenticated users
router.post("/", protect, createGrievance);

// Get grievances - role-based access
router.get("/", protect, getGrievances);

// Update grievance - officers and admins only
router.patch(
    "/:id/status",
    protect,
    authorizeRoles("officer", "admin"),
    updateGrievanceStatus
);

module.exports = router;
