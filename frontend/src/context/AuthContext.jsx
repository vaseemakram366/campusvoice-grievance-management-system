
import { createContext, useContext, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

// Provide authentication state to the application
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [accessToken, setAccessToken] = useState(
        () => localStorage.getItem("accessToken")
    );

    // Save user session after successful authentication
    const saveSession = (data) => {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        setUser(data.user);
        setAccessToken(data.accessToken);
    };

    // Register a new complainant
    const register = async (formData) => {
        const data = await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(formData)
        });

        saveSession(data);
        return data;
    };

    // Authenticate existing user
    const login = async (credentials) => {
        const data = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials)
        });

        saveSession(data);
        return data;
    };

    // Logout and clear local session
    const logout = async () => {
        const refreshToken = localStorage.getItem("refreshToken");

        try {
            if (refreshToken) {
                await apiRequest("/auth/logout", {
                    method: "POST",
                    body: JSON.stringify({ refreshToken })
                });
            }
        } finally {
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            setUser(null);
            setAccessToken(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isAuthenticated: Boolean(user && accessToken),
                register,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for accessing authentication context
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};
