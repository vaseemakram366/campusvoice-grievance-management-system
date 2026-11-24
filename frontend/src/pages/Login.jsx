
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(formData);
            navigate("/dashboard");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="brand">
                    <span className="brand-icon">CV</span>
                    <span>CampusVoice</span>
                </div>

                <h1>Welcome back</h1>
                <p className="auth-subtitle">
                    Sign in to manage your campus grievances.
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Create account</Link>
                </p>
            </section>
        </main>
    );
};

export default Login;
