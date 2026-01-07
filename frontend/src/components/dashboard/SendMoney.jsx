import React, { useState } from 'react';
import axios from 'axios';

function SendMoney({ onTransactionSuccess }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ receiverAccount: '', amount: '' });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTransfer = async () => {
        setMessage('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem("accessToken");

            // Validate input before sending
            if (!formData.amount || formData.amount <= 0) {
                setMessage("Please enter a valid amount.");
                setIsLoading(false);
                return;
            }

            await axios.post('/api/transaction/transfer',
                {
                    // Ensure field names match your Backend DTO expectation
                    receiverAccountNumber: formData.receiverAccount, // Mapped to backend expectation if needed
                    amount: formData.amount
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (onTransactionSuccess) {
                onTransactionSuccess();
            }

            setStep(3); // Move to Success Screen

        } catch (error) {
            console.error("Transfer Error", error);
            // Attempt to show the specific error message sent from the Backend
            const errorMsg = error.response?.data?.message || "Transaction Failed. Please check your balance or receiver ID.";
            setMessage(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Fund Transfer</h2>

            {/* Step 1: Enter Receiver Details */}
            {step === 1 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Receiver Account Number</label>
                    <input
                        name="receiverAccount"
                        type="text"
                        className="mt-1 border p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                        onChange={handleChange}
                        value={formData.receiverAccount}
                        placeholder="ACC-XXXX"
                    />
                    <button
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded w-full transition duration-200"
                        onClick={() => {
                            if (formData.receiverAccount) setStep(2);
                            else setMessage("Please enter an account number.");
                        }}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Step 2: Enter Amount */}
            {step === 2 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                    <input
                        name="amount"
                        type="number"
                        className="mt-1 border p-2 w-full rounded focus:ring-green-500 focus:border-green-500"
                        onChange={handleChange}
                        value={formData.amount}
                        placeholder="0.00"
                    />
                    <div className="flex space-x-2 mt-4">
                        <button
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded w-1/3"
                            onClick={() => setStep(1)}
                        >
                            Back
                        </button>
                        <button
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded w-2/3 transition duration-200"
                            onClick={handleTransfer}
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Confirm Transfer"}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Success Confirmation */}
            {step === 3 && (
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">Transfer Successful!</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Money has been sent to {formData.receiverAccount}.
                    </p>
                    <button
                        onClick={() => {
                            setStep(1);
                            setFormData({ receiverAccount: '', amount: '' });
                            setMessage('');
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium mt-4"
                    >
                        Make another transfer
                    </button>
                </div>
            )}

            {/* Error Message Display */}
            {message && (
                <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                    {message}
                </div>
            )}
        </div>
    );
}

export default SendMoney;