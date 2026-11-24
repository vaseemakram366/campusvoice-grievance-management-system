
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import "./App.css";

// Redirect authenticated users away from authentication pages
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated
        ? <Navigate to="/dashboard" replace />
        : children;
};

// Configure application routes
const AppRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
            />

            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />

            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
