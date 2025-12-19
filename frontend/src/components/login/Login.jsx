import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("vaultcore_accessToken");
        if (token) {
            navigate("/welcome");
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8080/login", {
                username,
                password,
            });

            if (response.data.accessToken) {
                localStorage.setItem("vaultcore_accessToken", response.data.accessToken);
                localStorage.setItem("vaultcore_refreshToken", response.data.refreshToken);
            } else if (response.data.token) {
                // Fallback for legacy token response
                localStorage.setItem("vaultcore_accessToken", response.data.token);
            } else {
                throw new Error("Authentication failed: No token received");
            }

            navigate("/welcome");

        } catch (err) {
            console.error("Login error:", err);
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                <h1 className="text-2xl font-semibold text-gray-800 text-center mb-2">VaultCore</h1>
                <p className="text-gray-500 text-center mb-6 text-sm">Sign in to your account</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;