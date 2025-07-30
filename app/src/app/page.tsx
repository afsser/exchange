"use client";
import React, { useState } from "react";

export default function Home() {
  const currencies = ["USD", "EUR", "GBP", "BRL", "JPY", "AUD", "CAD", "CHF", "CNY"];

  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/convert?amount=${amount}&from=${from}&to=${to}`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(`${data.amount} ${data.base} = ${data.rates[to].toFixed(2)} ${to}`);
    } catch {
      setError("Conversion failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Currency Converter
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleConvert} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter amount"
                required
              />
            </div>

            {/* Currency Selectors */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From
                </label>
                <select
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To
                </label>
                <select
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Convert Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Converting...
                </span>
              ) : (
                "Convert Currency"
              )}
            </button>
          </form>

          {/* Result Display */}
          <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 min-h-[60px] flex items-center justify-center">
            {error ? (
              <p className="text-red-600 dark:text-red-400 text-center font-medium">
                ❌ {error}
              </p>
            ) : result ? (
              <p className="text-green-600 dark:text-green-400 text-center font-bold text-lg">
                💰 {result}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Enter amount and currencies to see conversion
              </p>
            )}
          </div>
        </div>

        <footer className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Currency Converter
        </footer>
      </div>
    </div>
  );
}