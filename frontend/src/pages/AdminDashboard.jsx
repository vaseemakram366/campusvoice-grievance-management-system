
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

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

    // Fetch administrative dashboard data
    const fetchDashboardData = async () => {
        try {
            setError("");

            const [
                grievanceData,
                departmentData,
                pendingData,
                resolutionData
            ] = await Promise.all([
                apiRequest("/grievances"),
                apiRequest("/departments"),
                apiRequest("/reports/pending"),
                apiRequest("/reports/resolution")
            ]);

            setGrievances(grievanceData.grievances || []);
            setDepartments(departmentData.departments || []);
            setPendingReport(pendingData.report || pendingData.data || []);
            setResolutionReport(
                resolutionData.report || resolutionData.data || []
            );

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Create a new department
    const handleDepartmentSubmit = async (event) => {
        event.preventDefault();

        setCreatingDepartment(true);
        setError("");
        setSuccess("");

        try {
            const categories = departmentForm.categories
                .split(",")
                .map(category => category.trim())
                .filter(Boolean);

            if (categories.length === 0) {
                throw new Error("Enter at least one category");
            }

            await apiRequest("/departments", {
                method: "POST",
                body: JSON.stringify({
                    name: departmentForm.name,
                    description: departmentForm.description,
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
            setError(error.message);
        } finally {
            setCreatingDepartment(false);
        }
    };

    // Create a department officer
    const handleOfficerSubmit = async (event) => {
        event.preventDefault();

        setCreatingOfficer(true);
        setError("");
        setSuccess("");

        try {
            await apiRequest("/users/officers", {
                method: "POST",
                body: JSON.stringify(officerForm)
            });

            setOfficerForm({
                name: "",
                email: "",
                password: "",
                department: ""
            });

            setSuccess("Department officer created successfully.");

        } catch (error) {
            setError(error.message);
        } finally {
            setCreatingOfficer(false);
        }
    };

    const formatStatus = (status) => {
        return status
            .replace("-", " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    };

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

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Department and officer management */}
            <section className="admin-management-grid">

                <div className="panel">
                    <h2>Create Department</h2>
                    <p className="panel-description">
                        Add a department and its grievance categories.
                    </p>

                    <form
                        className="grievance-form"
                        onSubmit={handleDepartmentSubmit}
                    >
                        <label htmlFor="departmentName">Department Name</label>
                        <input
                            id="departmentName"
                            type="text"
                            value={departmentForm.name}
                            onChange={event => setDepartmentForm({
                                ...departmentForm,
                                name: event.target.value
                            })}
                            placeholder="e.g. Computer Science"
                            required
                        />

                        <label htmlFor="departmentDescription">Description</label>
                        <textarea
                            id="departmentDescription"
                            rows="3"
                            value={departmentForm.description}
                            onChange={event => setDepartmentForm({
                                ...departmentForm,
                                description: event.target.value
                            })}
                            placeholder="Department description"
                        />

                        <label htmlFor="categories">Categories</label>
                        <input
                            id="categories"
                            type="text"
                            value={departmentForm.categories}
                            onChange={event => setDepartmentForm({
                                ...departmentForm,
                                categories: event.target.value
                            })}
                            placeholder="Infrastructure, Academics, Network"
                            required
                        />

                        <small className="form-hint">
                            Separate multiple categories with commas.
                        </small>

                        <button type="submit" disabled={creatingDepartment}>
                            {creatingDepartment ? "Creating..." : "Create Department"}
                        </button>
                    </form>
                </div>

                <div className="panel">
                    <h2>Create Department Officer</h2>
                    <p className="panel-description">
                        Create an officer account and assign a department.
                    </p>

                    <form
                        className="grievance-form"
                        onSubmit={handleOfficerSubmit}
                    >
                        <label htmlFor="officerName">Officer Name</label>
                        <input
                            id="officerName"
                            type="text"
                            value={officerForm.name}
                            onChange={event => setOfficerForm({
                                ...officerForm,
                                name: event.target.value
                            })}
                            placeholder="Enter officer name"
                            required
                        />

                        <label htmlFor="officerEmail">Email Address</label>
                        <input
                            id="officerEmail"
                            type="email"
                            value={officerForm.email}
                            onChange={event => setOfficerForm({
                                ...officerForm,
                                email: event.target.value
                            })}
                            placeholder="officer@example.com"
                            required
                        />

                        <label htmlFor="officerPassword">Password</label>
                        <input
                            id="officerPassword"
                            type="password"
                            minLength={6}
                            value={officerForm.password}
                            onChange={event => setOfficerForm({
                                ...officerForm,
                                password: event.target.value
                            })}
                            placeholder="Minimum 6 characters"
                            required
                        />

                        <label htmlFor="officerDepartment">Department</label>
                        <select
                            id="officerDepartment"
                            value={officerForm.department}
                            onChange={event => setOfficerForm({
                                ...officerForm,
                                department: event.target.value
                            })}
                            required
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

                        <button type="submit" disabled={creatingOfficer}>
                            {creatingOfficer ? "Creating..." : "Create Officer"}
                        </button>
                    </form>
                </div>
            </section>

            {/* Department directory */}
            <section className="panel admin-section">
                <h2>Departments</h2>

                {departments.length === 0 ? (
                    <p className="empty-state">No departments available.</p>
                ) : (
                    <div className="department-grid">
                        {departments.map(department => (
                            <div className="department-card" key={department._id}>
                                <h3>{department.name}</h3>
                                <p>{department.description || "No description"}</p>

                                <div className="category-tags">
                                    {department.categories.map(category => (
                                        <span key={category}>{category}</span>
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
                    <p className="empty-state">No grievances found.</p>
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
                                        <td>{grievance.complainant?.name || "Unknown"}</td>
                                        <td>{grievance.department?.name || "Unassigned"}</td>
                                        <td>{grievance.priority}</td>
                                        <td>
                                            <span className={`status-badge ${grievance.status}`}>
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

            {/* Reports */}
            <section className="admin-management-grid admin-section">

                <div className="panel">
                    <h2>Pending Grievance Report</h2>
                    <p className="panel-description">
                        Pending grievances grouped by department.
                    </p>

                    {pendingReport.length === 0 ? (
                        <p className="empty-state">No pending report data available.</p>
                    ) : (
                        pendingReport.map((item, index) => (
                            <div className="report-row" key={item._id || index}>
                                <span>{item.departmentName || item.department}</span>
                                <strong>{item.pendingCount ?? item.count ?? 0}</strong>
                            </div>
                        ))
                    )}
                </div>

                <div className="panel">
                    <h2>Resolution Report</h2>
                    <p className="panel-description">
                        Average grievance resolution time.
                    </p>

                    {resolutionReport.length === 0 ? (
                        <p className="empty-state">No resolution report data available.</p>
                    ) : (
                        resolutionReport.map((item, index) => (
                            <div className="report-row" key={item._id || index}>
                                <span>{item.departmentName || item.department || "Overall"}</span>
                                <strong>
                                    {item.averageResolutionHours ??
                                        item.averageResolutionTime ??
                                        item.avgResolutionHours ??
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
