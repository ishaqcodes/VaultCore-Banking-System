import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
    const navigate = useNavigate();

    // State Management
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify & Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" }); // type: 'success' | 'error'

    // Helper to reset messages
    const clearMessage = () => setMessage({ type: "", text: "" });

    // Step 1: Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        clearMessage();

        try {
            await axios.post("http://localhost:8080/api/auth/signup-request", { email });
            setMessage({ type: "success", text: "OTP sent successfully! (Check server console)" });
            setStep(2);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to send OTP. Please try again.";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP & Create Account
    const handleVerifySignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        clearMessage();

        try {
            await axios.post("http://localhost:8080/api/auth/signup-verify", {
                email,
                otp,
                password
            });

            setMessage({ type: "success", text: "Account created! Redirecting to login..." });

            // Short delay before redirect so user can see success message
            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            const errorMsg = err.response?.data?.message || "Signup Failed. Invalid OTP or server error.";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100 font-sans">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-200">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-blue-800">Create Account</h2>
                    <p className="text-sm text-gray-500">Join VaultCore Banking today</p>
                </div>

                {/* Status Message Area */}
                {message.text && (
                    <div className={`mb-4 p-3 rounded text-sm text-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                {step === 1 ? (
                    /* STEP 1 FORM */
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full text-white py-3 rounded-lg font-bold transition shadow-md
                                ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            {loading ? "Sending OTP..." : "Get OTP Verification Code"}
                        </button>
                    </form>
                ) : (
                    /* STEP 2 FORM */
                    <form onSubmit={handleVerifySignup} className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded border border-blue-100 text-sm text-blue-800 text-center mb-2">
                            Enter the OTP sent to <span className="font-bold">{email}</span>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="block w-full text-xs text-blue-500 underline mt-1 hover:text-blue-700"
                            >
                                Change Email
                            </button>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-1">Enter OTP</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 p-3 rounded-lg text-center tracking-widest text-lg font-mono focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="123456"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-1">Set Password</label>
                            <input
                                type="password"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full text-white py-3 rounded-lg font-bold transition shadow-md
                                ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                        >
                            {loading ? "Creating Account..." : "Complete Registration"}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center text-sm pt-4 border-t border-gray-100">
                    <p className="text-gray-600">Already have an account?</p>
                    <Link to="/login" className="text-blue-600 font-bold hover:underline">
                        Log in here
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;