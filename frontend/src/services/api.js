
const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Prevent multiple simultaneous token refresh requests
let refreshPromise = null;

// Authentication endpoints
const AUTH_ENDPOINTS = [
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/logout"
];

// Remove authentication tokens
const clearAuthTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    window.dispatchEvent(
        new Event("campusvoice:session-cleared")
    );
};

// Parse API responses safely
const parseResponse = async (response) => {
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        return {
            message: "Invalid server response"
        };
    }
};

// Refresh access token
const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        throw new Error("Session expired. Please log in again.");
    }

    const refreshResponse = await fetch(
        `${API_BASE_URL}/auth/refresh`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ refreshToken })
        }
    );

    const refreshData = await parseResponse(refreshResponse);

    if (!refreshResponse.ok) {
        if (
            refreshResponse.status === 401 ||
            refreshResponse.status === 403
        ) {
            clearAuthTokens();
            localStorage.removeItem("user");
            window.location.href = "/login";

            throw new Error("Session expired. Please log in again.");
        }

        throw new Error(
            refreshData.message || "Unable to refresh your session."
        );
    }

    if (!refreshData.accessToken || !refreshData.refreshToken) {
        clearAuthTokens();
        localStorage.removeItem("user");
        window.location.href = "/login";

        throw new Error("Invalid refresh response. Please log in again.");
    }

    localStorage.setItem("accessToken", refreshData.accessToken);
    localStorage.setItem("refreshToken", refreshData.refreshToken);

    // Notify AuthContext about the refreshed token
    window.dispatchEvent(
        new Event("campusvoice:token-refreshed")
    );

    return refreshData.accessToken;
};

// Send API requests and handle access-token refresh
export const apiRequest = async (endpoint, options = {}) => {
    const sendRequest = (token) => {
        return fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
                ...(token && {
                    Authorization: `Bearer ${token}`
                })
            }
        });
    };

    let accessToken = localStorage.getItem("accessToken");

    let response = await sendRequest(accessToken);

    // Attempt token refresh if access token has expired
    if (
        response.status === 401 &&
        !AUTH_ENDPOINTS.includes(endpoint)
    ) {
        if (!refreshPromise) {
            refreshPromise = refreshAccessToken().finally(() => {
                refreshPromise = null;
            });
        }

        accessToken = await refreshPromise;

        // Retry original request with the new token
        response = await sendRequest(accessToken);
    }

    const data = await parseResponse(response);

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};
