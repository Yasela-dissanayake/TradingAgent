import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  History,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "../lib/utils";
import API_BASE from "../lib/api";

interface Signal {
  id: string;
  asset: string;
  signal: string;
  confidence: number;
  explanation: string;
  created_at: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy AI analysis to clipboard"
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200",
        copied
          ? "bg-primary/20 text-primary"
          : "bg-white/5 text-muted hover:bg-white/10 hover:text-white",
      )}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

function SignalRow({ item }: { item: Signal }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      {/* Summary row — click to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 py-4 hover:bg-white/[0.02] transition-colors text-left px-2 rounded-lg"
      >
        {/* Asset */}
        <span className="font-semibold text-sm w-24 shrink-0">
          {item.asset}
        </span>

        {/* Signal badge */}
        <span
          className={cn(
            "px-2 py-1 text-xs font-bold rounded-md uppercase w-16 text-center shrink-0",
            item.signal === "buy"
              ? "bg-primary/10 text-primary"
              : item.signal === "sell"
                ? "bg-danger/10 text-danger"
                : "bg-white/10 text-white",
          )}
        >
          {item.signal}
        </span>

        {/* Confidence bar */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-mono text-muted w-8 shrink-0">
            {item.confidence}%
          </span>
          <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                item.signal === "buy"
                  ? "bg-primary"
                  : item.signal === "sell"
                    ? "bg-danger"
                    : "bg-white/30",
              )}
              style={{ width: `${item.confidence}%` }}
            />
          </div>
        </div>

        {/* Date */}
        <span className="text-xs text-muted shrink-0">
          {new Date(item.created_at).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>

        {/* Expand chevron */}
        <span className="text-muted shrink-0">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* Expanded AI explanation */}
      {expanded && (
        <div className="px-2 pb-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted uppercase tracking-widest">
                AI Analysis
              </span>
              <CopyButton text={item.explanation} />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {item.explanation || "No explanation available."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TradeHistory() {
  const [history, setHistory] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API_BASE}/signals?userId=${userId}`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="bg-surface rounded-2xl border border-white/5 p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Signal History
        </h2>
        <button
          onClick={fetchHistory}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted hover:text-white"
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <p className="py-8 text-center text-muted text-sm">
          No signals generated yet. Run your first analysis above!
        </p>
      ) : (
        <div>
          {/* Column headers */}
          <div className="flex items-center gap-4 px-2 pb-2 text-xs text-muted uppercase tracking-wider border-b border-white/5 mb-1">
            <span className="w-24 shrink-0">Asset</span>
            <span className="w-16 shrink-0">Signal</span>
            <span className="flex-1">Confidence</span>
            <span className="shrink-0">Date</span>
            <span className="w-4 shrink-0" />
          </div>
          {history.map((item) => (
            <SignalRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
