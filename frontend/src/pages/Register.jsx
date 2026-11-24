
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
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
            await register(formData);
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

                <h1>Create your account</h1>
                <p className="auth-subtitle">
                    Join CampusVoice and make your voice heard.
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Full name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

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
                        placeholder="Minimum 6 characters"
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already registered? <Link to="/login">Sign in</Link>
                </p>
            </section>
        </main>
    );
};

export default Register;
