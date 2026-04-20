import {
  Activity as ActivityIcon,
  LayoutDashboard as DashboardIcon,
  LineChart as SignalsIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Dashboard", icon: DashboardIcon, path: "/dashboard" },
    { name: "Signals", icon: SignalsIcon, path: "/signals" },
    { name: "History", icon: HistoryIcon, path: "/history" },
    { name: "Settings", icon: SettingsIcon, path: "/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/auth");
  };

  return (
    <div className="w-64 bg-surface h-screen fixed left-0 top-0 border-r border-white/5 flex flex-col pt-8 pb-6 px-4">
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="bg-primary/20 p-2 rounded-lg text-primary">
          <ActivityIcon className="w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">
          AutoTrade
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {menu.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/dashboard" && location.pathname === "/");
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 text-left",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-primary" : "text-muted",
                )}
              />
              {item.name}
            </button>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:bg-danger/10 hover:text-danger transition duration-200 text-left mt-auto"
      >
        <LogOutIcon className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}
