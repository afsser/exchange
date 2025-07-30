
"use client";
import Image from "next/image";
import React, { useState } from "react";


export default function Home() {
  // Currency list for select options (can be expanded)
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
      setResult(`${data.amount} ${data.base} = ${data.rates[to]} ${to}`);
    } catch (err: any) {
      setError("Conversion failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <h1 className="text-2xl font-bold mb-4 text-center sm:text-left">Currency Converter</h1>
        <div className="w-full max-w-md bg-background border border-black/[.08] dark:border-white/[.145] rounded-lg p-6 shadow flex flex-col gap-6">
          <form className="flex flex-col gap-4" onSubmit={handleConvert}>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                step={0.01}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded border border-black/[.08] dark:border-white/[.145] bg-background text-foreground"
                placeholder="Amount"
                required
              />
              <select
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="px-3 py-2 rounded border border-black/[.08] dark:border-white/[.145] bg-background text-foreground"
              >
                {currencies.map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
              <span className="px-2 self-center">→</span>
              <select
                value={to}
                onChange={e => setTo(e.target.value)}
                className="px-3 py-2 rounded border border-black/[.08] dark:border-white/[.145] bg-background text-foreground"
              >
                {currencies.map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="mt-2 px-4 py-2 rounded bg-foreground text-background font-semibold hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
              disabled={loading}
            >
              {loading ? "Converting..." : "Convert"}
            </button>
          </form>
          <div className="text-center text-base text-foreground min-h-[32px]">
            {error ? <span className="text-red-500">{error}</span> : result ? <span className="font-bold">{result}</span> : "Enter the data to calculate the conversion."}
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-xs text-foreground/70">
        <span>© {new Date().getFullYear()} Currency Converter</span>
      </footer>
    </div>
  );
}
