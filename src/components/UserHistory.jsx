import React, { useState } from "react";
import axios from "axios";

const UserHistory = () => {
  const [serialNumber, setSerialNumber] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!serialNumber) {
      setError("Please enter a serial number.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTransaction(null);

      const response = await axios.get(
        "http://localhost:8080/api/v1/user/history",
        {
          params: {
            serialNumber: serialNumber, // Gửi serialNumber qua query string
          },
        }
      );

      setTransaction(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch transaction: " + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Transaction by Serial Number</h1>

      {/* Input tìm kiếm theo serialNumber */}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          className="border p-2 rounded mr-2"
          placeholder="Enter serial number"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Hiển thị kết quả giao dịch */}
      {transaction ? (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Order ID</th>
              <th className="border border-gray-300 p-2">Serial Number</th>
              <th className="border border-gray-300 p-2">Total Price (VNĐ)</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Created At</th>
              <th className="border border-gray-300 p-2">Received At</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">{transaction.orderId}</td>
              <td className="border border-gray-300 p-2">{transaction.serialNumber}</td>
              <td className="border border-gray-300 p-2">{transaction.totalPrice.toLocaleString()}</td>
              <td className="border border-gray-300 p-2">{transaction.status}</td>
              <td className="border border-gray-300 p-2">{new Date(transaction.createdAt).toLocaleString()}</td>
              <td className="border border-gray-300 p-2">{transaction.receivedAt ? new Date(transaction.receivedAt).toLocaleString() : "N/A"}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        !error && <p>No transaction found. Please search with a serial number.</p>
      )}
    </div>
  );
};

export default UserHistory