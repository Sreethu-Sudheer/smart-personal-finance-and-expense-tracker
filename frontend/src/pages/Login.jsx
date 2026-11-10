
import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post("/login/", {
                username,
                password
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("username", response.data.username);

            toast.success("Login successful!");

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (error) {
            console.error(error);

            const errorData = error.response?.data;

            if (errorData && typeof errorData === "object") {
                const messages = Object.values(errorData)
                    .flat()
                    .filter(Boolean);

                toast.error(
                    messages.join(" ") || "Invalid username or password!"
                );
            } else {
                toast.error("Login failed. Please try again.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Login</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <Link to="/register" className="register-login-link">
                    Create Account
                </Link>
            </div>
        </div>
    );
}

export default Login;
