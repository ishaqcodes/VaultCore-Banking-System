import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    // State management
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Ensure this URL matches your Spring Boot configuration
            const response = await axios.post("http://localhost:8080/api/auth/login", {
                email,
                password
            });

            if (response.data.accessToken) {
                // Store critical auth data
                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem("username", response.data.username);

                // Redirect to dashboard
                navigate("/dashboard");
            }
        } catch (err) {
            console.error("Login Failed:", err);
            // safe error message extraction
            const errorMsg = err.response?.data?.message || "Invalid email or password. Please try again.";
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-200">

                {/* Header Section */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight">VaultCore</h1>
                    <p className="text-sm text-gray-500 mt-2">Secure Banking Portal</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="user@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white py-3 rounded-lg font-bold shadow-md transition transform active:scale-95
                            ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        {isLoading ? "Authenticating..." : "Login"}
                    </button>
                </form>

                {/* Signup Redirection */}
                <div className="mt-8 text-center pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-2">New to VaultCore?</p>
                    <Link
                        to="/signup"
                        className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition"
                    >
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;