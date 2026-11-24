
import { useAuth } from "../context/AuthContext";

import ComplainantDashboard from "./ComplainantDashboard";
import OfficerDashboard from "./OfficerDashboard";
import AdminDashboard from "./AdminDashboard";

const Dashboard = () => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error.message);
        }
    };

    return (
        <main className="dashboard-page">

            {/* Application header */}
            <header className="dashboard-header">
                <div className="brand">
                    <span className="brand-icon">CV</span>
                    <span>CampusVoice</span>
                </div>

                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </header>

            {/* Render dashboard according to authenticated user role */}
            {user.role === "complainant" && <ComplainantDashboard />}

            {user.role === "officer" && <OfficerDashboard />}

            {user.role === "admin" && <AdminDashboard />}

        </main>
    );
};

export default Dashboard;
