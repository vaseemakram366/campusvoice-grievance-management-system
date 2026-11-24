
const Notification = require("../models/Notification");

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
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        notification.isRead = true;
        await notification.save();

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
