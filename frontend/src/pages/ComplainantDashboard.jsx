
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

            setGrievances(
                Array.isArray(grievanceData.grievances)
                    ? grievanceData.grievances
                    : []
            );

            setDepartments(
                Array.isArray(departmentData.departments)
                    ? departmentData.departments
                    : []
            );

        } catch (error) {
            setError(error.message || "Unable to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Handle controlled form inputs
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    // Submit a new grievance
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submitting) return;

        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            await apiRequest("/grievances", {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    category: formData.category.trim()
                })
            });

            setSuccess(
                "Your grievance has been submitted successfully."
            );

            setFormData({
                title: "",
                description: "",
                category: "",
                priority: "medium"
            });

            await fetchDashboardData();

        } catch (error) {
            setError(error.message || "Unable to submit grievance.");
        } finally {
            setSubmitting(false);
        }
    };

    // Format status labels safely
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
            : parsedDate.toLocaleDateString();
    };

    // Safely prepare department categories
    const categories = departments.flatMap(department =>
        Array.isArray(department.categories)
            ? department.categories
            : []
    );

    return (
        <div className="complainant-dashboard">

            <section className="welcome-section">
                <div>
                    <p className="dashboard-label">STUDENT PORTAL</p>

                    <h1>
                        Welcome, {user?.name || "Student"}
                    </h1>

                    <p>
                        Submit grievances and keep track of their progress.
                    </p>
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
                        {grievances.filter(grievance =>
                            !["resolved", "rejected"].includes(
                                grievance.status
                            )
                        ).length}
                    </h2>
                </div>

                <div className="stat-card">
                    <span>Resolved</span>
                    <h2>
                        {grievances.filter(
                            grievance => grievance.status === "resolved"
                        ).length}
                    </h2>
                </div>
            </section>

            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <div className="success-message" role="status">
                    {success}
                </div>
            )}

            <section className="dashboard-grid">

                {/* Grievance submission form */}
                <div className="panel">
                    <h2>Submit a Grievance</h2>

                    <p className="panel-description">
                        Describe your issue so the concerned department can address it.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="grievance-form"
                    >

                        <label htmlFor="title">
                            Grievance Title
                        </label>

                        <input
                            id="title"
                            type="text"
                            name="title"
                            placeholder="Enter grievance title"
                            value={formData.title}
                            onChange={handleChange}
                            minLength={5}
                            maxLength={150}
                            required
                            disabled={submitting}
                        />

                        <label htmlFor="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            placeholder="Describe your issue in detail"
                            rows="5"
                            value={formData.description}
                            onChange={handleChange}
                            minLength={10}
                            maxLength={5000}
                            required
                            disabled={submitting}
                        />

                        <label htmlFor="category">
                            Category
                        </label>

                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={submitting}
                        >
                            <option value="">
                                Select category
                            </option>

                            {categories.map((category, index) => (
                                <option
                                    key={`${category}-${index}`}
                                    value={category}
                                >
                                    {category}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="priority">
                            Priority
                        </label>

                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            disabled={submitting}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>

                        <button
                            type="submit"
                            disabled={submitting || categories.length === 0}
                        >
                            {submitting
                                ? "Submitting..."
                                : "Submit Grievance"}
                        </button>

                        {categories.length === 0 && (
                            <p className="panel-description">
                                No grievance categories are currently available.
                            </p>
                        )}

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
                            <p>
                                Your submitted grievances will appear here.
                            </p>
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

                                        <span
                                            className={`status-badge ${
                                                grievance.status || "unknown"
                                            }`}
                                        >
                                            {formatStatus(grievance.status)}
                                        </span>
                                    </div>

                                    <p>{grievance.description}</p>

                                    <div className="grievance-meta">
                                        <span>
                                            Category: {grievance.category || "Not specified"}
                                        </span>

                                        <span>
                                            Priority: {grievance.priority || "Not specified"}
                                        </span>

                                        <span>
                                            Department: {grievance.department?.name || "Unassigned"}
                                        </span>

                                        <span>
                                            Officer: {grievance.assignedOfficer?.name || "Awaiting assignment"}
                                        </span>
                                    </div>

                                    <small>
                                        Submitted: {formatDate(grievance.createdAt)}
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
