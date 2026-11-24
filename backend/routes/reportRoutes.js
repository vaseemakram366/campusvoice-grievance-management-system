
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getPendingReport,
    getResolutionReport
} = require("../controllers/reportController");

router.get(
    "/pending",
    protect,
    authorizeRoles("admin"),
    getPendingReport
);

router.get(
    "/resolution",
    protect,
    authorizeRoles("admin"),
    getResolutionReport
);

module.exports = router;
