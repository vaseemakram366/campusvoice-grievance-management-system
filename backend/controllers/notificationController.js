
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// Get all notifications of logged-in user
const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user.id
        })
            .populate("grievance", "title status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        next(error);
    }
};


// Get unread notifications
const getUnreadNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user.id,
            isRead: false
        })
            .populate("grievance", "title status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        next(error);
    }
};


// Mark a notification as read
const markNotificationAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate notification ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID"
            });
        }

        // Update only the logged-in user's notification
        const notification = await Notification.findOneAndUpdate(
            {
                _id: id,
                recipient: req.user.id
            },
            {
                $set: { isRead: true }
            },
            {
                new: true,
                runValidators: true
            }
        ).populate("grievance", "title status");

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getNotifications,
    getUnreadNotifications,
    markNotificationAsRead
};
