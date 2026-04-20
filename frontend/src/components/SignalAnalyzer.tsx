import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Zap, AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";

// Maps display labels → ticker symbols TradingAgents/yfinance understands
const ASSETS = [
  { label: "BTC / USD", ticker: "BTC-USD" },
  { label: "ETH / USD", ticker: "ETH-USD" },
  { label: "SOL / USD", ticker: "SOL-USD" },
  { label: "EUR / USD", ticker: "EURUSD=X" },
  { label: "SPY", ticker: "SPY" },
  { label: "AAPL", ticker: "AAPL" },
];

export default function SignalAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [asset, setAsset] = useState(ASSETS[0].ticker);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const formatElapsed = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const userId = localStorage.getItem("userId");
      const res = await axios.post(
        "http://localhost:4000/analyze",
        { asset, userId },
        { timeout: 600_000 },
      );
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-white/5 p-6 shadow-xl h-full flex flex-col">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        AI Signal Generator
      </h2>

      <div className="space-y-4 mb-6 relative z-10">
        <div>
          <label className="block text-sm text-muted mb-2">Asset</label>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="w-full bg-background border border-white/10 rounded-lg p-3 outline-none focus:border-primary text-white"
          >
            {ASSETS.map((a) => (
              <option key={a.ticker} value={a.ticker}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full py-3 mt-2 bg-primary text-background font-bold rounded-lg hover:bg-primary-light transition-colors relative overflow-hidden group"
        >
          <span className={cn("relative z-10", loading && "opacity-0")}>
            Analyze Market
          </span>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
              <span className="text-background text-xs font-mono">
                {formatElapsed(elapsed)}
              </span>
            </div>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-auto p-4 rounded-lg bg-danger/10 border border-danger/20 flex gap-3 text-danger text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-auto pt-6 border-t border-white/5 transition-all duration-500">
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted">Recommendation</span>
            <span
              className={cn(
                "px-3 py-1 text-sm font-bold rounded-full uppercase tracking-widest",
                result.signal === "buy"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : result.signal === "sell"
                    ? "bg-danger/20 text-danger border border-danger/30"
                    : "bg-white/10 text-white border border-white/20",
              )}
            >
              {result.signal}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted">Confidence Score</span>
              <span className="font-mono">{result.confidence}%</span>
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${result.confidence}%` }}
              ></div>
            </div>
          </div>

          <div className="p-3 bg-background rounded-lg text-sm text-gray-300 leading-relaxed border border-white/5">
            {result.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
