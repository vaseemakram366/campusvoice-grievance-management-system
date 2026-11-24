
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    const roleNames = {
        complainant: "Student / Complainant",
        officer: "Department Officer",
        admin: "Administrator"
    };

    return (
        <main className="dashboard-page">
            <header className="dashboard-header">
                <div className="brand">
                    <span className="brand-icon">CV</span>
                    <span>CampusVoice</span>
                </div>

                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </header>

            <section className="dashboard-content">
                <p className="dashboard-label">YOUR DASHBOARD</p>
                <h1>Welcome, {user.name}!</h1>
                <p className="auth-subtitle">
                    You are signed in as {roleNames[user.role] || user.role}.
                </p>

                <div className="dashboard-placeholder">
                    <h2>CampusVoice is ready</h2>
                    <p>
                        Your grievance management workspace will appear here.
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Dashboard;
