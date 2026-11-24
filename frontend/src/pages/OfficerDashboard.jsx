
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const OfficerDashboard = () => {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [remarks, setRemarks] = useState({});

    // Format grievance status safely
    const formatStatus = (status) => {
        if (typeof status !== "string" || !status) {
            return "Unknown";
        }

        return status
            .replace(/-/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    // Format dates safely
    const formatDate = (date) => {
        if (!date) return "Not available";

        const parsedDate = new Date(date);

        return Number.isNaN(parsedDate.getTime())
            ? "Not available"
            : parsedDate.toLocaleString();
    };

    // Fetch grievances assigned to the logged-in officer
    const fetchGrievances = async () => {
        try {
            setError("");

            const data = await apiRequest("/grievances");

            setGrievances(
                Array.isArray(data.grievances)
                    ? data.grievances
                    : []
            );
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrievances();
    }, []);

    // Update grievance status and add an officer remark
    const handleStatusUpdate = async (grievanceId, status) => {
        setUpdatingId(grievanceId);
        setError("");

        try {
            await apiRequest(`/grievances/${grievanceId}/status`, {
                method: "PATCH",
                body: JSON.stringify({
                    status,
                    remark: remarks[grievanceId] || ""
                })
            });

            setRemarks(previous => ({
                ...previous,
                [grievanceId]: ""
            }));

            await fetchGrievances();
        } catch (error) {
            setError(error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const pendingCount = grievances.filter(
        grievance =>
            !["resolved", "rejected"].includes(grievance.status)
    ).length;

    const resolvedCount = grievances.filter(
        grievance => grievance.status === "resolved"
    ).length;

    return (
        <div className="role-dashboard">

            <section className="welcome-section">
                <div>
                    <p className="dashboard-label">OFFICER PORTAL</p>
                    <h1>Grievance Management</h1>
                    <p>Review and manage your assigned grievances.</p>
                </div>

                <span className="user-role">Department Officer</span>
            </section>

            <section className="stats-grid">
                <div className="stat-card">
                    <span>Total Assigned</span>
                    <h2>{grievances.length}</h2>
                </div>

                <div className="stat-card">
                    <span>Pending</span>
                    <h2>{pendingCount}</h2>
                </div>

                <div className="stat-card">
                    <span>Resolved</span>
                    <h2>{resolvedCount}</h2>
                </div>
            </section>

            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}

            <section className="panel">
                <h2>Assigned Grievances</h2>

                <p className="panel-description">
                    Review each issue and update its progress.
                </p>

                {loading ? (
                    <p>Loading assigned grievances...</p>
                ) : grievances.length === 0 ? (
                    <div className="empty-state">
                        <h3>No assigned grievances</h3>
                        <p>New assignments will appear here.</p>
                    </div>
                ) : (
                    <div className="officer-grievance-list">
                        {grievances.map(grievance => {
                            const isCompleted = [
                                "resolved",
                                "rejected"
                            ].includes(grievance.status);

                            const isUpdating =
                                updatingId === grievance._id;

                            return (
                                <article
                                    className="officer-grievance-card"
                                    key={grievance._id}
                                >
                                    <div className="grievance-item-header">
                                        <div>
                                            <h3>{grievance.title}</h3>

                                            <p className="officer-category">
                                                {grievance.category}
                                                {" · "}
                                                {grievance.department?.name || "Department unavailable"}
                                            </p>
                                        </div>

                                        <span
                                            className={`status-badge ${grievance.status || "unknown"}`}
                                        >
                                            {formatStatus(grievance.status)}
                                        </span>
                                    </div>

                                    <p className="officer-description">
                                        {grievance.description}
                                    </p>

                                    <div className="grievance-meta">
                                        <span>
                                            Complainant:{" "}
                                            {grievance.complainant?.name || "Unknown"}
                                        </span>

                                        <span>
                                            Priority: {grievance.priority || "Not specified"}
                                        </span>

                                        <span>
                                            Submitted:{" "}
                                            {formatDate(grievance.createdAt)}
                                        </span>
                                    </div>

                                    {grievance.statusHistory?.length > 0 && (
                                        <div className="status-history">
                                            <h4>Status History</h4>

                                            {grievance.statusHistory.map(
                                                (entry, index) => (
                                                    <div
                                                        key={entry._id || index}
                                                        className="history-entry"
                                                    >
                                                        <strong>
                                                            {formatStatus(entry.status)}
                                                        </strong>

                                                        {entry.remark && (
                                                            <p>{entry.remark}</p>
                                                        )}

                                                        <small>
                                                            {formatDate(entry.updatedAt)}
                                                        </small>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    {!isCompleted && (
                                        <div className="officer-update">
                                            <label htmlFor={`remark-${grievance._id}`}>
                                                Add Remark
                                            </label>

                                            <textarea
                                                id={`remark-${grievance._id}`}
                                                rows="3"
                                                placeholder="Write an update for the complainant..."
                                                value={remarks[grievance._id] || ""}
                                                onChange={event =>
                                                    setRemarks(previous => ({
                                                        ...previous,
                                                        [grievance._id]: event.target.value
                                                    }))
                                                }
                                                disabled={isUpdating}
                                            />

                                            <div className="officer-actions">
                                                {grievance.status !== "in-progress" && (
                                                    <button
                                                        className="secondary-action"
                                                        disabled={isUpdating}
                                                        onClick={() =>
                                                            handleStatusUpdate(
                                                                grievance._id,
                                                                "in-progress"
                                                            )
                                                        }
                                                    >
                                                        {isUpdating
                                                            ? "Updating..."
                                                            : "Start Progress"}
                                                    </button>
                                                )}

                                                <button
                                                    className="success-action"
                                                    disabled={isUpdating}
                                                    onClick={() =>
                                                        handleStatusUpdate(
                                                            grievance._id,
                                                            "resolved"
                                                        )
                                                    }
                                                >
                                                    {isUpdating
                                                        ? "Updating..."
                                                        : "Mark Resolved"}
                                                </button>

                                                <button
                                                    className="danger-action"
                                                    disabled={isUpdating}
                                                    onClick={() =>
                                                        handleStatusUpdate(
                                                            grievance._id,
                                                            "rejected"
                                                        )
                                                    }
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default OfficerDashboard;
