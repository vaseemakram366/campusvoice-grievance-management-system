
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const NotificationCenter = () => {
    const { accessToken } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // Fetch notification history from the backend
    const fetchNotifications = async () => {
        try {
            const data = await apiRequest("/notifications");

            setNotifications(data.notifications || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Connect to Socket.IO and listen for real-time notifications
    useEffect(() => {
        if (!accessToken) return;

        fetchNotifications();

        const socket = io(SOCKET_URL, {
            auth: {
                token: accessToken
            }
        });

        socket.on("newNotification", (notification) => {
            setNotifications(previous => {
                // Prevent duplicate notifications
                if (previous.some(item => item._id === notification._id)) {
                    return previous;
                }

                return [notification, ...previous];
            });
        });

        socket.on("connect_error", (socketError) => {
            console.error("Notification connection failed:", socketError.message);
        });

        return () => {
            socket.disconnect();
        };
    }, [accessToken]);

    // Mark a notification as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            await apiRequest(`/notifications/${notificationId}/read`, {
                method: "PATCH"
            });

            setNotifications(previous =>
                previous.map(notification =>
                    notification._id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
        } catch (error) {
            setError(error.message);
        }
    };

    const unreadCount = notifications.filter(
        notification => !notification.isRead
    ).length;

    return (
        <div className="notification-center">

            <button
                type="button"
                className="notification-toggle"
                onClick={() => setIsOpen(previous => !previous)}
                aria-expanded={isOpen}
            >
                <span>Notifications</span>

                {unreadCount > 0 && (
                    <span className="notification-count">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <section className="notification-dropdown">
                    <div className="notification-heading">
                        <h3>Notifications</h3>
                        <span>{unreadCount} unread</span>
                    </div>

                    {error && (
                        <p className="notification-error">{error}</p>
                    )}

                    {loading ? (
                        <p className="notification-empty">Loading notifications...</p>
                    ) : notifications.length === 0 ? (
                        <p className="notification-empty">
                            You're all caught up. No notifications yet.
                        </p>
                    ) : (
                        <div className="notification-list">
                            {notifications.map(notification => (
                                <article
                                    key={notification._id}
                                    className={`notification-item ${
                                        notification.isRead ? "read" : "unread"
                                    }`}
                                >
                                    <p>{notification.message}</p>

                                    {notification.grievance?.title && (
                                        <small>
                                            {notification.grievance.title}
                                        </small>
                                    )}

                                    <div className="notification-footer">
                                        <small>
                                            {new Date(
                                                notification.createdAt
                                            ).toLocaleString()}
                                        </small>

                                        {!notification.isRead && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleMarkAsRead(notification._id)
                                                }
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default NotificationCenter;
