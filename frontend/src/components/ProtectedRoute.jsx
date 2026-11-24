
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Restrict access to authenticated users and permitted roles
const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
