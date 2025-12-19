import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Welcome() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("vaultcore_accessToken");
        if (!token) {
            console.log("No token found, kicking out! 🚫");
            navigate("/");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("vaultcore_accessToken");
        localStorage.removeItem("vaultcore_refreshToken");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">

                <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                    VaultCore
                </h1>

                <p className="text-gray-600 text-sm mb-6">
                    You are logged in successfully.
                </p>

                <div className="border-t border-gray-200 pt-6">
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition"
                    >
                        Logout
                    </button>
                </div>

            </div>
        </div>

    );
}

export default Welcome;