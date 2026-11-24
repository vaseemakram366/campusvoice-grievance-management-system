
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ComplainantDashboard = () => {
    const { user } = useAuth();

    const [grievances, setGrievances] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        priority: "medium"
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch grievances and departments from backend
    const fetchDashboardData = async () => {
        try {
            setError("");

            const [grievanceData, departmentData] = await Promise.all([
                apiRequest("/grievances"),
                apiRequest("/departments")
            ]);

            setGrievances(grievanceData.grievances || []);
            setDepartments(departmentData.departments || []);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Handle controlled form inputs
    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    // Submit a new grievance
    const handleSubmit = async (event) => {
        event.preventDefault();

        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            await apiRequest("/grievances", {
                method: "POST",
                body: JSON.stringify(formData)
            });

            setSuccess("Your grievance has been submitted successfully.");

            setFormData({
                title: "",
                description: "",
                category: "",
                priority: "medium"
            });

            await fetchDashboardData();

        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Format status labels for display
    const formatStatus = (status) => {
        return status
            .replace("-", " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    return (
        <div className="complainant-dashboard">

            <section className="welcome-section">
                <div>
                    <p className="dashboard-label">STUDENT PORTAL</p>
                    <h1>Welcome, {user.name}</h1>
                    <p>Submit grievances and keep track of their progress.</p>
                </div>

                <div className="user-role">
                    Complainant
                </div>
            </section>

            <section className="stats-grid">
                <div className="stat-card">
                    <span>Total Grievances</span>
                    <h2>{grievances.length}</h2>
                </div>

                <div className="stat-card">
                    <span>Pending</span>
                    <h2>
                        {grievances.filter(g =>
                            !["resolved", "rejected"].includes(g.status)
                        ).length}
                    </h2>
                </div>

                <div className="stat-card">
                    <span>Resolved</span>
                    <h2>
                        {grievances.filter(g =>
                            g.status === "resolved"
                        ).length}
                    </h2>
                </div>
            </section>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <section className="dashboard-grid">

                {/* Grievance submission form */}
                <div className="panel">
                    <h2>Submit a Grievance</h2>
                    <p className="panel-description">
                        Describe your issue so the concerned department can address it.
                    </p>

                    <form onSubmit={handleSubmit} className="grievance-form">

                        <label htmlFor="title">Grievance Title</label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            placeholder="Enter grievance title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Describe your issue in detail"
                            rows="5"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select category</option>

                            {departments.flatMap(department =>
                                department.categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))
                            )}
                        </select>

                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>

                        <button type="submit" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit Grievance"}
                        </button>
                    </form>
                </div>

                {/* Grievance history */}
                <div className="panel">
                    <h2>My Grievances</h2>
                    <p className="panel-description">
                        Track the current status of your submitted issues.
                    </p>

                    {loading ? (
                        <p>Loading grievances...</p>
                    ) : grievances.length === 0 ? (
                        <div className="empty-state">
                            <h3>No grievances yet</h3>
                            <p>Your submitted grievances will appear here.</p>
                        </div>
                    ) : (
                        <div className="grievance-list">
                            {grievances.map(grievance => (
                                <article
                                    className="grievance-item"
                                    key={grievance._id}
                                >
                                    <div className="grievance-item-header">
                                        <h3>{grievance.title}</h3>

                                        <span className={`status-badge ${grievance.status}`}>
                                            {formatStatus(grievance.status)}
                                        </span>
                                    </div>

                                    <p>{grievance.description}</p>

                                    <div className="grievance-meta">
                                        <span>
                                            Category: {grievance.category}
                                        </span>
                                        <span>
                                            Priority: {grievance.priority}
                                        </span>
                                        <span>
                                            Department: {grievance.department?.name || "Unassigned"}
                                        </span>
                                        <span>
                                            Officer: {grievance.assignedOfficer?.name || "Awaiting assignment"}
                                        </span>
                                    </div>

                                    <small>
                                        Submitted: {new Date(
                                            grievance.createdAt
                                        ).toLocaleDateString()}
                                    </small>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

            </section>
        </div>
    );
};

export default ComplainantDashboard;
