"use client";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [token, setToken] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [history, setHistory] = useState<{ date: string; price: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    if (!token) return;

    setLoading(true);
    setPrice(null);
    setTimestamp(null);
    setHistory([]);
    setError(null);

    try {
      const priceRes = await fetch(`http://localhost:5000/api/price`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token.toLowerCase(),
          network: "ethereum",
          timestamp: Math.floor(Date.now() / 1000),
        }),
      });

      const priceData = await priceRes.json();
      if (!priceRes.ok) throw new Error(priceData.error || "Price fetch failed");

      setPrice(priceData.price);
      setTimestamp(priceData.timestamp);

      const now = Math.floor(Date.now() / 1000);
      const oneDay = 86400;
      const sevenDaysAgo = now - 7 * oneDay;

      const historyPromises = Array.from({ length: 7 }, (_, i) => {
        const ts = sevenDaysAgo + i * oneDay;
        return fetch(`http://localhost:5000/api/price`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: token.toLowerCase(), network: "ethereum", timestamp: ts }),
        })
          .then((res) => res.json())
          .then((data) => ({ timestamp: ts, price: data.price || 0 }))
          .catch(() => ({ timestamp: ts, price: 0 }));
      });

      const historyData = await Promise.all(historyPromises);
      const formatted = historyData.map(({ timestamp, price }) => ({
        date: new Date(timestamp * 1000).toLocaleDateString(),
        price: parseFloat(price.toFixed(2)),
      }));

      setHistory(formatted);
    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err?.message || "Failed to fetch price.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-6 bg-white dark:bg-black text-black dark:text-white">
      <img
        src="/crypto.png"
        alt="Crypto Logo"
        width={100}
        height={100}
        className="mb-6"
      />

      <div className="w-full max-w-md bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
        <h1 className="text-xl font-semibold text-center">Token Price Checker</h1>

        <input
          type="text"
          placeholder="Enter token address (e.g., 0x...)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={fetchPrice}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? "Fetching..." : "Get Price"}
        </button>

        {price && (
          <div className="text-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 p-3 rounded-md">
            Price: ${price}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              As of: {timestamp && new Date(timestamp * 1000).toLocaleString()}
            </p>
          </div>
        )}

        {error && (
          <div className="text-center bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-md">
            {error}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="w-full max-w-xl mt-10 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Real Price Chart (Last 7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
