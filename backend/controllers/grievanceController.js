
const Grievance = require("../models/Grievance");
const Department = require("../models/Department");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { getIO } = require("../sockets/socket");

// Submit a new grievance
const createGrievance = async (req, res, next) => {
    try {
        const { title, description, category, priority } = req.body;

        // Validate required fields
        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                message: "Title, description and category are required"
            });
        }

        // Find department based on grievance category
        const department = await Department.findOne({
            categories: category
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "No department found for this category"
            });
        }

        // Automatically find an officer in the department
        const officer = await User.findOne({
            role: "officer",
            department: department._id
        });

        // Set initial status based on officer availability
        const initialStatus = officer ? "assigned" : "submitted";

        // Create grievance and maintain initial status history
        const grievance = await Grievance.create({
            title,
            description,
            category,
            priority: priority || "medium",
            status: initialStatus,
            complainant: req.user.id,
            department: department._id,
            assignedOfficer: officer ? officer._id : null,
            statusHistory: [{
                status: initialStatus,
                remark: officer
                    ? "Automatically assigned to department officer"
                    : "Awaiting officer assignment",
                updatedBy: req.user.id
            }]
        });

        // Populate related user and department information
        const result = await Grievance.findById(grievance._id)
            .populate("department", "name")
            .populate("assignedOfficer", "name email")
            .populate("complainant", "name email");

        res.status(201).json({
            success: true,
            message: "Grievance submitted successfully",
            grievance: result
        });

    } catch (error) {
        next(error);
    }
};


// Get grievances according to logged-in user's role
const getGrievances = async (req, res, next) => {
    try {
        // Build query according to user role
        let filter = {};

        if (req.user.role === "complainant") {
            filter.complainant = req.user.id;
        } else if (req.user.role === "officer") {
            filter.assignedOfficer = req.user.id;
        }

        // Admin can view all grievances
        const grievances = await Grievance.find(filter)
            .populate("complainant", "name email")
            .populate("assignedOfficer", "name email")
            .populate("department", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: grievances.length,
            grievances
        });

    } catch (error) {
        next(error);
    }
};


// Officer/Admin updates grievance status
const updateGrievanceStatus = async (req, res, next) => {
    try {
        const { status, remark } = req.body;

        // Define permitted grievance statuses
        const allowedStatuses = [
            "assigned",
            "in-progress",
            "resolved",
            "rejected"
        ];

        // Validate requested status
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid grievance status"
            });
        }

        // Find grievance using its ID
        const grievance = await Grievance.findById(req.params.id);

        if (!grievance) {
            return res.status(404).json({
                success: false,
                message: "Grievance not found"
            });
        }

        // Check whether the logged-in user is the assigned officer or admin
        const isAssignedOfficer =
            grievance.assignedOfficer?.toString() === req.user.id;

        if (req.user.role !== "admin" && !isAssignedOfficer) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this grievance"
            });
        }

        // Update current grievance status
        grievance.status = status;

        // Add new entry to status history
        grievance.statusHistory.push({
            status,
            remark: remark || "",
            updatedBy: req.user.id,
            updatedAt: new Date()
        });

        await grievance.save();

        // Create notification for the complainant
        const notification = await Notification.create({
            recipient: grievance.complainant,
            grievance: grievance._id,
            message: `Your grievance "${grievance.title}" is now ${status}.`
        });

        // Send real-time notification through Socket.IO
        getIO()
            .to(`user:${grievance.complainant.toString()}`)
            .emit("newNotification", {
                _id: notification._id,
                message: notification.message,
                grievanceId: grievance._id,
                status,
                createdAt: notification.createdAt
            });

        // Populate updated grievance details
        const result = await Grievance.findById(grievance._id)
            .populate("complainant", "name email")
            .populate("assignedOfficer", "name email")
            .populate("department", "name");

        res.status(200).json({
            success: true,
            message: "Grievance status updated successfully",
            grievance: result
        });

    } catch (error) {
        next(error);
    }
};


// Export grievance controller functions
module.exports = {
    createGrievance,
    getGrievances,
    updateGrievanceStatus
};
