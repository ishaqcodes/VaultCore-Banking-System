import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StockChart from "../components/StockChart";

export default function Dashboard() {
    const navigate = useNavigate();

    // State for User Data & History
    const [user, setUser] = useState({ username: "Loading...", currentBalance: 0, accountNumber: "---" });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for Transfer Money Feature
    const [transferStep, setTransferStep] = useState(1); // 1 = Input Details, 2 = Verify OTP
    const [transferData, setTransferData] = useState({ receiverAccount: "", amount: "", otp: "" });
    const [transferLoading, setTransferLoading] = useState(false);

    // State for Stock Feature
    const [stockQty, setStockQty] = useState(1);

    // State for UI Toggles
    const [showProfile, setShowProfile] = useState(false);

    // Auth Token
    const token = localStorage.getItem("accessToken");

    // --- 1. Initial Data Fetching ---
    const fetchDashboardData = useCallback(async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Execute calls in parallel for better performance
            const [accRes, histRes] = await Promise.all([
                axios.get("/api/account/my-balance", config),
                axios.get("/api/transaction/history", config)
            ]);

            setUser(accRes.data);
            setTransactions(histRes.data);
        } catch (err) {
            console.error("Dashboard Load Error:", err);
            if (err.response?.status === 403 || err.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // --- 2. Action Handlers ---

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const handleInputChange = (e) => {
        setTransferData({ ...transferData, [e.target.name]: e.target.value });
    };

    // Transfer Step 1: Request OTP
    const initiateTransfer = async (e) => {
        e.preventDefault();
        setTransferLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Optional: You can validate account existence here before sending OTP
            await axios.post("/api/transaction/request-transfer-otp", {}, config);

            alert("OTP has been sent to your registered email.");
            setTransferStep(2);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to initiate transfer.");
        } finally {
            setTransferLoading(false);
        }
    };

    // Transfer Step 2: Confirm Transaction
    const confirmTransfer = async () => {
        setTransferLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post("/api/transaction/transfer",
                {
                    receiverAccount: transferData.receiverAccount,
                    amount: Number(transferData.amount),
                    otp: transferData.otp
                },
                config
            );

            alert("Transfer Successful! 💸");

            // Reset Form and Refresh Data
            setTransferData({ receiverAccount: "", amount: "", otp: "" });
            setTransferStep(1);
            fetchDashboardData();
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Transfer failed. Check OTP or Balance.";
            alert(errorMsg);
        } finally {
            setTransferLoading(false);
        }
    };

    // Buy Stock Logic
    const handleBuyStock = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const qty = parseInt(stockQty);
            if (isNaN(qty) || qty <= 0) { alert("Invalid quantity."); return; }

            await axios.post("/api/stocks/buy",
                { symbol: "VAULT", quantity: qty, price: "100.00" }, // Price is usually dynamic, hardcoded for demo
                config
            );

            alert(`Successfully purchased ${qty} VAULT stocks.`);
            fetchDashboardData(); // Update balance immediately
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || "Purchase failed.";
            alert(errorMsg);
        }
    };

    // Download PDF Statement
    const downloadPDF = async () => {
        try {
            const res = await axios.get("/api/transaction/download-pdf", {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' // Important for file downloads
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Statement_${user.username}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Failed to generate PDF statement.");
        }
    };

    // --- 3. Render ---
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">

            {/* --- Profile Modal (Absolute) --- */}
            {showProfile && (
                <div className="absolute top-20 right-4 md:right-10 z-50 bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 w-80 animate-fade-in-down">
                    <div className="flex justify-between items-center mb-6 border-b pb-2">
                        <h3 className="font-bold text-lg text-slate-800">User Profile</h3>
                        <button onClick={() => setShowProfile(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">&times;</button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Username</p>
                            <p className="font-semibold text-slate-800 truncate" title={user.username}>{user.username}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Account Number</p>
                            <p className="font-mono text-blue-600 font-bold text-lg">{user.accountNumber}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-sm font-bold text-green-700">Status: Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Top Navbar --- */}
            <nav className="flex justify-between items-center bg-white px-6 py-4 shadow-sm border-b border-slate-200 sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">V</div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">VaultCore</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div
                        onClick={() => setShowProfile(!showProfile)}
                        className="cursor-pointer flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-full transition select-none"
                    >
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                            {user.username?.charAt(0).toUpperCase()}
                        </span>
                        <span className="hidden md:block text-sm font-semibold text-slate-600">My Account ▾</span>
                    </div>
                    <button onClick={handleLogout} className="text-sm font-semibold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition">
                        Logout
                    </button>
                </div>
            </nav>

            {/* --- Main Grid Content --- */}
            <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- Left Column: Finances & Transfer --- */}
                <div className="lg:col-span-1 space-y-8">

                    {/* 1. Balance Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        {/* Decorative Circle */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>

                        <p className="text-sm font-medium opacity-80 mb-1">Total Available Balance</p>
                        <h2 className="text-4xl font-bold mb-8">₹ {user.currentBalance?.toLocaleString('en-IN')}</h2>

                        <button
                            onClick={downloadPDF}
                            className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl text-sm font-semibold backdrop-blur-sm transition flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Download Statement
                        </button>
                    </div>

                    {/* 2. Transfer Money Widget */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800">Quick Transfer</h3>
                            <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                {transferStep === 1 ? "Step 1/2" : "Step 2/2"}
                            </span>
                        </div>

                        {transferStep === 1 ? (
                            <form onSubmit={initiateTransfer} className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-500 font-bold ml-1">RECEIVER ACCOUNT</label>
                                    <input
                                        name="receiverAccount"
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                        placeholder="ACC-XXXX-XXXX"
                                        value={transferData.receiverAccount}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-bold ml-1">AMOUNT (₹)</label>
                                    <input
                                        name="amount"
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                                        placeholder="0.00"
                                        value={transferData.amount}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={transferLoading}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-70"
                                >
                                    {transferLoading ? "Sending OTP..." : "Proceed to Verify"}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-5">
                                <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg text-center border border-yellow-100">
                                    🔒 OTP sent to email.
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-bold ml-1">ENTER OTP</label>
                                    <input
                                        name="otp"
                                        className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:border-green-500 outline-none transition"
                                        placeholder="••••••"
                                        maxLength={6}
                                        value={transferData.otp}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <button
                                    onClick={confirmTransfer}
                                    disabled={transferLoading}
                                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition disabled:opacity-70"
                                >
                                    {transferLoading ? "Processing..." : "Confirm Transfer"}
                                </button>
                                <button onClick={() => setTransferStep(1)} className="w-full text-slate-500 text-sm hover:underline">
                                    Cancel & Go Back
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Right Column: Stocks & History --- */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 3. Market Section */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Market Trends</h3>
                                <p className="text-xs text-slate-400">Real-time value of VAULT Index</p>
                            </div>

                            {/* Simple Buy Widget */}
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                <input
                                    type="number"
                                    min="1"
                                    value={stockQty}
                                    onChange={e => setStockQty(e.target.value)}
                                    className="w-16 bg-transparent text-center font-bold text-slate-700 outline-none"
                                />
                                <button
                                    onClick={handleBuyStock}
                                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                                >
                                    Buy Stock
                                </button>
                            </div>
                        </div>

                        {/* Chart Component */}
                        <div className="h-64 w-full">
                            <StockChart />
                        </div>
                    </div>

                    {/* 4. Transaction History */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4">Recent Activity</h3>
                        <div className="overflow-hidden rounded-xl border border-slate-100">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Description</th>
                                        <th className="p-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.length > 0 ? transactions.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition">
                                            <td className="p-4 text-slate-500 font-medium">
                                                {new Date(t.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="p-4 text-slate-700 font-semibold">{t.status}</td>
                                            <td className={`p-4 text-right font-bold ${t.senderAccountId === user.id ? 'text-red-500' : 'text-green-600'
                                                }`}>
                                                {t.senderAccountId === user.id ? '-' : '+'} ₹{t.amount}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="text-center p-8 text-slate-400">
                                                No transactions found yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}