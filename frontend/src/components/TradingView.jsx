import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StockChart from './StockChart';

function TradingView() {
    // State management
    const [currentPrice, setCurrentPrice] = useState(100.00);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [portfolio, setPortfolio] = useState([]);
    const [error, setError] = useState(null);

    // Fetch user's current portfolio
    const fetchPortfolio = useCallback(async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            const res = await axios.get("/api/stocks/portfolio", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPortfolio(res.data);
        } catch (err) {
            console.error("Error fetching portfolio:", err);
        }
    }, []);

    // Effect: Simulate live price updates for the Buy Panel
    useEffect(() => {
        fetchPortfolio(); // Initial load

        const interval = setInterval(() => {
            // Simulates small price fluctuations around 100
            setCurrentPrice(prev => +(prev + (Math.random() * 2 - 1)).toFixed(2));
        }, 2000);

        return () => clearInterval(interval);
    }, [fetchPortfolio]);

    const handleBuy = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("accessToken");

            // Input validation
            if (quantity < 1) {
                alert("Please enter a valid quantity.");
                setLoading(false);
                return;
            }

            // API Call to Backend
            await axios.post("/api/stocks/buy",
                {
                    symbol: "VAULT",
                    quantity: parseInt(quantity),
                    price: currentPrice
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(`Success! Bought ${quantity} VAULT coins.`);
            fetchPortfolio(); // Refresh portfolio table immediately

        } catch (err) {
            console.error("Buy Transaction Failed", err);
            // Extract error message safely
            const errorMessage = err.response?.data?.message || err.response?.data || "Transaction Failed. Please check your balance.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Trading Engine</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Chart & Portfolio */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Live Chart Component */}
                    <StockChart />

                    {/* Portfolio Table */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">Your Portfolio</h2>

                        {portfolio.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p>No stocks owned yet.</p>
                                <p className="text-sm">Start trading to build your portfolio.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b text-gray-500 uppercase bg-gray-50">
                                            <th className="py-3 px-4">Symbol</th>
                                            <th className="py-3 px-4">Qty</th>
                                            <th className="py-3 px-4">Avg Price</th>
                                            <th className="py-3 px-4">Current Value (Est)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {portfolio.map((item) => (
                                            <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="py-3 px-4 font-bold text-gray-800">{item.stockSymbol}</td>
                                                <td className="py-3 px-4">{item.quantity}</td>
                                                <td className="py-3 px-4 text-gray-600">₹{item.avgBuyPrice}</td>
                                                <td className="py-3 px-4 text-green-600 font-medium">
                                                    {/* Estimating current value based on live price */}
                                                    ₹{(item.quantity * currentPrice).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Buy Panel */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit sticky top-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Buy Stock</h2>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-500">Symbol:</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-300">VAULT</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Live Price Display */}
                        <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <span className="text-blue-800 font-medium text-sm">Current Market Price</span>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-blue-700">₹{currentPrice}</span>
                                <span className="text-xs text-blue-500 animate-pulse">● Live Updates</span>
                            </div>
                        </div>

                        {/* Quantity Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Order Summary & Action */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between mb-4 text-gray-700">
                                <span>Estimated Cost</span>
                                <span className="font-bold text-lg">₹{(currentPrice * quantity).toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleBuy}
                                disabled={loading}
                                className={`w-full py-3 rounded-lg font-semibold text-white transition-all shadow-md
                                    ${loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-600 hover:bg-green-700 hover:shadow-lg active:scale-95"
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : "BUY NOW"}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default TradingView;