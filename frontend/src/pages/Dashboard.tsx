import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MarketOverview from "../components/MarketOverview";
import SignalAnalyzer from "../components/SignalAnalyzer";
import TradeHistory from "../components/TradeHistory";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Add logic later if we want strict real auth token check via API
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/auth");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8 ml-64 transition-all duration-300">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Trading Dashboard
            </h1>
            <p className="text-muted mt-1">Real-time AI analysis and signals</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center font-bold shadow-[0_0_15px_rgba(0,195,154,0.3)]">
              US
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <MarketOverview />
          </div>
          <div>
            <SignalAnalyzer />
          </div>
        </div>

        <TradeHistory />
      </div>
    </div>
  );
}
