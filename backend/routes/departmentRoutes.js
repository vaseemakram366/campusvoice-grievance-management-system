
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createDepartment,
    getDepartments,
    getDepartmentById
} = require("../controllers/departmentController");

// Public: Get all departments
router.get("/", getDepartments);

// Public: Get department by ID
router.get("/:id", getDepartmentById);

// Admin only: Create department
router.post("/", protect, authorizeRoles("admin"), createDepartment);

module.exports = router;
