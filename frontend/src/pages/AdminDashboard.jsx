
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

// Convert API report responses into arrays before rendering
const normalizeReportResponse = (response) => {
    const report =
        response?.report ??
        response?.data ??
        response?.results ??
        response;

    if (Array.isArray(report)) {
        return report;
    }

    if (report && typeof report === "object") {
        if (Array.isArray(report.results)) {
            return report.results;
        }

        if (Array.isArray(report.data)) {
            return report.data;
        }

        if (
            Object.keys(report).some(
                key => key !== "success" && key !== "message"
            )
        ) {
            return [report];
        }
    }

    return [];
};

const AdminDashboard = () => {
    const [grievances, setGrievances] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [pendingReport, setPendingReport] = useState([]);
    const [resolutionReport, setResolutionReport] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [departmentForm, setDepartmentForm] = useState({
        name: "",
        description: "",
        categories: ""
    });

    const [officerForm, setOfficerForm] = useState({
        name: "",
        email: "",
        password: "",
        department: ""
    });

    const [creatingDepartment, setCreatingDepartment] = useState(false);
    const [creatingOfficer, setCreatingOfficer] = useState(false);

    // Fetch administrative dashboard data independently
    const fetchDashboardData = async () => {
        const endpoints = [
            apiRequest("/grievances"),
            apiRequest("/departments"),
            apiRequest("/reports/pending"),
            apiRequest("/reports/resolution")
        ];

        const results = await Promise.allSettled(endpoints);
        const errors = [];

        const [
            grievanceResult,
            departmentResult,
            pendingResult,
            resolutionResult
        ] = results;

        if (grievanceResult.status === "fulfilled") {
            setGrievances(
                Array.isArray(grievanceResult.value.grievances)
                    ? grievanceResult.value.grievances
                    : []
            );
        } else {
            setGrievances([]);
            errors.push("Unable to load grievances.");
        }

        if (departmentResult.status === "fulfilled") {
            setDepartments(
                Array.isArray(departmentResult.value.departments)
                    ? departmentResult.value.departments
                    : []
            );
        } else {
            setDepartments([]);
            errors.push("Unable to load departments.");
        }

        if (pendingResult.status === "fulfilled") {
            setPendingReport(
                normalizeReportResponse(pendingResult.value)
            );
        } else {
            setPendingReport([]);
            errors.push("Unable to load pending report.");
        }

        if (resolutionResult.status === "fulfilled") {
            setResolutionReport(
                normalizeReportResponse(resolutionResult.value)
            );
        } else {
            setResolutionReport([]);
            errors.push("Unable to load resolution report.");
        }

        setError(errors.join(" "));
        setLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Create a new department
    const handleDepartmentSubmit = async (event) => {
        event.preventDefault();

        if (creatingDepartment) return;

        setCreatingDepartment(true);
        setError("");
        setSuccess("");

        try {
            const categories = [
                ...new Set(
                    departmentForm.categories
                        .split(",")
                        .map(category => category.trim())
                        .filter(Boolean)
                )
            ];

            if (departmentForm.name.trim().length < 2) {
                throw new Error(
                    "Department name must contain at least 2 characters."
                );
            }

            if (categories.length === 0) {
                throw new Error("Enter at least one category.");
            }

            await apiRequest("/departments", {
                method: "POST",
                body: JSON.stringify({
                    name: departmentForm.name.trim(),
                    description: departmentForm.description.trim(),
                    categories
                })
            });

            setDepartmentForm({
                name: "",
                description: "",
                categories: ""
            });

            setSuccess("Department created successfully.");

            await fetchDashboardData();

        } catch (error) {
            setError(error.message || "Unable to create department.");
        } finally {
            setCreatingDepartment(false);
        }
    };

    // Create a department officer
    const handleOfficerSubmit = async (event) => {
        event.preventDefault();

        if (creatingOfficer) return;

        setCreatingOfficer(true);
        setError("");
        setSuccess("");

        try {
            if (!officerForm.department) {
                throw new Error("Please select a department.");
            }

            await apiRequest("/users/officers", {
                method: "POST",
                body: JSON.stringify({
                    ...officerForm,
                    name: officerForm.name.trim(),
                    email: officerForm.email.trim().toLowerCase()
                })
            });

            setOfficerForm({
                name: "",
                email: "",
                password: "",
                department: ""
            });

            setSuccess("Department officer created successfully.");

        } catch (error) {
            setError(error.message || "Unable to create officer.");
        } finally {
            setCreatingOfficer(false);
        }
    };

    // Format grievance status safely
    const formatStatus = (status) => {
        if (typeof status !== "string" || !status) {
            return "Unknown";
        }

        return status
            .replace(/-/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    // Calculate dashboard statistics
    const pendingCount = grievances.filter(
        grievance => !["resolved", "rejected"].includes(grievance.status)
    ).length;

    const resolvedCount = grievances.filter(
        grievance => grievance.status === "resolved"
    ).length;

    return (
        <div className="role-dashboard">

            {/* Dashboard heading */}
            <section className="welcome-section">
                <div>
                    <p className="dashboard-label">ADMINISTRATION PORTAL</p>
                    <h1>Admin Dashboard</h1>
                    <p>Manage campus grievances and departments.</p>
                </div>

                <span className="user-role">Administrator</span>
            </section>

            {/* Dashboard statistics */}
            <section className="stats-grid">
                <div className="stat-card">
                    <span>Total Grievances</span>
                    <h2>{grievances.length}</h2>
                </div>

                <div className="stat-card">
                    <span>Pending Grievances</span>
                    <h2>{pendingCount}</h2>
                </div>

                <div className="stat-card">
                    <span>Resolved Grievances</span>
                    <h2>{resolvedCount}</h2>
                </div>

                <div className="stat-card">
                    <span>Total Departments</span>
                    <h2>{departments.length}</h2>
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

            {/* Department and officer management */}
            <section className="admin-management-grid">

                {/* Create department */}
                <div className="panel">
                    <h2>Create Department</h2>

                    <p className="panel-description">
                        Add a department and its grievance categories.
                    </p>

                    <form
                        className="grievance-form"
                        onSubmit={handleDepartmentSubmit}
                    >
                        <label htmlFor="departmentName">
                            Department Name
                        </label>

                        <input
                            id="departmentName"
                            type="text"
                            value={departmentForm.name}
                            onChange={event =>
                                setDepartmentForm(previous => ({
                                    ...previous,
                                    name: event.target.value
                                }))
                            }
                            placeholder="e.g. Computer Science"
                            minLength={2}
                            maxLength={100}
                            required
                            disabled={creatingDepartment}
                        />

                        <label htmlFor="departmentDescription">
                            Description
                        </label>

                        <textarea
                            id="departmentDescription"
                            rows="3"
                            value={departmentForm.description}
                            onChange={event =>
                                setDepartmentForm(previous => ({
                                    ...previous,
                                    description: event.target.value
                                }))
                            }
                            placeholder="Department description"
                            maxLength={1000}
                            disabled={creatingDepartment}
                        />

                        <label htmlFor="categories">Categories</label>

                        <input
                            id="categories"
                            type="text"
                            value={departmentForm.categories}
                            onChange={event =>
                                setDepartmentForm(previous => ({
                                    ...previous,
                                    categories: event.target.value
                                }))
                            }
                            placeholder="Infrastructure, Academics, Network"
                            required
                            disabled={creatingDepartment}
                        />

                        <small className="form-hint">
                            Separate multiple categories with commas.
                        </small>

                        <button
                            type="submit"
                            disabled={creatingDepartment}
                        >
                            {creatingDepartment
                                ? "Creating..."
                                : "Create Department"}
                        </button>
                    </form>
                </div>

                {/* Create officer */}
                <div className="panel">
                    <h2>Create Department Officer</h2>

                    <p className="panel-description">
                        Create an officer account and assign a department.
                    </p>

                    <form
                        className="grievance-form"
                        onSubmit={handleOfficerSubmit}
                    >
                        <label htmlFor="officerName">
                            Officer Name
                        </label>

                        <input
                            id="officerName"
                            type="text"
                            value={officerForm.name}
                            onChange={event =>
                                setOfficerForm(previous => ({
                                    ...previous,
                                    name: event.target.value
                                }))
                            }
                            placeholder="Enter officer name"
                            minLength={2}
                            maxLength={100}
                            required
                            disabled={creatingOfficer}
                        />

                        <label htmlFor="officerEmail">
                            Email Address
                        </label>

                        <input
                            id="officerEmail"
                            type="email"
                            value={officerForm.email}
                            onChange={event =>
                                setOfficerForm(previous => ({
                                    ...previous,
                                    email: event.target.value
                                }))
                            }
                            placeholder="officer@example.com"
                            required
                            disabled={creatingOfficer}
                        />

                        <label htmlFor="officerPassword">
                            Password
                        </label>

                        <input
                            id="officerPassword"
                            type="password"
                            minLength={6}
                            value={officerForm.password}
                            onChange={event =>
                                setOfficerForm(previous => ({
                                    ...previous,
                                    password: event.target.value
                                }))
                            }
                            placeholder="Minimum 6 characters"
                            required
                            disabled={creatingOfficer}
                        />

                        <label htmlFor="officerDepartment">
                            Department
                        </label>

                        <select
                            id="officerDepartment"
                            value={officerForm.department}
                            onChange={event =>
                                setOfficerForm(previous => ({
                                    ...previous,
                                    department: event.target.value
                                }))
                            }
                            required
                            disabled={creatingOfficer}
                        >
                            <option value="">Select department</option>

                            {departments.map(department => (
                                <option
                                    key={department._id}
                                    value={department._id}
                                >
                                    {department.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            disabled={
                                creatingOfficer || departments.length === 0
                            }
                        >
                            {creatingOfficer
                                ? "Creating..."
                                : "Create Officer"}
                        </button>
                    </form>
                </div>
            </section>

            {/* Department directory */}
            <section className="panel admin-section">
                <h2>Departments</h2>

                {departments.length === 0 ? (
                    <p className="empty-state">
                        No departments available.
                    </p>
                ) : (
                    <div className="department-grid">
                        {departments.map(department => (
                            <div
                                className="department-card"
                                key={department._id}
                            >
                                <h3>{department.name}</h3>

                                <p>
                                    {department.description || "No description"}
                                </p>

                                <div className="category-tags">
                                    {(Array.isArray(department.categories)
                                        ? department.categories
                                        : []
                                    ).map((category, index) => (
                                        <span key={`${category}-${index}`}>
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* All grievances */}
            <section className="panel admin-section">
                <h2>All Grievances</h2>

                <p className="panel-description">
                    Monitor grievances submitted across campus.
                </p>

                {loading ? (
                    <p>Loading administrative data...</p>
                ) : grievances.length === 0 ? (
                    <p className="empty-state">
                        No grievances found.
                    </p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Complainant</th>
                                    <th>Department</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {grievances.map(grievance => (
                                    <tr key={grievance._id}>
                                        <td>{grievance.title}</td>

                                        <td>
                                            {grievance.complainant?.name || "Unknown"}
                                        </td>

                                        <td>
                                            {grievance.department?.name || "Unassigned"}
                                        </td>

                                        <td>
                                            {grievance.priority || "Not specified"}
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${
                                                    grievance.status || "unknown"
                                                }`}
                                            >
                                                {formatStatus(grievance.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Administrative reports */}
            <section className="admin-management-grid admin-section">

                {/* Pending grievance report */}
                <div className="panel">
                    <h2>Pending Grievance Report</h2>

                    <p className="panel-description">
                        Pending grievances grouped by department.
                    </p>

                    {pendingReport.length === 0 ? (
                        <p className="empty-state">
                            No pending report data available.
                        </p>
                    ) : (
                        pendingReport.map((item, index) => (
                            <div
                                className="report-row"
                                key={item._id || index}
                            >
                                <span>
                                    {item.departmentName ||
                                        item.department?.name ||
                                        (typeof item.department === "string"
                                            ? item.department
                                            : null) ||
                                        "Department"}
                                </span>

                                <strong>
                                    {item.pendingCount ??
                                        item.count ??
                                        0}
                                </strong>
                            </div>
                        ))
                    )}
                </div>

                {/* Resolution report */}
                <div className="panel">
                    <h2>Resolution Report</h2>

                    <p className="panel-description">
                        Average grievance resolution time.
                    </p>

                    {resolutionReport.length === 0 ? (
                        <p className="empty-state">
                            No resolution report data available.
                        </p>
                    ) : (
                        resolutionReport.map((item, index) => (
                            <div
                                className="report-row"
                                key={item._id || index}
                            >
                                <span>
                                    {item.departmentName ||
                                        item.department?.name ||
                                        (typeof item.department === "string"
                                            ? item.department
                                            : null) ||
                                        "Overall"}
                                </span>

                                <strong>
                                    {item.averageResolutionHours ??
                                        item.averageResolutionTime ??
                                        item.avgResolutionHours ??
                                        item.averageResolutionTimeHours ??
                                        "—"} hours
                                </strong>
                            </div>
                        ))
                    )}
                </div>

            </section>
        </div>
    );
};

export default AdminDashboard;
