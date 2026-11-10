
import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password1: "",
        password2: ""
    });

    const [loading, setLoading] = useState(false);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password1 !== formData.password2) {
            toast.error("Passwords do not match!");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/register/", formData);

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("username", response.data.username);

            setFormData({
                username: "",
                email: "",
                password1: "",
                password2: ""
            });

            toast.success("Registration successful! Welcome!");

            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 1000);

        } catch (error) {
            console.error("Registration error:", error);

            const errorData = error.response?.data;

            if (errorData && typeof errorData === "object") {
                const messages = Object.values(errorData)
                    .flat()
                    .filter(Boolean);

                toast.error(
                    messages.join(" ") || "Registration failed!"
                );
            } else {
                toast.error(
                    "Registration failed. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">

            <div className="register-card">

                <h2>Create Account</h2>

                <form onSubmit={handleSubmit}>

                    <input
                        name="username"
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />

                    <input
                        name="password1"
                        type="password"
                        placeholder="Password"
                        value={formData.password1}
                        onChange={handleChange}
                        minLength={8}
                        required
                        disabled={loading}
                    />

                    <input
                        name="password2"
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.password2}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>

                </form>

                <Link
                    to="/login"
                    className="register-login-link"
                >
                    Already have an account? Login
                </Link>

            </div>

        </div>
    );
}

export default Register;
