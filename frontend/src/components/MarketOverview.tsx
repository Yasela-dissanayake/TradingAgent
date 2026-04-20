import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../lib/utils";

export default function MarketOverview() {
  const assets = [
    { symbol: "BTC/USD", price: "$64,230.50", change: "+2.4%", trend: "up" },
    { symbol: "ETH/USD", price: "$3,450.20", change: "+1.2%", trend: "up" },
    { symbol: "SOL/USD", price: "$145.80", change: "-0.8%", trend: "down" },
    { symbol: "EUR/USD", price: "$1.0845", change: "0.0%", trend: "flat" },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-white/5 p-6 shadow-xl h-full">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        Market Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.symbol}
            className="p-4 rounded-xl bg-background border border-white/5 hover:border-primary/50 transition-colors duration-300 flex justify-between items-center group cursor-pointer"
          >
            <div>
              <p className="font-bold text-lg">{asset.symbol}</p>
              <p className="text-muted text-sm tracking-wider font-mono mt-1">
                {asset.price}
              </p>
            </div>

            <div className="flex flex-col items-end">
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md",
                  asset.trend === "up"
                    ? "text-primary bg-primary/10"
                    : asset.trend === "down"
                      ? "text-danger bg-danger/10"
                      : "text-muted bg-white/5",
                )}
              >
                {asset.trend === "up" && <TrendingUp className="w-4 h-4" />}
                {asset.trend === "down" && <TrendingDown className="w-4 h-4" />}
                {asset.trend === "flat" && <Minus className="w-4 h-4" />}
                {asset.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
