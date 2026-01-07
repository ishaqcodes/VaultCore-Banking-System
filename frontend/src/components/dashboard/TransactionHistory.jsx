import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TransactionHistory({ refreshTrigger, myAccountId }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem("accessToken");

            try {
                const response = await axios.get('/api/transaction/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setTransactions(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching transaction history:", err);
                setError("Failed to load transactions.");
                setLoading(false);
            }
        };

        fetchHistory();
    }, [refreshTrigger, myAccountId]);

    // Format date helper function
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className="p-6 text-gray-500">Loading history...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
            <h3 className="text-gray-700 text-lg font-semibold mb-4">
                Transaction History <span className="text-gray-400 text-sm">({transactions.length})</span>
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((txn) => {
                                // strict comparison ensures no type coercion errors
                                const isSent = String(txn.senderAccountId) === String(myAccountId);

                                return (
                                    <tr key={txn.id} className="bg-white border-b hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4 font-medium">
                                            {isSent ? (
                                                <span className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded w-fit">
                                                    Debited ↗
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                                                    Credited ↙
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            ₹ {txn.amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-600 font-medium">
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {formatDate(txn.timestamp)}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        <p>No transactions found.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TransactionHistory;