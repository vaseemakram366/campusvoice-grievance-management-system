
const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Send API requests and handle access-token refresh
export const apiRequest = async (endpoint, options = {}) => {
    const accessToken = localStorage.getItem("accessToken");

    const sendRequest = (token) => {
        return fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers
            }
        });
    };

    let response = await sendRequest(accessToken);

    // Attempt token refresh if access token has expired
    if (
        response.status === 401 &&
        !["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].includes(endpoint)
    ) {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
            try {
                const refreshResponse = await fetch(
                    `${API_BASE_URL}/auth/refresh`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refreshToken })
                    }
                );

                const refreshData = await refreshResponse.json();

                if (refreshResponse.ok) {
                    localStorage.setItem("accessToken", refreshData.accessToken);
                    localStorage.setItem("refreshToken", refreshData.refreshToken);

                    // Retry original request with new access token
                    response = await sendRequest(refreshData.accessToken);
                } else {
                    localStorage.clear();
                    window.location.href = "/login";
                    throw new Error("Session expired. Please log in again.");
                }
            } catch (error) {
                if (error.message.includes("Session expired")) {
                    throw error;
                }

                throw new Error("Unable to refresh your session.");
            }
        }
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};
