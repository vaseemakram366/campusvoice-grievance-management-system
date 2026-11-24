
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const NotificationBell = () => {
    const { accessToken } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");

    // Fetch existing notifications and connect to Socket.IO
    useEffect(() => {
        if (!accessToken) return;

        let socket;

        const initializeNotifications = async () => {
            try {
                const data = await apiRequest("/notifications");

                setNotifications(data.notifications || []);
            } catch (error) {
                setError(error.message);
            }
        };

        initializeNotifications();

        // Establish authenticated Socket.IO connection
        socket = io(SOCKET_URL, {
            auth: {
                token: accessToken
            }
        });

        // Listen for new real-time notifications
        socket.on("newNotification", (notification) => {
            setNotifications(previous => [
                notification,
                ...previous
            ]);
        });

        socket.on("connect_error", (error) => {
            console.error("Notification connection failed:", error.message);
        });

        return () => {
            socket?.disconnect();
        };
    }, [accessToken]);

    // Mark a notification as read
    const markAsRead = async (notificationId) => {
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
        <div className="notification-container">

            <button
                className="notification-button"
                onClick={() => setIsOpen(previous => !previous)}
                aria-label="Toggle notifications"
            >
                <span className="notification-icon">♢</span>

                {unreadCount > 0 && (
                    <span className="notification-count">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-panel">
                    <div className="notification-heading">
                        <h3>Notifications</h3>
                        <span>{unreadCount} unread</span>
                    </div>

                    {error && (
                        <p className="notification-error">{error}</p>
                    )}

                    {notifications.length === 0 ? (
                        <div className="notification-empty">
                            <p>No notifications yet.</p>
                        </div>
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

                                    <small>
                                        {new Date(
                                            notification.createdAt
                                        ).toLocaleString()}
                                    </small>

                                    {!notification.isRead && (
                                        <button
                                            className="mark-read-button"
                                            onClick={() =>
                                                markAsRead(notification._id)
                                            }
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
